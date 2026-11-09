import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, RefreshCw, Edit3, Check, AlertCircle } from 'lucide-react';
import { pausePromptAudio } from '../utils/promptAudio';
import { createSpeechSession, isMicrophoneReleasing, subscribeMicrophoneRelease } from '../utils/speechRecognition';

// ---------------------------------------------------------------------------
// abortGlobalActiveRecognition – kept for backward-compatibility with callers
// in SpeakingTest.jsx and FullTest.jsx.  The real session lifecycle is now
// managed exclusively via createSpeechSession / session.cancel().
// ---------------------------------------------------------------------------
let _activeCancelFn = null;

export function abortGlobalActiveRecognition() {
  if (_activeCancelFn) {
    const fn = _activeCancelFn;
    _activeCancelFn = null;
    fn();
  }
}

// ---------------------------------------------------------------------------
// MicButton
// ---------------------------------------------------------------------------
export default function MicButton({
  onResult,
  currentText = '',
  expectedText = '',
  disabled = false,
  placeholder = 'พิมพ์คำตอบของคุณที่นี่...'
}) {
  // 'idle' | 'starting' | 'listening' | 'processing'
  const [phase, setPhase] = useState('idle');
  const [preview, setPreview] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  // Keep a stable ref to onResult so the session callbacks never stale-close
  const onResultRef = useRef(onResult);
  useEffect(() => { onResultRef.current = onResult; }, [onResult]);

  // Current createSpeechSession instance – replaced on each start, cancelled on unmount
  const sessionRef = useRef(null);

  // Track whether we have already committed a result for this recording cycle
  // so that the onResult from the preview path doesn't double-fire on unmount.
  const committedRef = useRef(false);

  // -------------------------------------------------------------------------
  // Create a fresh session bound to the current question mount.
  // Called synchronously inside the user-gesture handler so Safari keeps the
  // gesture context alive for recognition.start().
  // -------------------------------------------------------------------------
  const makeSession = useCallback(() => {
    // Cancel the previous session first (registers abortAndWaitForEnd internally)
    if (sessionRef.current) {
      sessionRef.current.cancel();
      sessionRef.current = null;
    }

    const Recognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    const session = createSpeechSession(Recognition, {
      onState(state) {
        setPhase(state);
        if (state === 'idle') {
          setPreview('');
        }
      },
      onPreview(text) {
        setPreview(text);
      },
      onResult(text) {
        committedRef.current = true;
        if (onResultRef.current) onResultRef.current(text);
      },
      onError(msg) {
        setErrorMsg(msg);
        // If the browser has no speech support, open the manual text field
        if (msg.includes('เบราว์เซอร์')) {
          setIsEditing(true);
        }
      },
    });

    sessionRef.current = session;
    // Register as the global active session so external callers can cancel it
    _activeCancelFn = () => {
      session.cancel();
      if (sessionRef.current === session) sessionRef.current = null;
    };

    return session;
  }, []);

  // -------------------------------------------------------------------------
  // Cleanup on unmount (question change triggers a new MicButton via key=)
  // -------------------------------------------------------------------------
  useEffect(() => {
    committedRef.current = false;
    const unsub = subscribeMicrophoneRelease(() => {
      if (!isMicrophoneReleasing()) {
        setErrorMsg((prev) => prev.includes('ข้อก่อนหน้า') ? '' : prev);
      }
    });
    return () => {
      unsub();
      // Cancel releases the hardware via abortAndWaitForEnd so the next
      // question's MicButton will see isMicrophoneReleasing() = true and
      // show a friendly "กรุณารอสักครู่" message instead of throwing.
      if (sessionRef.current) {
        sessionRef.current.cancel();
        sessionRef.current = null;
      }
      if (_activeCancelFn) {
        _activeCancelFn = null; // already cancelled above
      }
    };
  }, []);

  // -------------------------------------------------------------------------
  // User interactions
  // -------------------------------------------------------------------------
  const handleToggle = () => {
    if (disabled) return;

    if (phase === 'listening') {
      // Stop listening → move to processing
      sessionRef.current?.stop();
      return;
    }

    if (phase === 'starting' || phase === 'processing') {
      // Cancel mid-flight
      sessionRef.current?.cancel();
      sessionRef.current = null;
      setPhase('idle');
      return;
    }

    // phase === 'idle' → start
    setErrorMsg('');
    setPreview('');
    committedRef.current = false;
    pausePromptAudio();

    // If the previous question's microphone is still releasing, createSpeechSession
    // will immediately call onError with 'mic-releasing' and return to idle –
    // the user sees an actionable Thai message and can tap again after a moment.
    // We still call makeSession() synchronously here (inside the gesture) so
    // Safari retains the user-gesture activation for recognition.start().
    const session = makeSession();
    session.start();
  };

  const handleSaveEdit = (e) => {
    e?.preventDefault();
    if (editText.trim()) {
      if (onResultRef.current) onResultRef.current(editText.trim());
      setIsEditing(false);
      setErrorMsg('');
    }
  };

  // -------------------------------------------------------------------------
  // Derived UI state
  // -------------------------------------------------------------------------
  const recording = phase === 'listening';
  const processing = phase === 'starting' || phase === 'processing';

  let isMatch = null;
  if (currentText && expectedText) {
    const cleanSource = expectedText.replace(/[\s.\-?!,]/g, '').trim();
    const cleanAnswer = currentText.replace(/[\s.\-?!,]/g, '').trim();
    isMatch = cleanSource === cleanAnswer;
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Mic Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
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
