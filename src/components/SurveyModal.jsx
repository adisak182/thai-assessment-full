import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

const RATING_CHOICES = [
  { val: 4, label: 'ดีมาก' },
  { val: 3, label: 'ดี' },
  { val: 2, label: 'พอใช้' },
  { val: 1, label: 'ปรับปรุง' },
];

export default function SurveyModal({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    gender: '', age: '', target_group: '', district: '', province: '',
    design_1: 0, design_2: 0, design_3: 0, design_4: 0,
    content_1: 0, content_2: 0, content_3: 0, content_4: 0,
    benefit_1: 0, benefit_2: 0, benefit_3: 0, benefit_4: 0,
    suggestions: ''
  });

  const handleChange = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  const canGoStep2 = data.gender && data.age && data.target_group && data.district && data.province;
  const canSubmit = data.design_1 && data.design_2 && data.design_3 && data.design_4 &&
                    data.content_1 && data.content_2 && data.content_3 && data.content_4 &&
                    data.benefit_1 && data.benefit_2 && data.benefit_3 && data.benefit_4;

  const handleSubmit = () => {
    if (canSubmit) onSubmit(data);
  };

  const RatingRow = ({ name, title }) => (
    <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px' }}>
      <div style={{ marginBottom: '10px', fontWeight: '600', color: 'var(--color-primary-dark)' }}>{title}</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {RATING_CHOICES.map(c => (
          <button key={c.val} onClick={() => handleChange(name, c.val)}
            style={{ flex: 1, minWidth: '80px', padding: '10px', borderRadius: '8px', border: `2px solid ${data[name] === c.val ? '#10b981' : 'rgba(0,0,0,0.1)'}`, background: data[name] === c.val ? 'rgba(16,185,129,0.1)' : 'white', color: data[name] === c.val ? '#059669' : '#4b5563', fontWeight: data[name] === c.val ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', overflowY: 'auto' }}>
      <div className="animate-fade-in" style={{ background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', margin: '0 0 8px' }}>การประเมินความพึงพอใจ</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>กรุณาทำแบบประเมินก่อนดูคะแนนสอบ</p>
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--color-primary)', borderBottom: '2px solid rgba(139,92,246,0.2)', paddingBottom: '8px', marginBottom: '20px' }}>ส่วนที่ 1 ข้อมูลทั่วไป</h3>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>1. เพศ</label>
                <select value={data.gender} onChange={e => handleChange('gender', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(0,0,0,0.1)', outline: 'none' }}>
                  <option value="">-- เลือกเพศ --</option>
                  <option value="ชาย">ชาย</option>
                  <option value="หญิง">หญิง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>2. อายุ</label>
                <input type="number" placeholder="ระบุอายุ (ปี)" value={data.age} onChange={e => handleChange('age', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(0,0,0,0.1)', outline: 'none' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>3. กลุ่มเป้าหมาย</label>
              <select value={data.target_group} onChange={e => handleChange('target_group', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(0,0,0,0.1)', outline: 'none' }}>
                <option value="">-- เลือกกลุ่มเป้าหมาย --</option>
                <option value="นักศึกษาระดับประถม">นักศึกษาระดับประถม</option>
                <option value="นักศึกษาระดับม.ต้น">นักศึกษาระดับม.ต้น</option>
                <option value="นักศึกษาระดับม.ปลาย">นักศึกษาระดับม.ปลาย</option>
                <option value="ผู้ไม่รู้หนังสือ/ผู้ลืมหนังสือ">ผู้ไม่รู้หนังสือ/ผู้ลืมหนังสือ</option>
                <option value="ประชาชนทั่วไป">ประชาชนทั่วไป</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>4. ภูมิลำเนา (อำเภอ)</label>
                <input type="text" placeholder="ระบุอำเภอ" value={data.district} onChange={e => handleChange('district', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(0,0,0,0.1)', outline: 'none' }} />
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>ภูมิลำเนา (จังหวัด)</label>
                <input type="text" placeholder="ระบุจังหวัด" value={data.province} onChange={e => handleChange('province', e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid rgba(0,0,0,0.1)', outline: 'none' }} />
              </div>
            </div>

            <button onClick={() => setStep(2)} disabled={!canGoStep2} className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', fontSize: '1.1rem', opacity: canGoStep2 ? 1 : 0.5 }}>
              ถัดไป (ส่วนที่ 2 การประเมิน)
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--color-primary)', borderBottom: '2px solid rgba(139,92,246,0.2)', paddingBottom: '8px', marginBottom: '20px' }}>ส่วนที่ 2 การประเมินความพึงพอใจ</h3>

            <h4 style={{ color: '#4b5563', marginBottom: '12px' }}>1. ด้านการออกแบบและการใช้งาน</h4>
            <RatingRow name="design_1" title="1.1 แอปพลิเคชันมีเมนูการใช้งานที่ไม่ซับซ้อน เข้าถึงง่าย" />
            <RatingRow name="design_2" title="1.2 แอปพลิเคชันมีความน่าสนใจและทันสมัย" />
            <RatingRow name="design_3" title="1.3 ขนาดตัวอักษรมีความเหมาะสมชัดเจน" />
            <RatingRow name="design_4" title="1.4 ภาพประกอบมีความชัดเจนและสอดคล้องกับเนื้อหา" />

            <h4 style={{ color: '#4b5563', marginBottom: '12px', marginTop: '24px' }}>2. ด้านเนื้อหา</h4>
            <RatingRow name="content_1" title="2.1 เนื้อหามีความถูกต้องตามหลักภาษาไทย" />
            <RatingRow name="content_2" title="2.2 เนื้อหามีความเหมาะสมตามระดับการประเมิน" />
            <RatingRow name="content_3" title="2.3 การเรียงลำดับเนื้อหามีความเหมาะสมจากง่ายไปยาก" />
            <RatingRow name="content_4" title="2.4 เนื้อหามีความน่าสนใจและทันสมัย" />

            <h4 style={{ color: '#4b5563', marginBottom: '12px', marginTop: '24px' }}>3. ประโยชน์การนำไปใช้</h4>
            <RatingRow name="benefit_1" title="3.1 แอปพลิเคชันช่วยส่งเสริมความรู้ด้านภาษาไทย" />
            <RatingRow name="benefit_2" title="3.2 แอปพลิเคชันสามารถพัฒนาทักษะการใช้ภาษาไทยได้ดีขึ้น" />
            <RatingRow name="benefit_3" title="3.3 ผู้ใช้งานสามารถนำความรู้ไปประยุกต์ใช้ในชีวิตประจำวันได้" />
            <RatingRow name="benefit_4" title="3.4 ผู้ใช้งานเห็นคุณค่าและตระหนักถึงความสำคัญของภาษาไทย" />

            <h4 style={{ color: '#4b5563', marginBottom: '12px', marginTop: '24px' }}>ส่วนที่ 3 ข้อเสนอแนะเพื่อการพัฒนา</h4>
            <textarea placeholder="พิมพ์ข้อเสนอแนะที่นี่..." value={data.suggestions} onChange={e => handleChange('suggestions', e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.1)', outline: 'none', minHeight: '100px', resize: 'vertical', marginBottom: '24px', fontFamily: 'inherit' }} />

            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setStep(1)} className="btn-secondary" style={{ padding: '14px 24px', borderRadius: '12px' }}>ย้อนกลับ</button>
              <button onClick={handleSubmit} disabled={!canSubmit} className="btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '1.1rem', opacity: canSubmit ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Send size={20} /> ส่งแบบประเมินและดูคะแนน
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
