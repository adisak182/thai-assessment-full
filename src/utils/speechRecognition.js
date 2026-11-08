let closingRecognition = null;
const releaseListeners = new Set();
export const isMicrophoneReleasing = () => closingRecognition !== null;
export function subscribeMicrophoneRelease(listener) {
  releaseListeners.add(listener);
  return () => releaseListeners.delete(listener);
}
const notifyRelease = () => releaseListeners.forEach(listener => listener());

function abortAndWaitForEnd(recognition) {
  closingRecognition = recognition;
  const done = () => {
    clearTimeout(timer);
    recognition.onend = null;
    if (closingRecognition === recognition) { closingRecognition = null; notifyRelease(); }
  };
  // Some engines omit end after abort; allow an explicit retry instead of locking the UI.
  const timer = setTimeout(done, 3000);
  recognition.onend = done;
  notifyRelease();
  try { recognition.abort(); } catch { done(); }
}

const browserHelp = 'บน iPad/iPhone ให้เปิดเว็บด้วย Safari และเปิด Siri ในการตั้งค่าเครื่อง ส่วนคอมพิวเตอร์หรือ Android ให้ใช้ Chrome';

export function speechErrorMessage(code) {
  const messages = {
    unsupported: `เบราว์เซอร์นี้ยังใช้การรู้จำเสียงไม่ได้ ${browserHelp}`,
    timeout: `ระบบยังไม่เริ่มฟังเสียง กรุณาอนุญาตไมโครโฟนแล้วลองใหม่ ${browserHelp}`,
    'not-allowed': `ยังไม่ได้รับอนุญาตให้ใช้ไมโครโฟนหรือการรู้จำเสียง กรุณาตรวจสิทธิ์ของเว็บไซต์ ${browserHelp}`,
    'service-not-allowed': `บริการรู้จำเสียงถูกปิดหรือเบราว์เซอร์ไม่รองรับ ${browserHelp}`,
    'audio-capture': 'ไม่พบไมโครโฟนที่ใช้งานได้ กรุณาตรวจไมโครโฟนและปิดแอปอื่นที่กำลังใช้ไมค์ แล้วลองใหม่',
    'mic-releasing': 'กำลังปิดไมโครโฟนของข้อก่อนหน้า กรุณารอสักครู่แล้วกดเริ่มพูดอีกครั้ง',
    'mic-busy': 'เปิดไมโครโฟนไม่ได้ กรุณาปิดแอปอื่นที่ใช้ไมค์ ตรวจการตั้งค่าไมโครโฟน แล้วลองใหม่',
    network: 'เชื่อมต่อบริการรู้จำเสียงไม่ได้ กรุณาตรวจอินเทอร์เน็ตแล้วลองใหม่',
    'recognition-timeout': 'บริการแปลงเสียงไม่ตอบกลับ ระบบหยุดไมค์ให้แล้ว กรุณากดเริ่มพูดใหม่ คำตอบที่บันทึกไว้ยังอยู่',
    'no-speech': 'ยังไม่ได้ยินคำพูด กรุณากดเริ่มพูดใหม่และพูดใกล้ไมโครโฟน',
    'language-not-supported': 'บริการรู้จำเสียงบนอุปกรณ์นี้ยังไม่รองรับภาษาไทย กรุณาลองอัปเดตระบบหรือใช้อุปกรณ์อื่น',
    aborted: 'การฟังเสียงถูกขัดจังหวะ กรุณากดเริ่มพูดอีกครั้ง',
  };
  return messages[code] || 'เริ่มฟังเสียงไม่สำเร็จ กรุณาลองใหม่ หรือตรวจสิทธิ์ไมโครโฟนของเว็บไซต์';
}

