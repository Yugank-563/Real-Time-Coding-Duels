import { useDocumentTitle } from '../../hooks/index';
import { AnimationState } from '../../components/index';

const NotFound = () => {
  useDocumentTitle('Page Not Found');
  
  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <AnimationState 
        variant="404"
        size="lg"
      />
    </div>
  );
};


export default NotFound;
