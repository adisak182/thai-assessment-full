import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {BookOpen,ArrowRight,Edit3,ShieldCheck,Clock,Eye,RefreshCw,UserRound} from 'lucide-react';
import {useUser} from '../context/UserContext';
import {summarizeAttempts} from '../utils/adminSummary';
import {dashboardStatus,filterDashboardHistory} from '../utils/dashboardView';
import ScoreDetailModal from '../components/ScoreDetailModal';
import './Dashboard.css';

const SKILLS=[['listening','การฟัง',25],['speaking','การพูด',15],['reading','การอ่าน',30],['writing','การเขียน',30]];
const LABELS={full_test:'แบบทดสอบรวม 100 ข้อ',listening:'การฟัง',conversation:'การพูด',speaking:'การพูด',reading:'การอ่าน',writing:'การเขียน'};
const formatDate=value=>value ? new Date(value).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : 'ไม่ได้ระบุวันที่';

export default function Dashboard(){
  const {user,fetchScores,fetchHistory}=useUser();
  const [scores,setScores]=useState({});
  const [history,setHistory]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  const [selectedAttempt,setSelectedAttempt]=useState(null);
  const [filter,setFilter]=useState('all');
  const [sort,setSort]=useState('latest');
  const [page,setPage]=useState(1);

  useEffect(()=>{
    if(!user)return;
    let active=true,request=0;
    const load=async()=>{
      const current=++request;
      setLoading(true);setError('');
      try{
        const [raw,attempts]=await Promise.all([fetchScores(),fetchHistory()]);
        if(!active || current!==request)return;
        let flat=raw?.flat || raw || {};
        if(raw?.['1'] || raw?.['2'] || raw?.['3']){
          flat={};
          for(const level of [1,2,3]) for(const [skill,result] of Object.entries(raw[level] || {})){
            if(!flat[skill] || result.score>flat[skill].score)flat[skill]=result;
          }
        }
        setScores(flat);setHistory(attempts || []);
      }catch(err){if(active && current===request)setError(err.message || 'โหลดผลประเมินไม่สำเร็จ');}
      finally{if(active && current===request)setLoading(false);}
    };
    load();window.addEventListener('score-reviewed',load);
    return()=>{active=false;window.removeEventListener('score-reviewed',load);};
  },[user,fetchScores,fetchHistory,retry]);

  const summary=summarizeAttempts(history);
  const best=scores.full_test || null;
  const status=dashboardStatus(best,summary.pending);
  const latest=summary.latestFullTest;
  const filtered=filterDashboardHistory(history,filter,sort);
  const pages=Math.max(1,Math.ceil(filtered.length/10));
  const currentPage=Math.min(page,pages);
  const visible=filtered.slice((currentPage-1)*10,currentPage*10);
  const filters=[['all','ทั้งหมด',history.length],['pending','รอตรวจ',summary.pending],['passed','ผ่าน',summary.passed],['notPassed','ยังไม่ผ่าน',summary.reviewed-summary.passed]];
  if(!user)return null;

  return <div className="page-content learner-dashboard">
    <header className="ld-heading"><div><p className="ld-eyebrow">นรารู้ไทย · พื้นที่การเรียนรู้</p><h1>แดชบอร์ดของคุณ</h1><p className="ld-muted">ติดตามผลประเมินและพัฒนาทักษะภาษาไทยไปด้วยกัน</p></div><Link className="ld-text-link" to="/profile"><Edit3 size={16}/> แก้ไขข้อมูล</Link></header>
    <section className="ld-profile" aria-label="ข้อมูลผู้เรียน">
      <div className="ld-avatar">{user.avatar ? <img src={user.avatar} alt="รูปประจำตัว"/> : <UserRound size={30}/>}</div>
      <div className="ld-identity"><h2>{user.name || 'ผู้เรียน'}</h2><div className="ld-user-tags">{user.age && <span>อายุ {user.age} ปี</span>}<span className={user.is_literacy_learner ? 'ld-learner-tag' : ''}>{user.is_literacy_learner ? 'ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ' : 'ไม่ใช่ผู้เรียนกิจกรรมส่งเสริมการรู้หนังสือ'}</span></div>{user.address && <p className="ld-muted">{user.address}</p>}</div>
      {user.role==='admin' && <Link className="ld-text-link" to="/admin"><ShieldCheck size={16}/> ผู้ดูแลระบบ</Link>}
    </section>
    {error && <div className="ld-error" role="alert"><span>{error}</span><button onClick={()=>setRetry(value=>value+1)} disabled={loading}><RefreshCw size={16}/> ลองใหม่</button></div>}
    {summary.pending>0 && <aside className="ld-pending" role="status"><Clock size={20}/><div><strong>มีผลประเมินรอตรวจ {summary.pending} ครั้ง</strong><p>คะแนนสูงสุดและค่าเฉลี่ยใช้เฉพาะผลที่เจ้าหน้าที่ตรวจครบแล้ว</p></div><a href="#dashboard-history" onClick={()=>{setFilter('pending');setPage(1);}}>ดูรายการ <ArrowRight size={15}/></a></aside>}
    <div className="ld-overview">
      <section className="ld-score-panel">
        <div className="ld-panel-heading"><h3>คะแนนรวมสูงสุด</h3><span className={`ld-status ${loading ? 'neutral' : status.tone}`}>{loading ? 'กำลังโหลด' : status.label}</span></div>
        <div className="ld-score"><strong>{loading || !best ? '—' : best.score}</strong><span>/ {best?.max_score || 100} คะแนน</span></div>
        <p className="ld-score-caption">{loading ? 'กำลังโหลดผลการประเมิน...' : best ? `ระดับ${status.grade} · ร้อยละ ${status.percentage}` : summary.pending ? 'คำตอบของคุณถูกบันทึกแล้ว อยู่ระหว่างการตรวจ' : 'เริ่มทำแบบทดสอบเพื่อดูผลการประเมินของคุณ'}</p>
        <progress aria-label="คะแนนรวมสูงสุดที่ตรวจครบ" max={best?.max_score || 100} value={best?.score || 0}/>
        <p className="ld-muted">แบบทดสอบรวม 100 ข้อ · เกณฑ์ผ่าน 70%</p>
        <div className="ld-score-actions"><Link className="ld-primary" to="/skills"><BookOpen size={18}/>{best ? 'ทำแบบทดสอบอีกครั้ง' : 'เริ่มทำแบบทดสอบ'}<ArrowRight size={17}/></Link><Link className="ld-text-link" to="/ranking">ดูอันดับ</Link></div>
      </section>
      <section className="ld-skills-panel"><div className="ld-panel-heading"><h3>ทักษะภาษาไทยของคุณ</h3><span className="ld-four-skills">4 ทักษะ</span></div><p className="ld-muted">{latest ? 'จากข้อสอบรวมครั้งล่าสุดที่ตรวจครบในประวัติ' : 'ผลรายทักษะจะแสดงเมื่อมีข้อสอบรวมที่ตรวจครบ'}</p>
        <div className="ld-skill-list">{SKILLS.map(([key,label,max])=>{const result=latest?.breakdown?.[key];return <div key={key}><div><span>{label}</span><strong>{loading || !result ? '—' : `${result.score} / ${result.max || max}`}</strong></div><progress aria-label={`คะแนน${label}`} max={result?.max || max} value={result?.score || 0}/></div>;})}</div>
        {latest && <p className="ld-skill-date">ประเมินเมื่อ {formatDate(latest.taken_at)}</p>}
      </section>
    </div>
    <div className="ld-metrics">{[
      ['ประวัติการสอบ',summary.total,'ครั้ง'],['ตรวจครบแล้ว',summary.reviewed,'ครั้ง'],['คะแนนเฉลี่ย',summary.average ?? '—','%'],['รอเจ้าหน้าที่',summary.pending,'ครั้ง'],
    ].map(([label,value,unit])=><div key={label}><span>{label}</span><strong>{loading ? '—' : value}<small>{unit}</small></strong></div>)}</div>
    <section className="ld-history" id="dashboard-history">
      <div className="ld-history-heading"><div><h3>ประวัติการทำแบบทดสอบ</h3><p className="ld-muted">แสดงล่าสุดสูงสุด 50 ครั้ง · ค่าเฉลี่ยคำนวณเป็นร้อยละจากผลที่ตรวจครบในประวัติ</p></div><label className="ld-sort"><span>เรียงประวัติ</span><select value={sort} onChange={event=>{setSort(event.target.value);setPage(1);}}><option value="latest">ล่าสุดก่อน</option><option value="highest">ร้อยละสูงสุดก่อน</option></select></label></div>
      <nav className="ld-history-filters" aria-label="กรองประวัติสอบ">{filters.map(([value,label,count])=><button key={value} aria-pressed={filter===value} onClick={()=>{setFilter(value);setPage(1);}}>{label}<span>{count}</span></button>)}</nav>
      {loading ? <p className="ld-empty" role="status">กำลังโหลดประวัติ...</p> : !history.length ? <div className="ld-empty"><BookOpen size={32}/><h4>เส้นทางการเรียนรู้เริ่มได้ที่นี่</h4><p>เมื่อทำแบบทดสอบแล้ว คุณจะดูผลและคำตอบย้อนหลังได้จากหน้านี้</p></div> : !visible.length ? <p className="ld-empty">ยังไม่มีรายการในสถานะที่เลือก</p> : <div className="ld-history-list">{visible.map(attempt=>{
        const pending=attempt.pending_count>0;
        const result=dashboardStatus(attempt,0);
        return <article key={attempt.id} className="ld-attempt"><div className="ld-attempt-title"><span className="ld-attempt-icon"><BookOpen size={20}/></span><div><h4>{LABELS[attempt.skill] || attempt.skill}</h4><time dateTime={attempt.taken_at}>{formatDate(attempt.taken_at)}</time></div></div><div className="ld-attempt-score"><strong>{attempt.score}<small> / {attempt.max_score}</small></strong><span className={`ld-status ${pending ? 'amber' : result.tone}`}>{pending ? `รอตรวจ ${attempt.pending_count} ข้อ` : `${result.label} · ${result.percentage}%`}</span></div><button className="ld-detail-button" onClick={()=>setSelectedAttempt(attempt)} aria-label={`ดูผลละเอียด ${formatDate(attempt.taken_at)}`}><Eye size={16}/> ดูผลละเอียด</button></article>;
      })}</div>}
      {filtered.length>10 && <div className="ld-pagination"><span>{currentPage} / {pages}</span><div><button disabled={currentPage===1} onClick={()=>setPage(currentPage-1)}>ก่อนหน้า</button><button disabled={currentPage===pages} onClick={()=>setPage(currentPage+1)}>ถัดไป</button></div></div>}
    </section>
    {selectedAttempt && <ScoreDetailModal attempt={selectedAttempt} user={user} onClose={()=>setSelectedAttempt(null)}/>}
  </div>;
}
