import { useParams } from 'react-router-dom';
import Level1Listening from './Level1Listening';
import Level2Listening from './Level2Listening';
import Level3Listening from './Level3Listening';

export default function ListeningModule() {
  const { id } = useParams();

  if (id === '1') {
    return <Level1Listening />;
  }
  
  if (id === '2') {
    return <Level2Listening />;
  }

  if (id === '3') {
    return <Level3Listening />;
  }

  // Fallback for other levels or if none specified
  return (
    <div className="animate-fade-in px-4 py-8 max-w-2xl mx-auto text-center">
      <h2>Module not available for Level {id} yet.</h2>
    </div>
  );
}
