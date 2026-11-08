import { useEffect, useRef } from 'react';

export default function QuestionNumbers({ index, answered, onChange, disabled = false }) {
  const current = useRef(null);
  useEffect(() => {
    const button = current.current;
    const strip = button?.parentElement;
    if (strip) strip.scrollTo({ left: button.offsetLeft - (strip.clientWidth - button.clientWidth) / 2, behavior: 'instant' });
  }, [index]);

  return (
    <nav className="question-numbers" aria-label="เลือกเลขข้อสอบ" data-question-numbers>
      <span className="question-numbers-status" aria-label={`อยู่ข้อที่ ${index + 1} จาก ${answered.length}`}>{index + 1}<span>/{answered.length}</span></span>
      <div className="question-numbers-grid">
        {answered.map((done, number) => (
          <button key={number} type="button" ref={number === index ? current : null}
            className={`question-number${done ? ' is-answered' : ''}`}
            aria-label={`ข้อที่ ${number + 1} ${done ? 'ตอบแล้ว' : 'ยังไม่ตอบ'}`}
            aria-current={number === index ? 'step' : undefined}
            disabled={disabled} onClick={() => onChange(number)}>
            {number + 1}
          </button>
        ))}
      </div>
    </nav>
  );
}
