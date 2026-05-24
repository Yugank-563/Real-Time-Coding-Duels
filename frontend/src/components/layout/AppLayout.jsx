import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

const AppLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col font-sans">
      {/* Top Navbar (mobile only — on desktop the sidebar handles navigation) */}
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile, visible md+ */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto pb-8" style={{ marginBottom: '28px' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* VS Code style status bar — fixed bottom */}
      <StatusBar />
    </div>
  );
};

export default AppLayout;
