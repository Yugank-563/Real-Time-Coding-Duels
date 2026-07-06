import {  useState, useRef, useEffect  } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const CustomDropdown = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={buttonClassName || "input flex items-center justify-between cursor-pointer"}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 shrink-0 text-text-muted ${isOpen ? 'rotate-180 text-accent-primary' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={menuClassName || "dropdown-menu absolute left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden overflow-y-auto max-h-60"}
          >
            {options.length === 0 ? (
              <div className="px-4 py-3 text-xs text-text-muted italic">No options available</div>
            ) : (
              options.map((option) => {
                const isSelected = String(option.value) === String(value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={
                      optionClassName 
                        ? `${optionClassName} ${isSelected ? 'dropdown-option--selected' : ''}`
                        : `dropdown-option w-full text-left px-4 py-2.5 text-xs block truncate ${isSelected ? 'dropdown-option--selected' : ''}`
                    }
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
