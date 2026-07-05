import { useState } from 'react';
import { X, Video, RefreshCw, ChevronDown } from 'lucide-react';

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: VideoConfig) => void;
  imageUrl: string;
  imagePrompt?: string;
  isGenerating: boolean;
}

export interface VideoConfig {
  prompt: string;
  resolution: string;
  duration: string;
  aspectRatio: string;
  generateAudio: boolean;
  bitrateMode: string;
}

const RESOLUTIONS = [
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p (Recommended)' },
];

const DURATIONS = [
  { value: 'auto', label: 'Auto' },
  { value: '4', label: '4 seconds' },
  { value: '5', label: '5 seconds' },
  { value: '6', label: '6 seconds' },
  { value: '8', label: '8 seconds' },
  { value: '10', label: '10 seconds' },
  { value: '15', label: '15 seconds' },
];

const ASPECT_RATIOS = [
  { value: 'auto', label: 'Auto' },
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '1:1', label: '1:1 (Square)' },
];

const BITRATE_MODES = [
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
];

export function VideoGenerationModal({
  isOpen,
  onClose,
  onGenerate,
  imageUrl,
  imagePrompt,
  isGenerating,
}: VideoGenerationModalProps) {
  const [prompt, setPrompt] = useState(imagePrompt || '');
  const [resolution, setResolution] = useState('720p');
  const [duration, setDuration] = useState('auto');
  const [aspectRatio, setAspectRatio] = useState('auto');
  const [generateAudio, setGenerateAudio] = useState(true);
  const [bitrateMode, setBitrateMode] = useState('standard');
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = () => {
    onGenerate({
      prompt,
      resolution,
      duration,
      aspectRatio,
      generateAudio,
      bitrateMode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-container-high border border-border-subtle rounded-xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-border-subtle flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-headings font-bold text-white">Generate Video</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={isGenerating}
            className="text-ink-muted hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image Preview */}
          <div className="relative aspect-video rounded-lg overflow-hidden border border-border-subtle">
            <img 
              src={imageUrl} 
              alt="Source image" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 bg-primary/20 border border-primary/30 rounded text-primary text-xs font-medium">
                First Frame
              </span>
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-ink-text">
              Motion Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how the image should move..."
              className="w-full h-24 bg-background border border-border-subtle rounded-lg p-3 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <p className="text-xs text-ink-muted">
              Describe the motion and animation you want to see in the video.
            </p>
          </div>

          {/* Quick Options */}
          <div className="grid grid-cols-2 gap-4">
            {/* Resolution */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                Resolution
              </label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                {RESOLUTIONS.map((res) => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-background border border-border-subtle rounded-lg p-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                {DURATIONS.map((dur) => (
                  <option key={dur.value} value={dur.value}>
                    {dur.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <button
                  key={ratio.value}
                  onClick={() => setAspectRatio(ratio.value)}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                    aspectRatio === ratio.value
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'bg-background border-border-subtle text-ink-muted hover:text-white hover:border-white/20'
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border border-border-subtle rounded-lg overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-ink-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              <span>Advanced Options</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            
            {showAdvanced && (
              <div className="px-4 pb-4 space-y-4 border-t border-border-subtle pt-4">
                {/* Generate Audio */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Generate Audio</p>
                    <p className="text-xs text-ink-muted">Add AI-generated sound to the video</p>
                  </div>
                  <button
                    onClick={() => setGenerateAudio(!generateAudio)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      generateAudio ? 'bg-primary' : 'bg-white/20'
                    }`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      generateAudio ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>

                {/* Bitrate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-ink-muted uppercase tracking-wider">
                    Bitrate
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {BITRATE_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() => setBitrateMode(mode.value)}
                        className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                          bitrateMode === mode.value
                            ? 'bg-primary/20 border-primary/50 text-primary'
                            : 'bg-background border-border-subtle text-ink-muted hover:text-white hover:border-white/20'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-subtle flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 rounded-lg text-ink-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                Generate Video
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
