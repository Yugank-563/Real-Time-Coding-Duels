import { useDocumentTitle } from '../../hooks/index';
import AnimationState from './AnimationState';

const NotFound = () => {
  useDocumentTitle('Page Not Found');

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <AnimationState 
        variant="404"
        size="lg"
      />
    </div>
  );
};


export default NotFound;
