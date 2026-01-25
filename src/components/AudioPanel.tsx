import React from 'react';

interface AudioPanelProps {
  onClose: () => void;
}

const AudioPanel: React.FC<AudioPanelProps> = () => {
  return (
    <div className="w-80 bg-yt-panel text-yt-text rounded-xl shadow-2xl border border-yt-border backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-yt-border bg-black/20">
        <h2 className="text-sm font-medium tracking-wide">Audio Enhancer</h2>
      </div>
    </div>
  );
};

export default AudioPanel;