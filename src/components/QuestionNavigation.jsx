import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function QuestionNavigation({ index, total, onChange, onSubmit, disabled = false }) {
  const previous = useRef(index);
  useEffect(() => {
    if (previous.current === index) return;
    previous.current = index;
    const heading = document.querySelector('[data-current-question]');
    heading?.focus({ preventScroll: true });
    (document.querySelector('[data-question-numbers]') || heading)?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [index]);
  return (
    <nav className="exam-actions" aria-label="เปลี่ยนข้อสอบ" style={{display:'flex',marginTop:24}}>
      <button type="button" className="btn-secondary" disabled={disabled || index === 0} onClick={() => onChange(index - 1)}>
        <ChevronLeft size={20} /> ย้อนกลับ
      </button>
      {index < total - 1 ? (
        <button type="button" className="btn-primary" disabled={disabled} onClick={() => onChange(index + 1)}>
          ถัดไป <ChevronRight size={20} />
        </button>
      ) : (
        <button type="button" className="btn-primary" disabled={disabled} onClick={onSubmit}>
          <Send size={20} /> ส่งคำตอบ
        </button>
      )}
    </nav>
  );
}
