import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { useNavigate } from 'react-router-dom';

const LOTTIE_MAP = {
  empty: "https://lottie.host/bf631cb4-c47b-461d-bc02-6240a93156bf/WaIibl6KJK.json",
  404: "https://assets3.lottiefiles.com/packages/lf20_suhe7qtm.json",
  error: "https://assets3.lottiefiles.com/packages/lf20_suhe7qtm.json", // Reusing 404 for generic error, filtered to red if needed
  loading: "https://lottie.host/bf631cb4-c47b-461d-bc02-6240a93156bf/WaIibl6KJK.json"
};

const SIZE_MAP = {
  sm: { width: '160px', height: '160px' },
  md: { width: '250px', height: '250px' },
  lg: { width: '350px', height: '350px' },
};

const AnimationState = ({
  variant = 'empty', // 'empty' | '404' | 'error' | 'success' | 'loading' | 'custom'
  title,
  description,
  buttonText,
  buttonAction,
  icon,
  size = 'md',
  illustration,
  className = '',
  children
}) => {
  const navigate = useNavigate();
  
  const lottieSrc = illustration || LOTTIE_MAP[variant] || LOTTIE_MAP.empty;
  const dimensions = SIZE_MAP[size] || SIZE_MAP.md;

  // Derive default text based on variant if not provided
  const displayTitle = title || (
    variant === '404' ? 'Page Not Found' :
    variant === 'error' ? 'Something went wrong' :
    variant === 'empty' ? 'No Results Found' :
    variant === 'loading' ? 'Loading...' : ''
  );

  const displayDesc = description || (
    variant === '404' ? "This route doesn't exist in the Coduelo arena." :
    variant === 'error' ? "We encountered an unexpected issue processing your request." :
    variant === 'empty' ? "Try adjusting your filters or search criteria." : ''
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`w-full max-w-lg mx-auto flex flex-col items-center justify-center py-12 lg:py-16 text-center ${className}`}
    >
      {/* Visual / Animation Area */}
      <div className="relative mb-6 flex items-center justify-center select-none pointer-events-none">
        {icon ? (
          <div className="text-5xl opacity-80 mb-2">{icon}</div>
        ) : (
          <div 
            className={`transition-opacity duration-500 ease-in-out ${variant === '404' || variant === 'error' ? 'opacity-80 grayscale-[0.3]' : 'opacity-85'}`}
            style={{ 
              ...dimensions,
              filter: variant === 'error' ? 'sepia(1) hue-rotate(-50deg) saturate(3) brightness(0.9)' : 'none'
            }}
          >
            <Player
              autoplay
              loop
              src={lottieSrc}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>

      {/* Typography Hierarchy */}
      <div className="space-y-2 max-w-sm mx-auto">
        {displayTitle && (
          <h3 className="text-[17px] md:text-[19px] font-bold text-text-primary tracking-tight">
            {displayTitle}
          </h3>
        )}
        {displayDesc && (
          <p className="text-[14px] md:text-[15px] text-text-secondary leading-relaxed">
            {displayDesc}
          </p>
        )}
      </div>

      {/* Action Area */}
      {(buttonText || children) && (
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {buttonText && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={buttonAction || (() => navigate('/'))}
              className="px-5 py-2.5 rounded-lg bg-elevated border border-border text-text-primary text-[14px] font-semibold hover:bg-overlay transition-colors shadow-sm flex items-center gap-2"
            >
              {buttonText}
            </motion.button>
          )}
          {children}
        </div>
      )}
    </motion.div>
  );
};

export default AnimationState;
