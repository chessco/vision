// ─── Chat Message Bubble ─────────────────────────────────────────
// Renders user or AI messages with support for rich content like images and actions.

import clsx from 'clsx';
import { UserCircle, Sparkles, Check, Download, Share2, RefreshCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
}

interface ChatMessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onApprove?: () => void;
  onActionClick?: (action: string) => void;
}

export function ChatMessageBubble({ message, onRegenerate, onApprove, onActionClick }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';
  const { t } = useTranslation();

  return (
    <div className={clsx('flex gap-4 max-w-4xl', isUser ? 'ml-auto flex-row-reverse' : 'mr-auto')}>
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-gradient-to-br from-primary to-secondary text-white' : 'bg-primary/20 text-primary border border-primary/30',
      )}>
        {isUser ? <UserCircle className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
      </div>

      <div className="space-y-3">
        {isUser ? (
          <div className="bg-primary/10 border border-primary/20 text-white rounded-2xl rounded-tr-sm px-5 py-3 text-sm">
            {message.content}
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 text-white rounded-2xl rounded-tl-sm px-5 py-4 text-sm prose prose-invert max-w-none">
            {/* If there's an image in metadata, render it first */}
            {message.metadata?.assetUrl && (
              <div className="mb-4">
                <div className="relative rounded-xl overflow-hidden border border-border-subtle group">
                  <img src={message.metadata.assetUrl} alt="Generated asset" className="w-full h-auto object-cover max-h-[400px]" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = message.metadata.assetUrl;
                        a.download = 'generated-asset.png';
                        a.click();
                      }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(message.metadata.assetUrl);
                        alert('Asset URL copied to clipboard!');
                      }}
                      className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                      title="Share link"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    {onRegenerate && (
                      <button 
                        onClick={onRegenerate}
                        className="p-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                        title="Regenerate"
                      >
                        <RefreshCcw className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={onApprove}
                      className="p-2 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-white backdrop-blur-sm px-4 font-medium flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Approve
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br/>') }} />
            
            {message.metadata?.suggestedActions && (
              <div className="mt-4 flex flex-wrap gap-2">
                {message.metadata.suggestedActions.map((action: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => onActionClick && onActionClick(action)}
                    className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition-colors"
                  >
                    {t(action)}
                  </button>
                ))}
              </div>
            )}

            {/* Prominent Approve Button at the bottom of the message */}
            {message.metadata?.assetUrl && onApprove && (
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button 
                  onClick={onApprove}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 px-6 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <Check className="w-5 h-5" /> {t('Approve Campaign')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
