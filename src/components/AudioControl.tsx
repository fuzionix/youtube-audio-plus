import { useState, useEffect, useRef } from 'react';
import { AudioLines } from 'lucide-react';
import AudioPanel from './AudioPanel.tsx';

const AudioControl = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;
      const path = event.composedPath();
      if (containerRef.current && !path.includes(containerRef.current)) {
        setIsOpen(false);
      }
    };

    // Note: In a Shadow DOM. Events propagate differently.
    window.addEventListener('click', handleClickOutside, true);
    return () => window.removeEventListener('click', handleClickOutside, true);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative flex items-center h-full">
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // To prevent immediate triggering of window listener
          setIsOpen(!isOpen);
        }}
        className={`w-[48px] h-full border-none cursor-pointer bg-transparent flex items-center justify-center transition-opacity duration-100 focus:outline-none`}
        aria-label="Audio Settings"
        title="Audio Settings"
      >
        <AudioLines 
          size={24} 
          className="text-white fill-current" 
          strokeWidth={2}
        />
      </button>

      {/* Panel Popup */}
      {isOpen && (
        <div className="absolute bottom-12 left-0 z-50">
          <AudioPanel onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
};

export default AudioControl;