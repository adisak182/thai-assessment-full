import React, { useEffect, useCallback } from 'react';
import { Trophy, XCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultModal({ score, total, breakdown, onClose, onRetry }) {
  const pct = Math.round((score / total) * 100);
  
  let evaluationLevel = '';
  let evaluationColor = '';
  if (pct >= 80) { evaluationLevel = 'ดีมาก'; evaluationColor = '#059669'; } // Emerald
  else if (pct >= 60) { evaluationLevel = 'ดี'; evaluationColor = '#2563eb'; } // Blue
  else if (pct >= 50) { evaluationLevel = 'พอใช้'; evaluationColor = '#d97706'; } // Amber
  else { evaluationLevel = 'ปรับปรุง'; evaluationColor = '#dc2626'; } // Red

  let failedSkills = [];
  if (breakdown) {
    Object.entries(breakdown).forEach(([key, item]) => {
      if (item.max > 0) {
        // ใช้เกณฑ์ 60% ของคะแนนเต็มในแต่ละทักษะ
        const skillPassed = (item.score / item.max) >= 0.6;
        if (!skillPassed) failedSkills.push(item.label);
      }
    });
  }
  
  const allPassed = breakdown ? failedSkills.length === 0 : pct >= 60;

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
    if (allPassed) { 
      fire(); 
      setTimeout(fire, 1000); 
    } 
  }, [allPassed, fire]);
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '48px 40px', maxWidth: '520px', width: '100%', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ width: '90px', height: '90px', borderRadius: '50%', margin: '0 auto 24px', background: allPassed ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          {allPassed ? <Trophy size={44} /> : <XCircle size={44} />}
        </div>
        
        {allPassed ? (
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#059669', marginBottom: '24px' }}>ยอดเยี่ยม! 🎉 คุณผ่านเกณฑ์การประเมิน</h2>
        ) : (
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '24px' }}>❌ ยังไม่ผ่านเกณฑ์การประเมิน</h2>
        )}

        <div style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '24px', lineHeight: '1.8', textAlign: 'left', background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ marginBottom: '12px' }}>คุณได้ <strong style={{ color: 'var(--color-primary)', fontSize: '1.6rem' }}>{score}</strong> คะแนน (ร้อยละ {pct})</div>
          <div style={{ marginBottom: '12px' }}>ผลการประเมินของคุณอยู่ในระดับ <strong style={{ color: evaluationColor, fontSize: '1.5rem' }}>{evaluationLevel}</strong></div>
          
          {!allPassed && failedSkills.length > 0 && (
            <div style={{ color: '#dc2626', marginTop: '20px', padding: '16px', background: '#fef2f2', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>โดยมีทักษะที่ต้องพัฒนาได้แก่:</div>
              <ul style={{ margin: 0, paddingLeft: '24px' }}>
                {failedSkills.map((skill, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{skill}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {breakdown && (
          <div style={{ marginTop: '16px', marginBottom: '28px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', color: '#1e293b' }}>คะแนนรายทักษะ</h3>
            <div style={{ display: 'grid', gap: '16px' }}>
              {Object.entries(breakdown).map(([key, item]) => {
                const bPct = item.max > 0 ? (item.score / item.max) * 100 : 0;
                const skillPassed = item.max > 0 ? (item.score / item.max) >= 0.6 : true;

                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.95rem', marginBottom: '8px', fontWeight: '600' }}>
                      <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.label}
                        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: skillPassed ? '#d1fae5' : '#fee2e2', color: skillPassed ? '#059669' : '#dc2626' }}>
                          {skillPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                        </span>
                      </span>
                      <span style={{ color: 'var(--color-primary)' }}>{item.score} / {item.max}</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${bPct}%`, height: '100%', background: skillPassed ? 'var(--color-primary)' : '#f87171', transition: 'width 1s ease-out' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={onRetry} className="btn-secondary" style={{ padding: '14px 28px', borderRadius: '30px', fontSize: '1.1rem' }}>ทำใหม่อีกครั้ง</button>
          <button onClick={onClose} className="btn-primary" style={{ padding: '14px 28px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.1rem' }}>
            <ArrowRight size={18} /> ดูผลและออก
          </button>
        </div>
      </div>
    </div>
  );
}
