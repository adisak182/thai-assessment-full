import React, { useEffect, useCallback } from 'react';
import { Trophy, XCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultModal({ score, total, onClose, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;
  
  const fire = useCallback(() => {
    confetti({ 
      particleCount: 150, 
      spread: 80, 
      origin: { y: 0.55 }, 
      scalar: 1.3, 
      colors: ['#a855f7', '#7c3aed', '#fbbf24', '#10b981'], 
      zIndex: 9999 
    });
  }, []);
  
  useEffect(() => { 
    if (passed) { 
      fire(); 
      setTimeout(fire, 1000); 
    } 
  }, [passed, fire]);
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px', background: passed ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {passed ? <Trophy size={44} /> : <XCircle size={44} />}
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', marginBottom: '8px' }}>{passed ? '🎉 ยอดเยี่ยม!' : '❌ ยังไม่ผ่านเกณฑ์'}</h2>
        <p style={{ color: '#6b7280', marginBottom: '28px' }}>{passed ? 'คุณทำแบบทดสอบเสร็จสมบูรณ์แล้ว!' : 'ลองทำใหม่อีกครั้งได้เลยนะครับ'}</p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ padding: '16px 28px', background: 'rgba(168,85,247,0.08)', borderRadius: '16px', border: '2px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>คะแนน</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '1.1rem', color: '#9ca3af' }}>จาก {total}</div>
          </div>
          <div style={{ padding: '16px 28px', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '16px', border: `2px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>ร้อยละ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', lineHeight: 1 }}>{pct}%</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ padding: '12px 24px', borderRadius: '30px' }}>ทำใหม่อีกครั้ง</button>
          <button onClick={onClose} className="btn-primary" style={{ padding: '12px 28px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ArrowRight size={18} /> ดูผลและออก
          </button>
        </div>
      </div>
    </div>
  );
}
