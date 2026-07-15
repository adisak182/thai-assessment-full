import { useState, useEffect, useRef } from 'react';
import { Timer } from 'lucide-react';

/**
 * ExamTimer – นับถอยหลังเวลาสอบ
 * Props:
 *   totalSeconds  – เวลาทั้งหมด (วินาที), e.g. 25 ข้อ × 30 = 750
 *   onTimeUp      – callback เมื่อหมดเวลา (trigger submit)
 */
export default function ExamTimer({ totalSeconds, onTimeUp }) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [urgent, setUrgent] = useState(false);
  const calledRef = useRef(false);

  useEffect(() => {
    if (remaining <= 0) {
      if (!calledRef.current) {
        calledRef.current = true;
        onTimeUp?.();
      }
      return;
    }

    // Flash urgent when <= 60 seconds left
    setUrgent(remaining <= 60);

    const id = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onTimeUp]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct  = Math.max(0, (remaining / totalSeconds) * 100);

  // Color shifts: green → amber → red
  const barColor = pct > 40
    ? 'linear-gradient(90deg, #10b981, #059669)'
    : pct > 15
    ? 'linear-gradient(90deg, #f59e0b, #d97706)'
    : 'linear-gradient(90deg, #ef4444, #dc2626)';

  const textColor = pct > 40 ? '#059669' : pct > 15 ? '#d97706' : '#dc2626';

  return (
    <div
      style={{
        position: 'sticky',
        top: '8px',
        zIndex: 200,
        background: 'rgba(255,255,255,0.98)',
        border: `2px solid ${urgent ? '#fca5a5' : 'rgba(139,92,246,0.2)'}`,
        borderRadius: '16px',
        padding: '12px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        boxShadow: urgent
          ? '0 4px 20px rgba(239,68,68,0.25)'
          : '0 4px 20px rgba(91,33,182,0.12)',
        animation: urgent ? 'timerPulse 1s ease-in-out infinite' : 'none',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
        background: urgent ? 'rgba(239,68,68,0.1)' : 'rgba(139,92,246,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Timer size={22} color={urgent ? '#ef4444' : '#7c3aed'} />
      </div>

      {/* Time display + bar */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>
            เวลาที่เหลือ
          </span>
          <span style={{
            fontSize: '1.2rem', fontWeight: '700', letterSpacing: '0.5px',
            color: textColor, fontVariantNumeric: 'tabular-nums',
          }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          height: '6px', borderRadius: '999px',
          background: 'rgba(0,0,0,0.07)', overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct}%`, height: '100%',
            background: barColor, borderRadius: '999px',
            transition: 'width 1s linear, background 0.5s',
          }} />
        </div>
      </div>

      {/* Warning text */}
      {urgent && (
        <span style={{
          fontSize: '0.78rem', fontWeight: '700', color: '#dc2626',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          ⚠️ ใกล้หมดเวลา!
        </span>
      )}
    </div>
  );
}
