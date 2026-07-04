import { motion, AnimatePresence } from 'framer-motion';

const PageLoaderAnimation = ({ isDark }) => {
  const primaryColor = isDark ? '#00F5C4' : '#4F6EF7';
  const secondaryColor = isDark ? '#334155' : '#E2E8F0';

  return (
    <div className="relative flex items-center justify-center w-14 h-14">
      <motion.div
        className="absolute w-full h-full rounded-full border-2 border-transparent"
        style={{ borderTopColor: primaryColor, borderBottomColor: primaryColor }}
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-10 h-10 rounded-full border-2 border-transparent"
        style={{ borderLeftColor: secondaryColor, borderRightColor: secondaryColor }}
        animate={{ rotate: -360, scale: [1, 0.9, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};

const PageLoader = ({ isLoading, isDark, message = "Loading data..." }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center w-full h-full min-h-[400px] bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <PageLoaderAnimation isDark={isDark} />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={`mt-6 text-sm font-bold tracking-wide uppercase ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
          >
            {message}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PageLoader;
