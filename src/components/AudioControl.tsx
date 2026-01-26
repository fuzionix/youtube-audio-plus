import React from 'react';
import { AudioLines } from 'lucide-react';

const AudioControl = () => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('YT_AUDIO_PLUS_TOGGLE'));
  };

  return (
    <button
      onClick={handleClick}
      className="ytp-button w-[48px] h-full border-none cursor-pointer bg-transparent flex items-center justify-center transition-opacity focus:outline-none"
      aria-label="Audio Settings"
      title="Audio Settings"
      style={{ verticalAlign: 'top' }}
    >
      <AudioLines 
        size={24} 
        className="text-white fill-current" 
        strokeWidth={2}
      />
    </button>
  );
};

export default AudioControl;