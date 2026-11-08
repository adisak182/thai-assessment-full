import { useState, useRef, useEffect } from 'react';
import { Mic, Square, RefreshCw, Edit3, Check, AlertCircle } from 'lucide-react';
import { pausePromptAudio } from '../utils/promptAudio';

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

  // Clean up any active speech recognition on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      recognitionRef.current = null;
    }
    if (isMountedRef.current) {
      setRecording(false);
      setProcessing(false);
      setPreview('');
    }
  };

  const startListening = () => {
    if (disabled || recording) return;

    // Reset error & states
    setErrorMsg('');
    setPreview('');
    pausePromptAudio();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('เบราว์เซอร์นี้ไม่รองรับระบบแปลงเสียงเป็นข้อความอัตโนมัติ (แนะนำให้ใช้ Google Chrome หรือ Safari) คุณสามารถพิมพ์คำตอบในช่องด้านล่างได้ครับ');
      setIsEditing(true);
      return;
    }

    // Stop any previous session cleanly
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'th-TH';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalSpokenText = '';

      recognition.onstart = () => {
        if (!isMountedRef.current) return;
        setRecording(true);
        setProcessing(false);
        setErrorMsg('');
      };

      recognition.onaudiostart = () => {
        if (!isMountedRef.current) return;
        setRecording(true);
      };

      recognition.onspeechstart = () => {
        if (!isMountedRef.current) return;
        setRecording(true);
      };

      recognition.onresult = (event) => {
        if (!isMountedRef.current) return;
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalSpokenText += item[0].transcript;
          } else {
            interimText += item[0].transcript;
          }
        }

        if (interimText) {
          setPreview(interimText);
        }

        if (finalSpokenText.trim()) {
          const cleaned = finalSpokenText.trim();
          setPreview(cleaned);
          onResult(cleaned);
        }
      };

      recognition.onerror = (event) => {
        if (!isMountedRef.current) return;
        console.warn('SpeechRecognition error:', event.error);
        setRecording(false);
        setProcessing(false);

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMsg('ยังไม่ได้รับอนุญาตให้ใช้ไมโครโฟน กรุณากดอนุญาตการใช้ไมโครโฟนบนเบราว์เซอร์ หรือพิมพ์คำตอบแทนได้ครับ');
        } else if (event.error === 'no-speech') {
          if (!currentText) {
            setErrorMsg('ยังไม่ได้ยินเสียงพูด กรุณากดปุ่มแล้วพูดใกล้ไมโครโฟน หรือพิมพ์คำตอบแทนได้ครับ');
          }
        } else if (event.error === 'audio-capture') {
          setErrorMsg('ไม่พบไมโครโฟนที่ใช้งานได้ กรุณาตรวจสอบการเชื่อมต่อไมโครโฟน');
        } else if (event.error === 'network') {
          setErrorMsg('บริการแปลงเสียงเชื่อมต่อไม่ได้ชั่วคราว กรุณาลองใหม่อีกครั้ง หรือพิมพ์คำตอบแทนได้ครับ');
        } else if (event.error !== 'aborted') {
          setErrorMsg(`เกิดข้อผิดพลาดในการฟังเสียง (${event.error}) สามารถพิมพ์คำตอบแทนได้ครับ`);
        }
      };

      recognition.onend = () => {
        if (!isMountedRef.current) return;
        setRecording(false);
        setProcessing(false);
        setPreview('');
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      if (isMountedRef.current) {
        setErrorMsg('ไม่สามารถเปิดใช้งานไมโครโฟนได้ กรุณาลองใหม่อีกครั้ง หรือพิมพ์คำตอบแทนได้ครับ');
        setRecording(false);
        setProcessing(false);
      }
    }
  };

  const toggleListen = () => {
    if (recording) {
      setProcessing(true);
      stopRecognition();
    } else {
      startListening();
    }
  };

  const handleSaveEdit = (e) => {
    e?.preventDefault();
    if (editText.trim()) {
      onResult(editText.trim());
      setIsEditing(false);
      setErrorMsg('');
    }
  };

  // Check tongue twister matching if expectedText is provided
  let isMatch = null;
  if (currentText && expectedText) {
    const cleanSource = expectedText.replace(/[\s.\-?!,]/g, '');
    const cleanAnswer = currentText.replace(/[\s.\-?!,]/g, '');
    isMatch = cleanSource === cleanAnswer;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Mic Trigger Button */}
      <button
        type="button"
        onClick={toggleListen}
        disabled={disabled || processing}
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
            <span>กำลังประมวลผลเสียง...</span>
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
            onClick={() => setIsEditing(true)}
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
