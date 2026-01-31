import React from 'react';
import { AudioLines } from 'lucide-react';

const AudioControl = () => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('YT_AUDIO_PLUS_TOGGLE'));
  };

  return (
    <div className="flex items-center justify-center m-2 w-16 h-16 rounded-full bg-yt-overlayBackground">
      <button
        onClick={handleClick}
        className="flex items-center justify-center p-1.5 rounded-full border-none bg-transparent cursor-pointer transition-opacity hover:bg-yt-overlayButtonSecondary focus:outline-none"
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
    </div>
  );
};

export default AudioControl;