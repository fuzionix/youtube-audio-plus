import { useState, useEffect, useRef } from 'react';
import AudioPanel from './AudioPanel';
import { AnimatePresence, motion } from 'framer-motion';

const AudioPanelOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    
    // Listen for the toggle event from the button
    window.addEventListener('YT_AUDIO_PLUS_TOGGLE', handleToggle);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      
      const path = event.composedPath();
      
      if (panelRef.current && !path.includes(panelRef.current)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('YT_AUDIO_PLUS_TOGGLE', handleToggle);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="w-full h-full relative pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            className="absolute bottom-[62px] left-[12px] pointer-events-auto z-50"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <AudioPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AudioPanelOverlay;