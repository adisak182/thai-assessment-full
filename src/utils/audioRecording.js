export function createAudioRecording(mediaDevices, Recorder, {onState,onError}) {
  let stream, recorder, timer, closed=false, stopping=false, bytes=0;
  const chunks=[];
  let resolve;
  const completed=new Promise(done=>{resolve=done;});
  const release=()=>{clearTimeout(timer);stream?.getTracks().forEach(track=>track.stop());};
  const fail=message=>{
    if(closed)return;
    closed=true;
    if(recorder){recorder.onstop=recorder.ondataavailable=recorder.onerror=null;if(recorder.state!=='inactive')try{recorder.stop();}catch{/* Hardware may already be stopped. */}}
    release();onState('idle');onError(message);resolve(null);
  };
  const stop=()=>{
    if(closed||stopping)return completed;
    if(!recorder){cancel();onState('idle');return completed;}
    stopping=true;clearTimeout(timer);onState('processing');
    timer=setTimeout(()=>fail('ปิดการอัดเสียงไม่สำเร็จ กรุณาลองใหม่'),10000);
    try{recorder.stop();}catch{fail('หยุดอัดเสียงไม่สำเร็จ กรุณาลองใหม่');}
    return completed;
  };
  const cancel=()=>{
    if(closed)return;
    closed=true;
    if(recorder){recorder.onstop=recorder.ondataavailable=recorder.onerror=null;if(recorder.state!=='inactive')try{recorder.stop();}catch{/* Hardware may already be stopped. */}}
    release();resolve(null);
  };
  return {
    async start(){
      if(closed)return;
      if(!Recorder||!mediaDevices?.getUserMedia){fail('เบราว์เซอร์นี้ยังอัดเสียงไม่ได้ กรุณาเปิดด้วย Safari หรือ Chrome รุ่นปัจจุบัน');return;}
      onState('checking');timer=setTimeout(()=>fail('ยังเปิดไมโครโฟนไม่ได้ กรุณาตรวจสิทธิ์ไมโครโฟนแล้วลองใหม่'),20000);
      try{
        stream=await mediaDevices.getUserMedia({audio:true});
        if(closed){release();return;}
        clearTimeout(timer);
        const mimeType=['audio/mp4','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(type=>Recorder.isTypeSupported?.(type));
        recorder=new Recorder(stream,{...(mimeType?{mimeType}:{}),audioBitsPerSecond:32000});
        recorder.ondataavailable=event=>{
          if(closed||!event.data?.size)return;
          bytes+=event.data.size;
          if(bytes>2*1024*1024){fail('เสียงยาวหรือไฟล์ใหญ่เกินไป กรุณาอัดใหม่ให้สั้นลง');return;}
          chunks.push(event.data);
        };
        recorder.onerror=()=>fail('การอัดเสียงถูกขัดจังหวะ กรุณาตรวจไมโครโฟนแล้วอัดใหม่');
        recorder.onstop=()=>{
          if(closed)return;
          closed=true;release();
          const blob=new Blob(chunks,{type:recorder.mimeType||chunks[0]?.type||'audio/mp4'});
          if(!blob.size){onState('idle');onError('ยังไม่มีเสียงที่บันทึก กรุณาอัดใหม่');resolve(null);return;}
          onState('ready');resolve(blob);
        };
        for(const track of stream.getTracks())track.addEventListener?.('ended',stop,{once:true});
        recorder.start(1000);onState('recording');timer=setTimeout(stop,90000);
      }catch(error){fail(error.name==='NotAllowedError'?'กรุณาอนุญาตไมโครโฟนของเว็บไซต์เพื่ออัดคำตอบ':'เปิดไมโครโฟนไม่ได้ กรุณาปิดแอปอื่นที่ใช้ไมค์แล้วลองใหม่');}
    },stop,cancel,
  };
}
