import React, { useEffect, useCallback } from 'react';
import { Trophy, XCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultModal({ score, total, onClose, onRetry }) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  
  let evaluationLevel = '';
  let evaluationColor = '';
  if (pct >= 80) { evaluationLevel = 'ดีมาก'; evaluationColor = '#059669'; } // Emerald
  else if (pct >= 60) { evaluationLevel = 'ดี'; evaluationColor = '#2563eb'; } // Blue
  else if (pct >= 50) { evaluationLevel = 'พอใช้'; evaluationColor = '#d97706'; } // Amber
  else { evaluationLevel = 'ปรับปรุง'; evaluationColor = '#dc2626'; } // Red
  
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
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ padding: '16px 28px', background: 'rgba(168,85,247,0.08)', borderRadius: '16px', border: '2px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>คะแนน</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', lineHeight: 1 }}>{score}</div>
            <div style={{ fontSize: '1.1rem', color: '#9ca3af' }}>จาก {total}</div>
          </div>
          <div style={{ padding: '16px 28px', background: passed ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: '16px', border: `2px solid ${passed ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            <div style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '4px' }}>ร้อยละ</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: passed ? '#059669' : '#dc2626', lineHeight: 1 }}>{pct}%</div>
            <div style={{ fontSize: '1.05rem', color: evaluationColor, fontWeight: 'bold', marginTop: '6px' }}>{evaluationLevel}</div>
          </div>
        </div>

        {breakdown && (
          <div style={{ marginTop: '16px', marginBottom: '28px', textAlign: 'left', background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' }}>คะแนนรายทักษะ</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {Object.entries(breakdown).map(([key, item]) => {
                const bPct = item.max > 0 ? (item.score / item.max) * 100 : 0;
                
                let skillPassed = false;
                if (key === 'listening' && item.score >= 18) skillPassed = true;
                if (key === 'speaking' && item.score >= 11) skillPassed = true;
                if (key === 'reading' && item.score >= 21) skillPassed = true;
                if (key === 'writing' && item.score >= 21) skillPassed = true;

                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', marginBottom: '8px', fontWeight: '600' }}>
                      <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.label}
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: skillPassed ? '#d1fae5' : '#fee2e2', color: skillPassed ? '#059669' : '#dc2626' }}>
                          {skillPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                        </span>
                      </span>
                      <span style={{ color: 'var(--color-primary)' }}>{item.score} / {item.max}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${bPct}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
