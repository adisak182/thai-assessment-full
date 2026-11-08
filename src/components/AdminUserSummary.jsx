import { summarizeAttempts } from '../utils/adminSummary';
const skills = [['listening','การฟัง',25],['speaking','การพูด',15],['reading','การอ่าน',30],['writing','การเขียน',30]];
export default function AdminUserSummary({ user, history }) {
  const summary = history ? summarizeAttempts(history) : null;
  const profile = [['สถานะกิจกรรมรู้หนังสือ',user.is_literacy_learner ? 'เป็นผู้เรียนกิจกรรม' : 'ไม่ใช่ผู้เรียนกิจกรรม'],['อายุ',user.age ? `${user.age} ปี` : null],['เพศ',user.gender],['สถานะการศึกษา',user.status],['ระดับการศึกษา',user.education_level],['สถานะการทำงาน',user.employment_status],['ที่อยู่',user.address],['วันที่สมัคร',user.created_at ? new Date(user.created_at).toLocaleDateString('th-TH') : null]];
  return <section className="admin-user-summary">
    <h4>ข้อมูลผู้เรียน</h4>
    <dl className="admin-profile-grid">{profile.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || 'ไม่ได้ระบุ'}</dd></div>)}</dl>
    {summary && <>
      <div className="admin-person-metrics">
        <div><span>สอบทั้งหมด</span><strong>{summary.total} <small>ครั้ง</small></strong></div>
        <div><span>รอตรวจ</span><strong>{summary.pending} <small>ครั้ง</small></strong></div>
        <div><span>เฉลี่ยที่ตรวจครบ</span><strong>{summary.average === null ? '—' : `${summary.average}%`}</strong></div>
        <div><span>สูงสุดที่ตรวจครบ</span><strong>{summary.best === null ? '—' : `${summary.best}%`}</strong></div>
      </div>
      <h4>ผลแยกทักษะ</h4>
      <p className="admin-muted">ข้อสอบรวมครั้งล่าสุดที่ตรวจครบ{summary.latestFullTest ? ` · ${new Date(summary.latestFullTest.taken_at).toLocaleDateString('th-TH')}` : ' · ยังไม่มีผลที่ตรวจครบ'}</p>
      <div className="admin-skill-grid">{skills.map(([key,label,max]) => {
        const result = summary.latestFullTest?.breakdown?.[key];
        return <div key={key}><div><span>{label}</span><strong>{result ? `${result.score} / ${result.max || max}` : '—'}</strong></div><progress aria-label={label} max={result?.max || max} value={result?.score || 0} /></div>;
      })}</div>
    </>}
  </section>;
}
