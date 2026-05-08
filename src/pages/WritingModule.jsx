import { useParams } from 'react-router-dom';
import Level1Writing from './Level1Writing';
import Level2Writing from './Level2Writing';
import Level3Writing from './Level3Writing';

export default function WritingModule() {
  const { id } = useParams();

  if (id === '1') {
    return <Level1Writing />;
  }
  
  if (id === '2') {
    return <Level2Writing />;
  }

  if (id === '3') {
    return <Level3Writing />;
  }

  return (
    <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
      <h2>Module not available for Level {id} yet.</h2>
    </div>
  );
}
