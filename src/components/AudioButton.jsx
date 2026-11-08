import { registerPromptAudio, unregisterPromptAudio } from '../utils/promptAudio';
import { useRef, useState, useEffect } from 'react';
import { Volume2, Play } from 'lucide-react';
export default function AudioBtn({ src, label = 'ฟังเสียง', onComplete, showSeek = false, disabled = false }) {
  const ref = useRef(null);
  const [audioError,setAudioError]=useState('');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    return () => {
      if (ref.current) {
        unregisterPromptAudio(ref.current);
        ref.current.pause();
        ref.current.src = '';
        ref.current = null;
      }
    };
  }, [src]);

  const initAudio = () => {
    if (!ref.current) {
      ref.current = new Audio(src);
      registerPromptAudio(ref.current);
      ref.current.onpause = () => setPlaying(false);
      ref.current.onerror=()=>{setPlaying(false);setAudioError('โหลดเสียงไม่สำเร็จ ตรวจการเชื่อมต่อแล้วกดฟังอีกครั้ง');};
      ref.current.onended = () => {
        setPlaying(false);
        if (onCompleteRef.current) onCompleteRef.current();
        if (!showSeek && ref.current) {
          try {
            ref.current.currentTime = 0;
            ref.current.removeAttribute('src');
            ref.current.load();
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

  const togglePlay = () => {
    initAudio();
    if (playing) {
      ref.current.pause();
      if (!showSeek) ref.current.currentTime = 0;
      setPlaying(false);
    } else {
      if (!showSeek && (!ref.current.src || (!ref.current.src.endsWith(src) && ref.current.src !== src))) {
        ref.current.src = src;
        try { ref.current.load(); } catch {}
      } else if (showSeek && (!ref.current.src || !ref.current.src.includes(src))) {
        ref.current.src = src;
        try { ref.current.load(); } catch {}
      }
      setAudioError('');
      if (ref.current.error) ref.current.load();
      const active=ref.current;
      const p=active.play();
      if(p!==undefined)p.then(()=>{if(ref.current===active)setPlaying(!active.paused);}).catch(error=>{if(ref.current!==active)return;setPlaying(false);if(error.name!=='AbortError')setAudioError('เล่นเสียงไม่สำเร็จ กรุณากดฟังอีกครั้ง');});
      else setPlaying(true);
    }
  };

  const handleSeek = (e) => {
    if (!ref.current) initAudio();
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
      {audioError && <p role="alert" style={{color:'#b91c1c'}}>{audioError}</p>}
      <button type="button" disabled={disabled} onClick={togglePlay} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px 28px', borderRadius: '30px', border: '2px solid var(--color-primary)', background: playing ? 'var(--color-primary)' : 'white', color: playing ? 'white' : 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '1.1rem', width: '100%', maxWidth: '300px', transition: 'all 0.2s', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(91, 33, 182, 0.15)' }}>
        {playing ? <Volume2 size={18} /> : <Play size={18} />} 
        {playing ? (showSeek ? 'หยุดชั่วคราว' : 'กำลังเล่น...') : label}
      </button>
      {showSeek && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', background: 'rgba(139,92,246,0.08)', padding: '12px 20px', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', fontWeight: '600', fontVariantNumeric: 'tabular-nums', minWidth: '35px', textAlign: 'right' }}>{formatTime(progress)}</span>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={progress} 
            onChange={handleSeek} 
            style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer', height: '6px' }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', fontVariantNumeric: 'tabular-nums', minWidth: '35px' }}>{formatTime(duration)}</span>
        </div>
      )}
    </div>
  );
}
