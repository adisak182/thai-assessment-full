import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useSessionStorage } from '../hooks/useSessionStorage';
import { safeUUID } from '../utils/uuid';
import MicButton from '../components/MicButton';
import QuestionNumbers from '../components/QuestionNumbers';
import QuestionNavigation from '../components/QuestionNavigation';
import AudioBtn from '../components/AudioButton';
import ResultModal from '../components/ResultModal';
import ExamTimer from '../components/ExamTimer';

import { introQ, situQ, tongueQ } from '../data/conversationQuestions.js';

const SectionHeader = ({ num, title, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '16px' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
      {num}
    </div>
    <div>
      <h3 style={{ margin: 0, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>{title}</h3>
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1.1rem' }}>{icon}</p>
    </div>
  </div>
);

const questionOrder = [...introQ, ...situQ, ...tongueQ].sort((a, b) => a.id - b.id);

export default function SpeakingTest() {
  const { recordScore } = useUser();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQuestionId = questionOrder[currentIndex].id;

  const [speechTexts, setSpeechTexts] = useSessionStorage('speaking_speechTexts', {});
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [savedResult, setSavedResult] = useState(null);
  const [submissionId, setSubmissionId] = useSessionStorage('speaking_submissionId', () => safeUUID());
  const [timerKey, setTimerKey] = useState(0);

  const totalQ = 15;
  const answeredCount = questionOrder.filter(q => speechTexts[q.id]?.trim()).length;
  const progress = Math.round((answeredCount / totalQ) * 100);

  const handleSpeechResult = (questionId, text) => {
    setSpeechTexts(prev => ({
      ...prev,
      [questionId]: text
    }));
  };

  const handleSubmit = async () => {
    if (submitting || showResult) return;
    setSubmitting(true);
    setSubmitError('');

    const responses = questionOrder.map(q => ({
      id: q.id,
      value: speechTexts[q.id] || ''
    }));

    try {
      const result = await recordScore({
        level: 1,
        skill: 'conversation',
        responses,
        submissionId
      });
      setSavedResult(result);
      setShowResult(true);
    } catch (error) {
      setSubmitError(error.message || 'บันทึกไม่สำเร็จ คำตอบยังอยู่ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const renderOpenEndedCard = ({ q }) => {
    const done = Boolean(speechTexts[q.id]?.trim());
    return (
      <div
        key={q.id}
        className="glass-panel practice-panel"
        style={{
          padding: '24px',
          marginBottom: '16px',
          borderLeft: done ? '4px solid #10b981' : '4px solid transparent',
          transition: 'all 0.3s'
        }}
      >
        {q.situation && (
          <div
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              background: 'rgba(59,130,246,0.1)',
              borderRadius: '20px',
              color: '#2563eb',
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '10px'
            }}
          >
            สถานการณ์: {q.situation}
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap' }}>
          {q.audio && <AudioBtn src={q.audio} label="ฟังคำถาม" />}
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-primary-dark)', flex: 1, minWidth: '200px', lineHeight: '1.6' }}>
            ข้อ {q.id}. {q.question || q.prompt}
          </p>
        </div>
        <div style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>💡 แนวทางการตอบ: {q.hint}</span>
        </div>
        <MicButton
          key={q.id}
          onResult={(text) => handleSpeechResult(q.id, text)}
          currentText={speechTexts[q.id] || ''}
          disabled={submitting || showResult}
          placeholder="พิมพ์คำตอบสำหรับข้อนี้..."
        />
      </div>
    );
  };

  const renderTongueCard = ({ q }) => {
    const done = Boolean(speechTexts[q.id]?.trim());
    return (
      <div
        key={q.id}
        className="glass-panel practice-panel"
        style={{
          padding: '24px',
          marginBottom: '16px',
          borderLeft: done ? '4px solid #10b981' : '4px solid transparent',
          transition: 'all 0.3s'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          {q.audio && <AudioBtn src={q.audio} label="ฟังต้นแบบ" />}
          <p style={{ margin: 0, fontWeight: '600', color: 'var(--color-primary-dark)', fontSize: '1.15rem' }}>ข้อ {q.id}.</p>
        </div>
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(37,99,235,0.04))',
            borderRadius: '12px',
            border: '1px solid rgba(59,130,246,0.15)',
            marginBottom: '16px'
          }}
        >
          <p style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600', color: '#1e3a8a', lineHeight: '1.8', textAlign: 'center' }}>
            {q.text}
          </p>
        </div>
        <MicButton
          key={q.id}
          onResult={(text) => handleSpeechResult(q.id, text)}
          currentText={speechTexts[q.id] || ''}
          expectedText={q.text}
          disabled={submitting || showResult}
          placeholder="พิมพ์คำอ่านของข้อความนี้..."
        />
      </div>
    );
  };

  return (
    <div className="page-content practice-page exam-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>
      {submitError && (
        <div role="alert" style={{ padding: 16, background: '#fef2f2', color: '#b91c1c', borderRadius: '12px', marginBottom: '16px' }}>
          <p style={{ margin: 0, marginBottom: '8px' }}>{submitError}</p>
          <button onClick={handleSubmit} disabled={submitting} className="btn-secondary" style={{ padding: '6px 16px' }}>
            ลองส่งอีกครั้ง
          </button>
        </div>
      )}

      {showResult && (
        <ResultModal
          pendingCount={savedResult?.pending_count || 0}
          score={savedResult?.score ?? 0}
          total={totalQ}
          onClose={() => navigate('/skills')}
          onRetry={() => {
            setSpeechTexts({});
            setShowResult(false);
            setCurrentIndex(0);
            setSubmissionId(safeUUID());
            setTimerKey(k => k + 1);
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link to="/skills" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            ← กลับหน้าเลือกทักษะ
          </Link>
          <h1 style={{ margin: 0, color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MessageCircle size={28} color="#2563eb" /> ทักษะการพูด (15 ข้อ)
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            ทำแล้ว {answeredCount} / {totalQ}
          </div>
          <div style={{ height: '8px', width: '150px', borderRadius: '999px', background: 'rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg,#3b82f6,#2563eb)', borderRadius: '999px', transition: 'width 0.3s' }} />
          </div>
        </div>
      </div>

      {/* Question numbers navigation & Timer */}
      <QuestionNumbers
        index={currentIndex}
        answered={questionOrder.map(q => Boolean(speechTexts[q.id]?.trim()))}
        onChange={setCurrentIndex}
        disabled={submitting || showResult}
      />
      <h2 data-current-question tabIndex={-1} aria-live="polite" className="question-step" style={{ fontSize: '1.15rem', margin: '16px 0' }}>
        ข้อที่ {currentIndex + 1} / {totalQ}
      </h2>
      <ExamTimer key={timerKey} totalSeconds={450} onTimeUp={handleSubmit} isActive={!submitting && !showResult} />

      <div className="glass-panel practice-panel" style={{ padding: '20px', marginBottom: '32px', borderLeft: '4px solid #3b82f6', background: 'rgba(59,130,246,0.04)' }}>
        <strong style={{ color: 'var(--color-primary-dark)' }}>คำชี้แจง:</strong>
        <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
          กดปุ่มฟังคำถาม แล้วกดไมโครโฟนเพื่อพูดตอบเป็นภาษาไทย ระบบจะแปลงเสียงพูดเป็นข้อความอัตโนมัติ (สามารถพูดใหม่หรือพิมพ์แก้ไขได้) จากนั้นกดถัดไปเพื่อทำข้อต่อไป
        </span>
      </div>

      {/* Sections rendering based on current question */}
      {introQ.some(q => q.id === currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
          <SectionHeader num="A" title="สนทนาโต้ตอบ — ข้อมูลส่วนตัว (ข้อ 26-30)" icon="บอกชื่อ บ้านเกิด การศึกษา อาชีพ และงานอดิเรก" />
          {introQ.filter(q => q.id === currentQuestionId).map(q => renderOpenEndedCard({ q }))}
        </section>
      )}

      {situQ.some(q => q.id === currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
          <SectionHeader num="B" title="สนทนาโต้ตอบในสถานการณ์จำลอง (ข้อ 31-35)" icon="ตอบในบทบาทสมมติตามสถานการณ์ที่กำหนด" />
          {situQ.filter(q => q.id === currentQuestionId).map(q => renderOpenEndedCard({ q }))}
        </section>
      )}

      {tongueQ.some(q => q.id === currentQuestionId) && (
        <section data-question-id={currentQuestionId}>
          <SectionHeader num="C" title="อ่านออกเสียงลิ้นพันกัน Tongue Twister (ข้อ 36-40)" icon="ฟังต้นแบบ แล้วอ่านออกเสียงตามให้ถูกต้องและคล่องแคล่ว" />
          {tongueQ.filter(q => q.id === currentQuestionId).map(q => renderTongueCard({ q }))}
        </section>
      )}

      <QuestionNavigation
        index={currentIndex}
        total={totalQ}
        onChange={setCurrentIndex}
        onSubmit={handleSubmit}
        disabled={submitting || showResult}
      />
    </div>
  );
}
