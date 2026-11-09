import { useState, useRef, useEffect } from 'react';
import { Mic, Square, RefreshCw, Edit3, Check, AlertCircle } from 'lucide-react';
import { pausePromptAudio } from '../utils/promptAudio';
import { speechErrorMessage } from '../utils/speechRecognition';

// Module-level pointer to track active speech recognition and prevent zombie instances
let globalActiveRecognition = null;

export function abortGlobalActiveRecognition() {
  if (globalActiveRecognition) {
    const rec = globalActiveRecognition;
    globalActiveRecognition = null;
    try {
      rec.onstart = null;
      rec.onaudiostart = null;
      rec.onspeechstart = null;
      rec.onresult = null;
      rec.onerror = null;
      rec.onend = null;
      rec.abort();
    } catch {
      // ignore
    }
  }
}

export default function MicButton({
  onResult,
  currentText = '',
  expectedText = '',
  disabled = false,
  placeholder = 'พิมพ์คำตอบของคุณที่นี่...'
}) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const recognitionRef = useRef(null);
  const isMountedRef = useRef(true);
  const latestTranscriptRef = useRef('');
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // Clean up any active speech recognition on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const lastText = latestTranscriptRef.current?.trim();
      if (lastText && onResultRef.current) {
        onResultRef.current(lastText);
      }
      if (recognitionRef.current) {
        const rec = recognitionRef.current;
        recognitionRef.current = null;
        if (globalActiveRecognition === rec) {
          globalActiveRecognition = null;
        }
        try {
          rec.onstart = null;
          rec.onaudiostart = null;
          rec.onspeechstart = null;
          rec.onresult = null;
          rec.onerror = null;
          rec.onend = null;
          rec.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const stopRecognition = () => {
    // If we heard speech before stopping, immediately save it
    const textToSave = latestTranscriptRef.current?.trim() || preview.trim();
    if (textToSave && onResultRef.current) {
      onResultRef.current(textToSave);
    }

    if (recognitionRef.current) {
      const rec = recognitionRef.current;
      recognitionRef.current = null;
      if (globalActiveRecognition === rec) {
        globalActiveRecognition = null;
      }
      try {
        rec.onstart = null;
        rec.onaudiostart = null;
        rec.onspeechstart = null;
        rec.onresult = null;
        rec.onerror = null;
        rec.onend = null;
        rec.abort();
      } catch {
        // ignore
      }
    }
    abortGlobalActiveRecognition();

    if (isMountedRef.current) {
      setRecording(false);
      setProcessing(false);
      setPreview('');
    }
  };

  const startListening = () => {
    if (disabled || recording || processing) return;

    // Reset error & states
    setErrorMsg('');
    setPreview('');
    latestTranscriptRef.current = '';

    // 1. Release any prompt audio elements cleanly so iOS Safari AVAudioSession is unlocked
    pausePromptAudio();

    // 2. Safely release any lingering speech recognition instance immediately
    abortGlobalActiveRecognition();

    if (!isMountedRef.current) return;

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    if (!SpeechRecognition) {
      setErrorMsg(
        'เบราว์เซอร์นี้ไม่รองรับระบบแปลงเสียงเป็นข้อความอัตโนมัติ (บน iPad/iPhone แนะนำให้ใช้ Safari และเปิด Siri ในการตั้งค่า ส่วนคอมพิวเตอร์/Android ให้ใช้ Chrome) หรือพิมพ์คำตอบในช่องด้านล่างได้ครับ'
      );
      setIsEditing(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.continuous = false; // MUST be false for iOS Safari stability

      let silenceWatchdog = null;
      const resetWatchdog = () => {
        if (silenceWatchdog) clearTimeout(silenceWatchdog);
        silenceWatchdog = setTimeout(() => {
          if (!isMountedRef.current) return;
          if (!latestTranscriptRef.current && recording) {
            console.warn('Speech recognition silent timeout triggered');
            try { recognition.stop(); } catch {}
            setRecording(false);
            setProcessing(false);
            setErrorMsg('ยังไม่ได้ยินเสียงพูดชัดเจน กรุณากดปุ่มแล้วพูดอีกครั้ง หรือพิมพ์คำตอบแทนได้ครับ');
            setIsEditing(true);
          }
        }, 7000);
      };

      recognition.onstart = () => {
        if (!isMountedRef.current) return;
        setRecording(true);
        setProcessing(false);
        setErrorMsg('');
        resetWatchdog();
      };

      recognition.onaudiostart = () => {
        if (!isMountedRef.current) return;
        setRecording(true);
        setProcessing(false);
        resetWatchdog();
      };

      recognition.onspeechstart = () => {
        if (silenceWatchdog) clearTimeout(silenceWatchdog);
        if (!isMountedRef.current) return;
        setRecording(true);
      };

      recognition.onresult = (event) => {
        if (silenceWatchdog) clearTimeout(silenceWatchdog);
        if (!isMountedRef.current) return;

        let interimText = '';
        let finalText = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          const transcript = item[0]?.transcript || '';
          if (item.isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        const combined = (finalText + ' ' + interimText).trim();
        const bestText = combined || finalText.trim() || interimText.trim();

        if (bestText) {
          latestTranscriptRef.current = bestText;
          setPreview(bestText);
          setErrorMsg('');

          // CRITICAL: Update parent answer state immediately in real-time as speech is heard!
          if (onResultRef.current) {
            onResultRef.current(bestText);
          }
        }
      };

      recognition.onerror = (event) => {
        if (silenceWatchdog) clearTimeout(silenceWatchdog);
        if (globalActiveRecognition === recognition) {
          globalActiveRecognition = null;
        }
        if (!isMountedRef.current) return;
        console.warn('SpeechRecognition error:', event.error);

        // If we already collected speech before error, commit it
        const savedSoFar = latestTranscriptRef.current?.trim() || preview.trim();
        if (savedSoFar && onResultRef.current) {
          onResultRef.current(savedSoFar);
        }

        setRecording(false);
        setProcessing(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMsg(
            'ยังไม่ได้รับอนุญาตให้ใช้ไมโครโฟนหรือการรู้จำเสียง (บน iPad/iPhone ให้เปิดสิทธิ์ใน Safari และเปิด Siri ในการตั้งค่าเครื่อง) หรือพิมพ์คำตอบแทนได้ครับ'
          );
          setIsEditing(true);
        } else if (event.error === 'no-speech') {
          if (!currentText && !savedSoFar) {
            setErrorMsg(
              'ยังไม่ได้ยินเสียงพูดชัดเจน กรุณากดปุ่มแล้วพูดใกล้ไมโครโฟน หรือพิมพ์คำตอบแทนได้ครับ'
            );
            setIsEditing(true);
          }
        } else if (event.error === 'audio-capture') {
          setErrorMsg('ไม่พบไมโครโฟนที่ใช้งานได้ กรุณาตรวจไมโครโฟนหรือปิดแอปอื่นที่กำลังใช้ไมค์');
        } else if (event.error === 'network') {
          setErrorMsg('บริการแปลงเสียงเชื่อมต่อไม่ได้ชั่วคราว กรุณาลองใหม่อีกครั้ง หรือพิมพ์คำตอบแทนได้ครับ');
        } else if (event.error === 'aborted') {
          if (!currentText && !savedSoFar) {
            setErrorMsg('การรับฟังเสียงหยุดชั่วคราว กรุณากดปุ่มพูดอีกครั้งได้เลยครับ');
          }
        } else {
          setErrorMsg(speechErrorMessage(event.error));
        }
      };

      recognition.onend = () => {
        if (silenceWatchdog) clearTimeout(silenceWatchdog);
        if (globalActiveRecognition === recognition) {
          globalActiveRecognition = null;
        }
        if (!isMountedRef.current) return;

        // CRITICAL FIX: On mobile WebKit (iPad/iPhone), Siri dictation often ends
        // without marking results as isFinal. We MUST commit the latest captured transcript!
        const finalCandidate = latestTranscriptRef.current?.trim() || preview.trim();
        if (finalCandidate && onResultRef.current) {
          onResultRef.current(finalCandidate);
        }

        setRecording(false);
        setProcessing(false);
        setPreview('');
        recognitionRef.current = null;
      };

      setProcessing(true);
      recognitionRef.current = recognition;
      globalActiveRecognition = recognition;

      try {
        recognition.start();
      } catch (startErr) {
        if (startErr.name === 'InvalidStateError') {
          abortGlobalActiveRecognition();
          try {
            recognition.start();
          } catch (retryErr) {
            console.warn('Recognition retry failed:', retryErr);
            setErrorMsg('ไมโครโฟนกำลังพร้อมทำงาน กรุณากดปุ่มพูดอีกครั้งครับ');
            setRecording(false);
            setProcessing(false);
          }
        } else {
          throw startErr;
        }
      }
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      if (globalActiveRecognition === recognitionRef.current) {
        globalActiveRecognition = null;
      }
      if (isMountedRef.current) {
        setErrorMsg('ไม่สามารถเปิดใช้งานไมโครโฟนได้ กรุณารอสักครู่แล้วลองใหม่อีกครั้ง หรือพิมพ์คำตอบแทนได้ครับ');
        setRecording(false);
        setProcessing(false);
        setIsEditing(true);
      }
    }
  };

  const toggleListen = () => {
    if (recording || processing) {
      stopRecognition();
    } else {
      startListening();
    }
  };

  const handleSaveEdit = (e) => {
    e?.preventDefault();
    if (editText.trim()) {
      onResultRef.current(editText.trim());
      setIsEditing(false);
      setErrorMsg('');
    }
  };

  // Check tongue twister matching if expectedText is provided
  let isMatch = null;
  if (currentText && expectedText) {
    const cleanSource = expectedText.replace(/[\s.\-?!,]/g, '').trim();
    const cleanAnswer = currentText.replace(/[\s.\-?!,]/g, '').trim();
    isMatch = cleanSource === cleanAnswer;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Mic Trigger Button */}
      <button
        type="button"
        onClick={toggleListen}
        disabled={disabled}
        className="option-btn"
        style={{
          padding: '16px 24px',
          borderRadius: '14px',
          border: `2px solid ${
            recording
              ? '#ef4444'
              : currentText
              ? isMatch === false
                ? '#ef4444'
                : '#10b981'
              : 'rgba(59, 130, 246, 0.2)'
          }`,
          background: recording
            ? '#fef2f2'
            : currentText
            ? isMatch === false
              ? '#fef2f2'
              : 'rgba(16, 185, 129, 0.08)'
            : 'white',
          color: recording
            ? '#dc2626'
            : currentText
            ? isMatch === false
              ? '#dc2626'
              : '#059669'
            : '#2563eb',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          fontSize: '1.15rem',
          fontWeight: '600',
          transition: 'all 0.2s',
          width: '100%',
          boxShadow: recording ? '0 0 15px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
        }}
      >
        {recording ? (
          <>
            <Square size={20} className="pulse-anim" fill="#dc2626" />
            <span>กำลังฟังเสียง... (กดเพื่อหยุด)</span>
          </>
        ) : processing ? (
          <>
            <RefreshCw size={20} className="spin" />
            <span>กำลังเตรียมไมโครโฟน...</span>
          </>
        ) : (
          <>
            <Mic size={20} />
            <span>
              {currentText
                ? isMatch === false
                  ? 'อ่านไม่ตรง (กดเพื่อพูดใหม่)'
                  : 'บันทึกคำตอบแล้ว (กดเพื่อพูดใหม่)'
                : 'กดปุ่มแล้วเริ่มพูดได้เลย'}
            </span>
          </>
        )}
      </button>

      {/* Live speech preview while speaking */}
      {recording && preview && (
        <div
          className="animate-fade-in"
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            color: '#1d4ed8',
            fontSize: '1.05rem',
            lineHeight: '1.6'
          }}
        >
          <span style={{ fontWeight: '600' }}>กำลังฟัง: </span>
          <span style={{ fontStyle: 'italic' }}>"{preview}"</span>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Display Spoken / Saved Answer */}
      {currentText && !isEditing && (
        <div
          style={{
            background: isMatch === false ? '#fff1f2' : '#f0fdf4',
            padding: '16px 20px',
            borderRadius: '12px',
            borderLeft: `5px solid ${isMatch === false ? '#ef4444' : '#10b981'}`,
            border: `1px solid ${isMatch === false ? '#fecdd3' : '#bbf7d0'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
              คำตอบที่คุณพูด:
            </span>
            <button
              type="button"
              onClick={() => {
                setEditText(currentText);
                setIsEditing(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'transparent',
                border: 'none',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '0.9rem',
                textDecoration: 'underline'
              }}
            >
              <Edit3 size={14} /> แก้ไขข้อความ
            </button>
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: '500', color: '#1e293b', lineHeight: '1.6' }}>
            "{currentText}"
          </div>

          {/* Validation Feedback */}
          {expectedText ? (
            isMatch ? (
              <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={18} /> อ่านถูกต้องครบถ้วน
              </div>
            ) : (
              <div style={{ color: '#b91c1c', fontWeight: 'bold', fontSize: '0.95rem' }}>
                ❌ อ่านผิดหรือไม่ตรง กรุณากดพูดใหม่ (ต้องอ่านให้ตรงทุกคำ)
              </div>
            )
          ) : (
            <div style={{ color: '#15803d', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={18} /> บันทึกคำตอบแล้ว
            </div>
          )}
        </div>
      )}

      {/* Manual Input / Edit Mode Fallback */}
      {(isEditing || (!currentText && errorMsg)) && (
        <form onSubmit={handleSaveEdit} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '10px',
              border: '2px solid #cbd5e1',
              fontSize: '1.05rem',
              fontFamily: 'inherit'
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '0 20px', borderRadius: '10px', whiteSpace: 'nowrap' }}
          >
            บันทึก
          </button>
          {isEditing && currentText && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setIsEditing(false)}
              style={{ padding: '0 16px', borderRadius: '10px' }}
            >
              ยกเลิก
            </button>
          )}
        </form>
      )}

      {/* Toggle to type manually if mic is not preferred */}
      {!isEditing && !currentText && !errorMsg && (
        <div style={{ textAlign: 'right' }}>
          <button
            type="button"
            onClick={() => {
              setEditText('');
              setIsEditing(true);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.9rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            ไมโครโฟนมีปัญหา? พิมพ์คำตอบแทน
          </button>
        </div>
      )}
    </div>
  );
}