export function createSpeechSession(Recognition, { onState, onResult, onError, onPreview = () => {} }) {
  let recognition, timer, phase = 'idle', closed = false, received = false;
  const release = (ended = false) => {
    if (closed) return;
    closed = true; clearTimeout(timer);
    if (recognition) {
      recognition.onstart = recognition.onaudiostart = recognition.onaudioend = recognition.onresult = recognition.onerror = recognition.onend = recognition.onnomatch = null;
      if (!ended) abortAndWaitForEnd(recognition);
    }
  };
  const finish = (error, ended = false) => {
    if (closed) return;
    release(ended); phase = 'idle'; onState('idle');
    if (error) onError(speechErrorMessage(error), error);
  };
  const waitForEnd = (error = 'recognition-timeout') => {
    if (closed || phase === 'processing') return;
    clearTimeout(timer); phase = 'processing'; onState(phase);
    timer = setTimeout(() => finish(received ? null : error), 10000);
  };
  const listen = () => {
    if (closed || phase === 'processing') return;
    clearTimeout(timer); phase = 'listening'; onState(phase);
    // A capture event alone does not prove that the recognition service is responding.
    timer = setTimeout(() => {
      waitForEnd();
      try { recognition.stop(); } catch { finish('recognition-timeout'); }
    }, 30000);
  };
  return {
    start() {
      if (closed || phase !== 'idle') return;
      if (!Recognition) { finish('unsupported'); return; }
      if (isMicrophoneReleasing()) { finish('mic-releasing'); return; }
      phase = 'starting'; onState(phase);
      try {
        recognition = new Recognition();
        recognition.lang = 'th-TH'; recognition.continuous = false; recognition.interimResults = true;
        // Service startup does not guarantee that microphone capture actually opened.
        recognition.onstart = () => {};
        recognition.onaudiostart = listen;
        recognition.onaudioend = () => waitForEnd();
        recognition.onresult = event => {
          if (closed) return;
          const parts = [], interim = [];
          for (let i = 0; i < event.results.length; i++) {
            (event.results[i].isFinal ? parts : interim).push(event.results[i][0]?.transcript || '');
          }
          const text = parts.join(' ').trim();
          onPreview(interim.join(' ').trim());
          if (text) { received = true; onResult(text); }
          if (interim.length) listen();
          else if (text) waitForEnd();
        };
        recognition.onerror = event => finish(event.error);
        recognition.onnomatch = () => finish('no-speech');
        recognition.onend = () => finish(received ? null : 'no-speech', true);
        timer = setTimeout(() => finish('timeout'), 20000);
        // Keep start synchronous with the tap so Safari retains the user gesture.
        recognition.start();
      } catch (error) { finish(error.name === 'NotAllowedError' ? 'not-allowed' : 'start-failed', true); }
    },
    stop() {
      if (closed) return;
      if (phase === 'starting') { finish(); return; }
      if (phase !== 'listening') return;
      waitForEnd('no-speech');
      try { recognition.stop(); } catch { finish(received ? null : 'no-speech'); }
    },
    cancel: () => release(),
  };
}

export function requestMicrophoneAccess(mediaDevices, { onReady, onError }) {
  let closed = false;
  const cancel = () => { closed = true; clearTimeout(timer); };
  const fail = code => { if (!closed) { cancel(); onError(speechErrorMessage(code)); } };
  const timer = setTimeout(() => fail('timeout'), 20000);
  try {
    if (!mediaDevices?.getUserMedia) { queueMicrotask(() => fail('unsupported')); return {cancel}; }
    mediaDevices.getUserMedia({audio:true}).then(stream => {
      // Release the hardware before SpeechRecognition opens its own capture session.
      stream.getTracks().forEach(track => track.stop());
      if (!closed) { cancel(); onReady(); }
    }, error => fail(['NotAllowedError','SecurityError','PermissionDeniedError'].includes(error.name) ? 'not-allowed'
      : ['NotFoundError','DevicesNotFoundError'].includes(error.name) ? 'audio-capture' : 'mic-busy'));
  } catch { queueMicrotask(() => fail('audio-capture')); }
  return {cancel};
}
