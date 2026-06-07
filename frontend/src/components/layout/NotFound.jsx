import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/index';

const NotFound = () => {
  const navigate = useNavigate();
  useDocumentTitle('Page Not Found');
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-base flex flex-col items-center justify-center gap-6 text-center px-4"
    >
      <p className="text-8xl font-extrabold text-gradient-primary">404</p>
      <h1 className="text-2xl font-bold text-text-primary">Page Not Found</h1>
      <p className="text-text-secondary max-w-sm">This route doesn't exist in the BattleCode arena. You may have taken a wrong turn.</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-blue text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        ← Back to Dashboard
      </button>
    </motion.div>
  );
};

export default NotFound;
