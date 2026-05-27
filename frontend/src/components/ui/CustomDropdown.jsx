import React, { useState, useRef, useEffect } from 'react';
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
        className={`w-full flex items-center justify-between text-left transition-all duration-200 outline-none ${
          buttonClassName ||
          'bg-elevated border border-border hover:border-accent-primary/60 focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/10 rounded-xl px-4 py-3 text-xs outline-none text-text-secondary font-bold cursor-pointer'
        }`}
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
            className={`absolute left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden shadow-xl border overflow-y-auto max-h-60 ${
              menuClassName || 'bg-elevated border-border/80 backdrop-blur-md'
            }`}
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
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors duration-150 block truncate ${
                      isSelected
                        ? 'bg-accent-primary/10 text-accent-primary font-extrabold border-l-2 border-accent-primary'
                        : 'hover:bg-overlay text-text-primary hover:text-accent-primary'
                    } ${optionClassName}`}
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
