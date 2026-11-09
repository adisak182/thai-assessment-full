import { registerPromptAudio, unregisterPromptAudio, setActiveWebAudioController, registerSharedAudioContext } from '../utils/promptAudio';
import { useRef, useState, useEffect } from 'react';
import { Volume2, Play } from 'lucide-react';

let sharedAudioCtx = null;
const audioBufferCache = new Map();

async function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioCtx();
      registerSharedAudioContext(sharedAudioCtx);
    }
    if (sharedAudioCtx.state === 'suspended') {
      await sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

export default function AudioBtn({ src, label = 'ฟังเสียง', onComplete, showSeek = false, disabled = false }) {
  const ref = useRef(null);
  const webAudioSourceRef = useRef(null);
  const [audioError, setAudioError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (webAudioSourceRef.current) {
        try { webAudioSourceRef.current.stop(); } catch {}
        webAudioSourceRef.current = null;
        setActiveWebAudioController(null);
      }
      if (ref.current) {
        unregisterPromptAudio(ref.current);
        ref.current.pause();
        ref.current = null;
      }
    };
  }, [src]);

  const initHtmlAudio = () => {
    if (!ref.current) {
      ref.current = new Audio(src);
      registerPromptAudio(ref.current);
      ref.current.onpause = () => setPlaying(false);
      ref.current.onerror = () => {
        setPlaying(false);
        setAudioError('โหลดเสียงไม่สำเร็จ ตรวจการเชื่อมต่อแล้วกดฟังอีกครั้ง');
      };
      ref.current.onended = () => {
        setPlaying(false);
        if (onCompleteRef.current) onCompleteRef.current();
        if (!showSeek && ref.current) {
          try {
            ref.current.currentTime = 0;
          } catch {
            // ignore
          }
        }
      };
      if (showSeek) {
        ref.current.ontimeupdate = () => setProgress(ref.current.currentTime);
        ref.current.onloadedmetadata = () => setDuration(ref.current.duration);
      }
    }
  };

  const playWebAudio = async () => {
    try {
      const ctx = await getAudioContext();
      if (!ctx) return false;

      let buffer = audioBufferCache.get(src);
      if (!buffer) {
        const resp = await fetch(src);
        if (!resp.ok) return false;
        const arrayBuf = await resp.arrayBuffer();
        buffer = await ctx.decodeAudioData(arrayBuf);
        audioBufferCache.set(src, buffer);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      webAudioSourceRef.current = source;

      setActiveWebAudioController({
        pause: () => {
          try { source.stop(); } catch {}
          setPlaying(false);
          webAudioSourceRef.current = null;
        }
      });

      source.onended = () => {
        setPlaying(false);
        webAudioSourceRef.current = null;
        setActiveWebAudioController(null);
        if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
          try { sharedAudioCtx.suspend().catch(() => {}); } catch {}
        }
        if (onCompleteRef.current) onCompleteRef.current();
      };

      source.start(0);
      setPlaying(true);
      return true;
    } catch (e) {
      console.warn('Web Audio playback note, falling back to HTMLAudio:', e);
      return false;
    }
  };

  const togglePlay = async () => {
    setAudioError('');

    if (playing) {
      if (webAudioSourceRef.current) {
        try { webAudioSourceRef.current.stop(); } catch {}
        webAudioSourceRef.current = null;
        setActiveWebAudioController(null);
      }
      if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
        try { sharedAudioCtx.suspend().catch(() => {}); } catch {}
      }
      if (ref.current) {
        ref.current.pause();
        if (!showSeek) ref.current.currentTime = 0;
      }
      setPlaying(false);
      return;
    }

    // For short prompts without seekbar, prefer Web Audio API to preserve iPad AVAudioSession
    if (!showSeek) {
      const ok = await playWebAudio();
      if (ok) return;
    }

    // Fallback or seekable playback via HTMLAudioElement
    initHtmlAudio();
    if (!showSeek && ref.current.src !== src && !ref.current.src.endsWith(src)) {
      ref.current.src = src;
    } else if (showSeek && !ref.current.src.includes(src)) {
      ref.current.src = src;
    }
    if (ref.current.error) ref.current.load();
    const active = ref.current;
    const p = active.play();
    if (p !== undefined) {
      p.then(() => {
        if (ref.current === active) setPlaying(!active.paused);
      }).catch(error => {
        if (ref.current !== active) return;
        setPlaying(false);
        if (error.name !== 'AbortError') {
          setAudioError('เล่นเสียงไม่สำเร็จ กรุณากดฟังอีกครั้ง');
        }
      });
    } else {
      setPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!ref.current) initHtmlAudio();
    const val = parseFloat(e.target.value);
    ref.current.currentTime = val;
    setProgress(val);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs === Infinity) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: showSeek ? '100%' : '300px', gap: '12px' }}>
      {audioError && <p role="alert" style={{ color: '#b91c1c' }}>{audioError}</p>}
      <button
        type="button"
        disabled={disabled}
        onClick={togglePlay}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '14px 28px',
          borderRadius: '30px',
          border: '2px solid var(--color-primary)',
          background: playing ? 'var(--color-primary)' : 'white',
          color: playing ? 'white' : 'var(--color-primary)',
          fontWeight: '700',
          cursor: 'pointer',
          fontSize: '1.1rem',
          width: '100%',
          maxWidth: '300px',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
          boxShadow: '0 4px 14px rgba(91, 33, 182, 0.15)'
        }}
      >
        {playing ? <Volume2 size={18} /> : <Play size={18} />} 
        {playing ? (showSeek ? 'หยุดชั่วคราว' : 'กำลังเล่น...') : label}
      </button>
      {showSeek && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'rgba(139,92,246,0.08)', padding: '12px 20px', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', fontWeight: '600', fontVariantNumeric: 'tabular-nums', minWidth: '35px', textAlign: 'right' }}>
            {formatTime(progress)}
          </span>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={progress} 
            onChange={handleSeek} 
            style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer', height: '6px' }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', fontVariantNumeric: 'tabular-nums', minWidth: '35px' }}>
            {formatTime(duration)}
          </span>
        </div>
      )}
    </div>
  );
}
