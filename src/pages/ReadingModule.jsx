import { useParams } from 'react-router-dom';
import Level1Reading from './Level1Reading';
import Level2Reading from './Level2Reading';
import Level3Reading from './Level3Reading';

export default function ReadingModule() {
  const { id } = useParams();

  if (id === '1') {
    return <Level1Reading />;
  }
  
  if (id === '2') {
    return <Level2Reading />;
  }

  if (id === '3') {
    return <Level3Reading />;
  }

  return (
    <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
      <h2>Module not available for Level {id} yet.</h2>
    </div>
  );
}
