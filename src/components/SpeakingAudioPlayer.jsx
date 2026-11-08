import {useEffect,useRef,useState} from 'react';
import {useUser} from '../context/UserContext';
import {getSpeakingAudio} from '../services/api';
export default function SpeakingAudioPlayer({audioId}) {
  const {token}=useUser();
  const mounted=useRef(true);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  const [source,setSource]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false);
  useEffect(()=>()=>{if(source)URL.revokeObjectURL(source);},[source]);
  const load=async()=>{
    setLoading(true);setError('');
    try{const blob=await getSpeakingAudio(token,audioId);if(mounted.current)setSource(URL.createObjectURL(blob));}
    catch(error){if(mounted.current)setError(error.message);}finally{if(mounted.current)setLoading(false);}
  };
  return <div style={{marginTop:10}}>
    {source?<audio controls preload="metadata" src={source} aria-label="เสียงคำตอบของผู้เรียน" style={{width:'100%',maxWidth:360}}/>:<button type="button" className="btn-secondary" disabled={loading} onClick={load}>{loading?'กำลังโหลดเสียง…':'ฟังเสียงคำตอบ'}</button>}
    {error&&<p role="alert">{error}</p>}
  </div>;
}
