import {useEffect,useImperativeHandle,useRef,useState} from 'react';
import {Mic,Square} from 'lucide-react';
import {useUser} from '../context/UserContext';
import {uploadSpeakingAudio} from '../services/api';
import {pausePromptAudio} from '../utils/promptAudio';
import {createAudioRecording} from '../utils/audioRecording';
import {safeUUID} from '../utils/uuid';
import SpeakingAudioPlayer from './SpeakingAudioPlayer';

export default function VoiceAnswer({ref,questionId,skill,submissionId,audioId,onSaved,onBusyChange,disabled=false}) {
  const {token}=useUser();
  const [phase,setPhase]=useState('idle'),[error,setError]=useState(''),[preview,setPreview]=useState(''),[seconds,setSeconds]=useState(0);
  const recording=useRef(null),draft=useRef(null),upload=useRef(null),mounted=useRef(true);
  const busy=phase!=='idle';
  useEffect(()=>{onBusyChange(busy);},[busy,onBusyChange]);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;recording.current?.cancel();};},[]);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
  useEffect(()=>{
    if(phase!=='recording')return;
    const timer=setInterval(()=>setSeconds(n=>n+1),1000);return()=>clearInterval(timer);
  },[phase]);
  useEffect(()=>{
    if(!busy)return;
    const warn=event=>{event.preventDefault();event.returnValue='';};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[busy]);
  const save=()=>{
    if(upload.current)return upload.current;
    upload.current=(async()=>{
      if(!draft.current&&recording.current){
        const blob=await recording.current.stop();recording.current=null;
        if(!blob)return null;
        draft.current={blob,id:safeUUID()};
        if(mounted.current)setPreview(URL.createObjectURL(blob));
      }
      if(!draft.current)return null;
      const clip=draft.current;
      if(mounted.current){setPhase('uploading');setError('');}
      const result=await uploadSpeakingAudio(token,clip.id,clip.blob,{questionId,skill,submissionId});
      onSaved(result.audioId);draft.current=null;
      if(mounted.current){setPhase('idle');setPreview('');}
      return result.audioId;
    })().catch(error=>{if(mounted.current){setPhase('ready');setError(error.name==='TimeoutError'?'ส่งเสียงนานเกินไป เสียงยังอยู่ กดลองบันทึกอีกครั้ง':error.name==='TypeError'?'เชื่อมต่อไม่ได้ เสียงยังอยู่ในหน้านี้ กรุณาลองบันทึกอีกครั้ง':error.message);}throw error;}).finally(()=>{upload.current=null;});
    return upload.current;
  };
  useImperativeHandle(ref,()=>({finish:save}));
  const start=()=>{
    if(disabled)return;
    pausePromptAudio();setError('');setSeconds(0);
    const operation=createAudioRecording(navigator.mediaDevices,window.MediaRecorder,{
      onState:next=>{if(mounted.current)setPhase(next);},onError:message=>{if(mounted.current)setError(message);},
    });
    recording.current=operation;operation.start();
  };
  const toggle=()=>{
    if(phase==='checking'){recording.current?.cancel();recording.current=null;setPhase('idle');return;}
    if(phase==='recording'||phase==='ready'){save().catch(()=>{});return;}
    start();
  };
  return <div style={{display:'grid',gap:10}}>
    <button type="button" className="btn-primary" onClick={toggle} disabled={disabled||phase==='uploading'||phase==='processing'} style={{width:'100%',justifyContent:'center',...(phase==='recording'?{background:'#b91c1c'}:{})}}>
      {phase==='recording'?<Square size={18}/>:<Mic size={18}/>}
      {phase==='checking'?'กำลังเปิดไมโครโฟน… (กดเพื่อยกเลิก)':phase==='recording'?`หยุดและบันทึกเสียง · ${seconds} วินาที`:phase==='processing'?'กำลังเตรียมเสียง…':phase==='uploading'?'กำลังบันทึกเสียง…':phase==='ready'?'ลองบันทึกเสียงอีกครั้ง':audioId?'อัดเสียงใหม่':'กดเพื่ออัดคำตอบ'}
    </button>
    <p style={{margin:0,fontSize:'.875rem',color:'var(--text-muted)'}}>อัดได้ข้อละ 90 วินาที กดหยุดเพื่อส่งเสียงให้ผู้ประเมินในระบบนี้ · ไม่มีการแปลงเป็นข้อความอัตโนมัติ</p>
    {preview&&phase==='ready'&&<audio controls src={preview} aria-label="ฟังเสียงที่ยังส่งไม่สำเร็จ" style={{width:'100%'}}/>}
    {audioId&&phase==='idle'&&<><p role="status" style={{margin:0,color:'#047857'}}>บันทึกเสียงแล้ว · รอผู้ประเมินตรวจ</p><SpeakingAudioPlayer key={audioId} audioId={audioId}/></>}
    {error&&<p role="alert" style={{margin:0,color:'#b91c1c'}}>{error}</p>}
    {phase==='ready'&&<button type="button" className="btn-secondary" onClick={()=>{draft.current=null;recording.current?.cancel();recording.current=null;setPreview('');setPhase('idle');setError('');}}>ทิ้งเสียงที่ยังไม่บันทึก</button>}
  </div>;
}
