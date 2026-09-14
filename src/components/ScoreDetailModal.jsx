import { useState, useMemo } from 'react';
import { 
  X, CheckCircle, XCircle, Printer, Search, Filter, 
  Calendar, Trophy, Award, BookOpen, Volume2, MessageCircle, 
  PenTool, User as UserIcon, HelpCircle, ChevronDown, Check, ArrowRight
} from 'lucide-react';

function formatDate(isoStr) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export default function ScoreDetailModal({ attempt, user, onClose }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'incorrect' | 'correct'
  const [sectionFilter, setSectionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!attempt) return null;

  const score = attempt.score ?? 0;
  const maxScore = attempt.max_score || 100;
  const pct = Math.round((score / maxScore) * 100);
  const isPassed = pct >= 70;

  let grade = 'ปรับปรุง';
  let gradeColor = '#ef4444';
  let gradeBg = '#fee2e2';
  if (pct >= 80) {
    grade = 'ดีมาก';
    gradeColor = '#059669';
    gradeBg = '#d1fae5';
  } else if (pct >= 60) {
    grade = 'ดี';
    gradeColor = '#2563eb';
    gradeBg = '#dbeafe';
  } else if (pct >= 50) {
    grade = 'พอใช้';
    gradeColor = '#d97706';
    gradeBg = '#fef3c7';
  }

  const detailedResults = attempt.detailed_results || [];
  const hasDetailedResults = detailedResults.length > 0;

  // Breakdown data
  const breakdown = attempt.breakdown || {};
  const hasBreakdown = Object.keys(breakdown).length > 0;

  // Sections available in results
  const sections = useMemo(() => {
    if (!hasDetailedResults) return [];
    const set = new Set();
    detailedResults.forEach(r => {
      if (r.section) set.add(r.section);
    });
    return Array.from(set);
  }, [detailedResults, hasDetailedResults]);

  // Filtered detailed results
  const filteredResults = useMemo(() => {
    if (!hasDetailedResults) return [];
    return detailedResults.filter(r => {
      // Correct / Incorrect filter
      if (filterType === 'correct' && !r.is_correct) return false;
      if (filterType === 'incorrect' && r.is_correct) return false;

      // Section filter
      if (sectionFilter !== 'all' && r.section !== sectionFilter) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchQ = (r.question || '').toLowerCase().includes(q);
        const matchAns = (String(r.user_answer || '')).toLowerCase().includes(q);
        const matchCorr = (String(r.correct_answer || '')).toLowerCase().includes(q);
        const matchSec = (r.section || '').toLowerCase().includes(q);
        if (!matchQ && !matchAns && !matchCorr && !matchSec) return false;
      }

      return true;
    });
  }, [detailedResults, filterType, sectionFilter, searchQuery, hasDetailedResults]);

  const correctCount = detailedResults.filter(r => r.is_correct).length;
  const incorrectCount = detailedResults.length - correctCount;

  const testTitle = attempt.skill === 'full_test' 
    ? 'แบบทดสอบวัดระดับทักษะภาษาไทย (100 ข้อ)' 
    : `แบบทดสอบทักษะ${attempt.skill}`;

  const studentName = user?.name || attempt.user?.name || 'ผู้เข้าประเมิน';
  const studentUsername = user?.username || attempt.user?.username || '';
  const studentAge = user?.age || attempt.user?.age;
  const studentAddress = user?.address || attempt.user?.address;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="score-detail-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .score-detail-modal, .score-detail-modal * {
            visibility: visible;
          }
          .score-detail-overlay {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: auto;
            background: none !important;
            padding: 0 !important;
          }
          .score-detail-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            max-height: none !important;
            overflow: visible !important;
          }
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div 
        className="score-detail-modal animate-scale-in"
        style={{
          background: '#ffffff',
          width: '100%',
          maxWidth: '960px',
          maxHeight: '92vh',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(226, 232, 240, 0.8)'
        }}
      >
        {/* MODAL HEADER */}
        <div 
          style={{
            padding: '20px 28px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            >
              <Trophy size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#1e293b' }}>
                รายละเอียดผลการประเมิน
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#64748b', marginTop: '3px' }}>
                <span>{testTitle}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> {formatDate(attempt.taken_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={handlePrint}
              style={{
                padding: '9px 16px',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                background: 'white',
                color: '#334155',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                transition: 'all 0.2s'
              }}
              title="พิมพ์ใบคะแนนหรือบันทึกเป็น PDF"
            >
              <Printer size={16} /> พิมพ์ใบคะแนน
            </button>
            <button 
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                padding: '8px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              title="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* STUDENT INFO & OVERALL SCORE SUMMARY */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              padding: '20px',
              background: '#f8fafc',
              borderRadius: '20px',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Student Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div 
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #c084fc, #9333ea)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.4rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(147, 51, 234, 0.25)'
                }}
              >
                {studentName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#1e293b' }}>
                  {studentName}
                </div>
                {studentUsername && (
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    @{studentUsername}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {studentAge && (
                    <span style={{ fontSize: '0.78rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569' }}>
                      อายุ {studentAge} ปี
                    </span>
                  )}
                  {studentAddress && (
                    <span style={{ fontSize: '0.78rem', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', color: '#475569' }}>
                      📍 {studentAddress}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Score & Evaluation Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>คะแนนรวม</div>
                <div style={{ fontSize: '2.2rem', fontWeight: '900', color: isPassed ? '#10b981' : '#ef4444', lineHeight: 1.1 }}>
                  {score} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '600' }}>/ {maxScore}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                  ({pct}%)
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>ผลการประเมิน</div>
                <div 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: isPassed ? '#d1fae5' : '#fee2e2',
                    color: isPassed ? '#059669' : '#dc2626',
                    fontWeight: '800',
                    fontSize: '0.95rem'
                  }}
                >
                  {isPassed ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  {isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}
                </div>
                <div style={{ marginTop: '6px' }}>
                  <span 
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: '700',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: gradeBg,
                      color: gradeColor
                    }}
                  >
                    ระดับ: {grade}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 SKILLS BREAKDOWN SECTION */}
          {hasBreakdown && (
            <div className="print-break">
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#334155', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} color="var(--color-primary)" />
                คะแนนแยกตามทักษะ (4 ทักษะ)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {Object.entries(breakdown).map(([key, b]) => {
                  const bPct = Math.round((b.score / (b.max || 1)) * 100);
                  let skillPassed = false;
                  if (key === 'listening' && b.score >= 18) skillPassed = true;
                  if (key === 'speaking' && b.score >= 11) skillPassed = true;
                  if (key === 'reading' && b.score >= 21) skillPassed = true;
                  if (key === 'writing' && b.score >= 21) skillPassed = true;

                  const icons = {
                    listening: <Volume2 size={18} />,
                    speaking: <MessageCircle size={18} />,
                    reading: <BookOpen size={18} />,
                    writing: <PenTool size={18} />
                  };

                  const colors = {
                    listening: '#8b5cf6',
                    speaking: '#3b82f6',
                    reading: '#10b981',
                    writing: '#f59e0b'
                  };

                  const color = colors[key] || '#8b5cf6';

                  return (
                    <div 
                      key={key}
                      style={{
                        padding: '16px',
                        background: 'white',
                        borderRadius: '16px',
                        border: '1.5px solid #f1f5f9',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: color, fontWeight: '700', fontSize: '0.95rem' }}>
                          {icons[key]} {b.label || key}
                        </div>
                        <span 
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: skillPassed ? '#d1fae5' : '#fee2e2',
                            color: skillPassed ? '#059669' : '#dc2626'
                          }}
                        >
                          {skillPassed ? 'ผ่าน' : 'ไม่ผ่าน'}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b' }}>
                          {b.score} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ {b.max}</span>
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>
                          {bPct}%
                        </span>
                      </div>

                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div 
                          style={{
                            width: `${bPct}%`,
                            height: '100%',
                            background: color,
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DETAILED QUESTION REVIEW */}
          <div className="print-break" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#334155', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} color="var(--color-primary)" />
                ตรวจคำตอบรายข้อ {hasDetailedResults ? `(${detailedResults.length} ข้อ)` : ''}
              </h3>

              {hasDetailedResults && (
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                  <span style={{ color: '#059669', background: '#d1fae5', padding: '4px 10px', borderRadius: '12px' }}>
                    ✓ ถูก {correctCount} ข้อ
                  </span>
                  <span style={{ color: '#dc2626', background: '#fee2e2', padding: '4px 10px', borderRadius: '12px' }}>
                    ✕ ผิด {incorrectCount} ข้อ
                  </span>
                </div>
              )}
            </div>

            {hasDetailedResults ? (
              <>
                {/* Filters & Search Toolbar */}
                <div 
                  className="no-print"
                  style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    background: '#f8fafc',
                    padding: '12px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {/* Status filter tabs */}
                  <div style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
                    <button
                      onClick={() => setFilterType('all')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: filterType === 'all' ? 'white' : 'transparent',
                        color: filterType === 'all' ? '#1e293b' : '#64748b',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        boxShadow: filterType === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      ทั้งหมด ({detailedResults.length})
                    </button>
                    <button
                      onClick={() => setFilterType('incorrect')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: filterType === 'incorrect' ? '#fee2e2' : 'transparent',
                        color: filterType === 'incorrect' ? '#dc2626' : '#64748b',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ❌ ตอบผิด ({incorrectCount})
                    </button>
                    <button
                      onClick={() => setFilterType('correct')}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        background: filterType === 'correct' ? '#d1fae5' : 'transparent',
                        color: filterType === 'correct' ? '#059669' : '#64748b',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ✅ ตอบถูก ({correctCount})
                    </button>
                  </div>

                  {/* Section dropdown filter */}
                  {sections.length > 1 && (
                    <select
                      value={sectionFilter}
                      onChange={e => setSectionFilter(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        fontSize: '0.85rem',
                        color: '#334155',
                        fontWeight: '600',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="all">ทุกหมวดหมู่/ส่วน</option>
                      {sections.map((sec, idx) => (
                        <option key={idx} value={sec}>{sec}</option>
                      ))}
                    </select>
                  )}

                  {/* Search box */}
                  <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                    <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="ค้นหาข้อสอบ / คำตอบ..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 34px',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredResults.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '16px', color: '#64748b' }}>
                      <HelpCircle size={36} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                      <div>ไม่พบข้อสอบที่ตรงตามเงื่อนไขที่เลือก</div>
                    </div>
                  ) : (
                    filteredResults.map((r, idx) => {
                      const isCorrect = r.is_correct;

                      return (
                        <div 
                          key={idx}
                          style={{
                            padding: '16px',
                            borderRadius: '14px',
                            border: `1.5px solid ${isCorrect ? '#e2e8f0' : '#fecaca'}`,
                            background: isCorrect ? '#ffffff' : '#fff5f5',
                            display: 'flex',
                            gap: '14px',
                            alignItems: 'flex-start',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div 
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: isCorrect ? '#d1fae5' : '#fee2e2',
                              color: isCorrect ? '#059669' : '#dc2626',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontWeight: 'bold',
                              marginTop: '2px'
                            }}
                          >
                            {isCorrect ? <Check size={18} /> : <X size={18} />}
                          </div>

                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-primary)', background: 'rgba(139,92,246,0.08)', padding: '2px 8px', borderRadius: '6px' }}>
                                ข้อที่ {r.id || idx + 1} • {r.section || 'แบบทดสอบ'}
                              </span>
                              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isCorrect ? '#059669' : '#dc2626' }}>
                                {isCorrect ? '✓ ได้ 1 คะแนน' : '✕ ได้ 0 คะแนน'}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.98rem', fontWeight: '600', color: '#1e293b', lineHeight: '1.5' }}>
                              {r.question}
                            </div>

                            {/* Answers Comparison */}
                            <div 
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                gap: '8px',
                                marginTop: '4px',
                                fontSize: '0.88rem'
                              }}
                            >
                              <div 
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  background: isCorrect ? '#f0fdf4' : '#fef2f2',
                                  border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                                  color: isCorrect ? '#166534' : '#991b1b'
                                }}
                              >
                                <span style={{ fontWeight: '700' }}>คำตอบของคุณ: </span>
                                <span>{r.user_answer || '(ไม่ได้ตอบ)'}</span>
                              </div>

                              {!isCorrect && (
                                <div 
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    color: '#166534'
                                  }}
                                >
                                  <span style={{ fontWeight: '700' }}>เฉลยที่ถูกต้อง: </span>
                                  <span>{r.correct_answer || '-'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : (
              <div 
                style={{
                  padding: '32px 20px',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '1.5px dashed #cbd5e1',
                  textAlign: 'center',
                  color: '#64748b'
                }}
              >
                <HelpCircle size={40} color="#94a3b8" style={{ marginBottom: '10px' }} />
                <h4 style={{ margin: '0 0 6px 0', color: '#334155', fontSize: '1.05rem' }}>
                  การสอบครั้งนี้ยังไม่มีบันทึกคำตอบรายข้อ
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '500px', marginInline: 'auto' }}>
                  การทำแบบทดสอบครั้งนี้ถูกบันทึกก่อนการอัปเดตระบบตรวจคำตอบรายข้อ อย่างไรก็ตามคะแนนรวมและสถิติหลักยังคงถูกบันทึกไว้อย่างถูกต้องสมบูรณ์
                </p>
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div 
          className="no-print"
          style={{
            padding: '16px 28px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            รหัสผลสอบ: {attempt.id || attempt._id || '-'}
          </div>
          <button 
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--color-primary)',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
            }}
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
