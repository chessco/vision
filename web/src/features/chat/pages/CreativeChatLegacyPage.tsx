import React, { useState } from 'react';
import { 
  MessageSquare, MoreVertical, Paperclip, Send, 
  CheckCircle2, Loader2, Copy, Download, SlidersHorizontal, Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function CreativeChatLegacyPage() {
  const [inputText, setInputText] = useState('');
  const { t } = useTranslation();

  // Mock state to replicate the screenshot
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'user',
      content: 'Genera una campaña para Facebook sobre seguridad pública.'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'Entendido. Estoy procesando tu campaña...',
      status: 'processing', // 'processing' | 'done'
      steps: [
        { label: 'Analyzing style...', state: 'done' },
        { label: 'Generating prompts...', state: 'done' },
        { label: 'Rendering images with Fal.ai...', state: 'loading' }
      ]
    }
  ]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    
    setMessages([...messages, { id: Date.now().toString(), role: 'user', content: inputText }]);
    setInputText('');
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'He terminado de procesar tu solicitud. Aquí tienes los resultados.',
        status: 'done',
        steps: [
          { label: 'Analyzing style...', state: 'done' },
          { label: 'Generating prompts...', state: 'done' },
          { label: 'Rendering images with Fal.ai...', state: 'done' }
        ]
      }]);
    }, 1500);
  };

  return (
    <div className="flex h-full bg-[#0A0A0B] text-white overflow-hidden font-sans">
      
      {/* LEFT PANEL: Chat History */}
      <div className="w-72 flex-shrink-0 border-r border-white/10 bg-[#0F1014] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white tracking-tight">{t('Chat History')}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">{t('Today')}</h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <div className="font-semibold text-sm text-white group-hover:text-primary transition-colors">Seguridad Pública FB</div>
                    <div className="text-xs text-white/50 truncate mt-1">Genera una campaña para Facebook...</div>
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-white/40 mt-0.5 group-hover:text-white/70" />
                  <div>
                    <div className="font-semibold text-sm text-white/80 group-hover:text-white transition-colors">Lanzamiento Producto X</div>
                    <div className="text-xs text-white/50 truncate mt-1">Ideas de copy para el nuevo smart...</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 px-2">{t('Yesterday')}</h3>
            <div className="space-y-1">
              <button className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-white/40 mt-0.5 group-hover:text-white/70" />
                  <div>
                    <div className="font-semibold text-sm text-white/80 group-hover:text-white transition-colors">Campaña Primavera</div>
                    <div className="text-xs text-white/50 truncate mt-1">Moodboard para la colección de...</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE PANEL: Chat Interface */}
      <div className="flex-1 flex flex-col bg-[#0A0A0B]">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#0F1014]/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary text-sm font-bold">IA</span>
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">{t('Director Creativo IA')}</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-emerald-500 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* AI Avatar */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-4 shadow-lg shadow-primary/20">
                  <span className="text-white text-xs font-bold">IA</span>
                </div>
              )}

              {/* Message Bubble */}
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-[#1A1B20] text-white border border-white/10' : 'bg-transparent text-white'} rounded-2xl p-4`}>
                
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                    
                    {/* Pipeline Steps Card for AI */}
                    {msg.steps && (
                      <div className="bg-[#121318] border border-white/10 rounded-xl p-4 space-y-3 mt-4 max-w-sm shadow-xl">
                        {msg.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            {step.state === 'done' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            )}
                            <span className={`text-xs font-mono ${step.state === 'done' ? 'text-emerald-500' : 'text-primary'}`}>
                              {step.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/5 bg-[#0F1014]">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative flex items-center">
            <button type="button" className="absolute left-4 text-white/40 hover:text-white transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('Escribe un mensaje...')}
              className="w-full bg-[#1A1B20] border border-white/10 rounded-2xl pl-12 pr-14 py-4 text-sm text-white placeholder-white/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={!inputText.trim()}
              className="absolute right-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white p-2.5 rounded-xl transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT PANEL: Inspector / Preview */}
      <div className="w-96 flex-shrink-0 border-l border-white/10 bg-[#0F1014] flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <h2 className="text-sm font-bold text-white">{t('Inspector / Preview')}</h2>
          <button className="text-white/40 hover:text-white transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Image Preview */}
          <div className="rounded-xl overflow-hidden border border-white/10 relative group">
            <img 
              src="/safe_streets_banner.png" 
              alt="Generated Banner" 
              className="w-full aspect-video object-cover"
              onError={(e) => {
                // Fallback si la imagen no existe
                e.currentTarget.src = "https://images.unsplash.com/photo-1596464716127-f2a82984de30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-md text-sm font-medium transition-all">
                {t('Expandir')}
              </button>
            </div>
          </div>

          {/* Copy Suggestions */}
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4">{t('Copy Suggestions')}</h3>
            
            <div className="space-y-4">
              {/* Option 1 */}
              <div className="bg-[#1A1B20] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-primary">Option 1</span>
                  <button className="text-white/30 hover:text-white transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  "Tu seguridad es nuestra prioridad. Trabajamos juntos por calles más seguras y comunidades conectadas. Únete al cambio."
                </p>
              </div>

              {/* Option 2 */}
              <div className="bg-[#1A1B20] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-emerald-500">Option 2</span>
                  <button className="text-white/30 hover:text-white transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  "Construyendo confianza, paso a paso. Conoce las nuevas iniciativas de seguridad pública en tu zona."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-[#0F1014] flex items-center gap-3">
          <button className="flex-1 bg-transparent hover:bg-white/5 text-white border border-white/10 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            {t('Refine')}
          </button>
          <button className="flex-1 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#8b5cf6]/25">
            <Check className="w-4 h-4" />
            {t('Approve')}
          </button>
          <button className="bg-transparent hover:bg-white/5 text-white border border-white/10 p-2.5 rounded-xl transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      
    </div>
  );
}
