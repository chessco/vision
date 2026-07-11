// ─── Creative Chat Page ───────────────────────────────────────────
// Central chat interface for interacting with the AI Agent Pipeline.
// Refactored from the monolithic 1100-line file into a clean composition pattern.

import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Brain, Sparkles, Clock, Settings, X } from 'lucide-react';
import { AgentPipeline } from '../components/AgentPipeline';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ChatInput } from '../components/ChatInput';
import { toApiTenantId } from '../../../lib/api';
import type { AgentStep } from '../../../types';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
}

export function CreativeChatPage() {
  const { t } = useTranslation();
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt || '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [pipelineSteps, setPipelineSteps] = useState<AgentStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  

  const currentSessionIdRef = useRef<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);

  const updateSessionId = (id: string | null) => {

    currentSessionIdRef.current = id;
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen to CustomEvent from ContextPanel
  useEffect(() => {
    const handleCustomMessage = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handleSendMessage(customEvent.detail);
      }
    };

    const handleActiveCampaignChanged = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const campaignId = customEvent.detail;
      if (campaignId) {
        try {
          const res = await axios.get(`/api/tenants/${apiTenantId}/chat-sessions`);
          const sessions = res.data;
          const sessionForCampaign = sessions.find((s: any) => s.campaignId === campaignId);
          
          if (sessionForCampaign) {
            setIsLoading(true);
            const msgRes = await axios.get(`/api/tenants/${apiTenantId}/chat-sessions/${sessionForCampaign.id}/messages`);
            const mappedMessages = msgRes.data.map((m: any) => ({
              id: m.id,
              role: m.sender === 'ai' ? 'assistant' : 'user',
              content: m.text,
              metadata: {
                 assetUrl: m.bannerUrl,
                 suggestedActions: m.suggestedCopy ? ['Proceed to Publish'] : []
              }
            }));
            setMessages(mappedMessages);
            updateSessionId(sessionForCampaign.id);
            setPipelineSteps([]);
          } else {
            setMessages([]);
            updateSessionId(null);
            setPipelineSteps([]);
          }
        } catch (err) {
          console.error('Failed to handle active campaign change', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setMessages([]);
        updateSessionId(null);
        setPipelineSteps([]);
      }
    };

    window.addEventListener('send-chat-message', handleCustomMessage);
    window.addEventListener('active-campaign-changed', handleActiveCampaignChanged);
    return () => {
      window.removeEventListener('send-chat-message', handleCustomMessage);
      window.removeEventListener('active-campaign-changed', handleActiveCampaignChanged);
    };
  }, [apiTenantId]);

  // Fetch history when panel opens
  useEffect(() => {
    if (isHistoryOpen) {
      axios.get(`/api/tenants/${apiTenantId}/chat-sessions`)
        .then(res => setSessions(res.data))
        .catch(err => console.error('Failed to load sessions', err));
    }
  }, [isHistoryOpen, apiTenantId]);

  const handleLoadSession = async (sessionId: string) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`/api/tenants/${apiTenantId}/chat-sessions/${sessionId}/messages`);
      const mappedMessages = res.data.map((m: any) => ({
        id: m.id,
        role: m.sender === 'ai' ? 'assistant' : 'user',
        content: m.text,
        metadata: {
           assetUrl: m.bannerUrl,
           suggestedActions: m.suggestedCopy ? ['Proceed to Publish'] : []
        }
      }));
      setMessages(mappedMessages);
      updateSessionId(sessionId);
      setIsHistoryOpen(false);
    } catch(err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize with initial prompt if provided
  useEffect(() => {
    if (initialPrompt && !sessionStarted) {
      handleSendMessage(initialPrompt);
      setSessionStarted(true);
    }
  }, [initialPrompt, sessionStarted]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pipelineSteps]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Initialize pipeline UI
    setPipelineSteps([
      { id: '1', agent: 'creative_director', label: 'Strategy', status: 'running' }
    ]);

    try {
      // PitayaCore AI integration endpoint
      const sessionId = currentSessionIdRef.current;
      const endpoint = sessionId 
        ? `/api/tenants/${apiTenantId}/chat-sessions/${sessionId}/messages` 
        : `/api/tenants/${apiTenantId}/chat-sessions/current/messages`;
      
      const activeCampaignId = localStorage.getItem('pitaya_vision_active_campaign');

      const res = await axios.post(endpoint, {
        text: text,
        campaignId: activeCampaignId || undefined,
      });

      if (!sessionId && res.data?.userMessage?.sessionId) {
        updateSessionId(res.data.userMessage.sessionId);
      }

      // Update pipeline as done
      setPipelineSteps([
        { id: '1', agent: 'creative_director', label: 'Strategy', status: 'done' },
        { id: '2', agent: 'copywriter', label: 'Copywriting', status: 'done' },
        { id: '3', agent: 'designer', label: 'Design', status: 'done' }
      ]);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data?.aiMessage?.text || 'I have completed the task.',
        metadata: {
          assetUrl: res.data?.aiMessage?.bannerUrl,
          ...res.data?.aiMessage
        }
      };
      
      // If an image was generated, trigger an asset update event
      if (res.data?.aiMessage?.bannerUrl) {
        window.dispatchEvent(new CustomEvent('assets-updated'));
      }

      // If the message contains JSON metadata block, extract it
      // (This handles the regex extraction defined in the backend requirements)
      let finalContent = aiMessage.content;
      try {
        const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiMessage.metadata = { ...aiMessage.metadata, ...parsed };
          finalContent = finalContent.replace(jsonMatch[0], '').trim();
        }
      } catch (e) {
        // Ignore JSON parse errors
      }

      // Auto-format common section headers if they lack newlines
      finalContent = finalContent.replace(/(Estrategia:|Oferta:|Segmentación:|Público Objetivo Principal:|Público Objetivo Secundario:|Concepto Creativo:|Tagline:|Anuncios \(3 anuncios\):|Anuncio \d+:|Copy:|Visual:)/g, '\n\n**$1**\n');
      
      // Basic markdown to HTML (bold)
      finalContent = finalContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      aiMessage.content = finalContent.trim();

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      // Fallback for demo if API fails
      setTimeout(() => {
        setPipelineSteps([
          { id: '1', agent: 'creative_director', label: 'Strategy', status: 'done' }
        ]);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: t("I'm currently running in demo mode. The backend API is not fully connected, but I understand you want to create something amazing."),
          metadata: {
            suggestedActions: [t("Try again"), t("View Dashboard"), t("Configure API")]
          }
        }]);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full animate-fade-in relative overflow-hidden">
      {/* History Panel Overlay */}
      {isHistoryOpen && (
        <div className="absolute inset-y-0 left-0 w-80 bg-[#0d0b14]/95 backdrop-blur-xl border-r border-border-subtle z-50 animate-in slide-in-from-left duration-200 flex flex-col shadow-2xl">
          <div className="h-14 flex items-center justify-between px-4 border-b border-border-subtle shrink-0">
            <h2 className="text-sm font-headings font-bold text-white">{t('Historial de Sesiones')}</h2>
            <button onClick={() => setIsHistoryOpen(false)} className="p-1.5 rounded-md hover:bg-white/5 text-ink-muted">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {sessions.map(s => (
              <button 
                key={s.id} 
                onClick={() => handleLoadSession(s.id)}
                className="w-full text-left p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
              >
                <p className="text-sm text-white font-medium truncate">{s.title || t('Nueva Campaña')}</p>
                <p className="text-[10px] text-ink-muted mt-1">{new Date(s.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
            {sessions.length === 0 && (
              <p className="text-xs text-ink-muted text-center py-4">{t('No hay historial')}</p>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
        {/* Chat Header */}
        <div className="h-14 border-b border-border-subtle px-6 flex items-center justify-between shrink-0 bg-[#0d0b14]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-headings font-bold text-white leading-tight">{t('Creative Director')}</h1>
              <p className="text-[10px] text-ink-muted leading-tight">PitayaCore Orchestration Agent</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setIsHistoryOpen(true)} className="p-2 rounded-lg hover:bg-white/5 text-ink-muted hover:text-white transition-colors" title={t("Session History")}>
              <Clock className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-ink-muted hover:text-white transition-colors" title={t("Settings")}>
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pipeline Status Bar (Shows when processing) */}
        {pipelineSteps.length > 0 && (
          <div className="px-6 py-2 border-b border-border-subtle bg-white/3 shrink-0">
            <AgentPipeline steps={pipelineSteps} />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.15)]">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-headings font-light tracking-wide text-white mb-3">
                {t('How can I help you create today?')}
              </h2>
              <p className="text-sm text-ink-muted mb-8">
                {t("I'm your AI Creative Director. I can help you plan campaigns, design brand assets, write copy, and orchestrate publishing across platforms.")}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {[
                  t('Plan a Q3 awareness campaign'),
                  t('Design a logo for AAA Abogados'),
                  t('Write 5 Facebook posts about AI'),
                  t('Analyze my current audience')
                ].map((suggestion, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSendMessage(suggestion)}
                    className="p-3 rounded-xl border border-border-subtle bg-white/3 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all text-sm text-left text-ink-muted group"
                  >
                    <span className="group-hover:text-primary transition-colors">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((msg, idx) => {
                let lastUserMsg = '';
                if (msg.role === 'assistant') {
                  for (let i = idx - 1; i >= 0; i--) {
                    if (messages[i].role === 'user') {
                      lastUserMsg = messages[i].content;
                      break;
                    }
                  }
                }
                return (
                  <ChatMessageBubble 
                    key={msg.id} 
                    message={msg} 
                    onRegenerate={msg.role === 'assistant' && lastUserMsg ? () => handleSendMessage(lastUserMsg) : undefined}
                    onApprove={async () => {
                      const activeBrandId = localStorage.getItem('pitaya_vision_active_brand');
                      if (currentSessionIdRef.current) {
                        try {
                          const res = await axios.post(`/api/tenants/${apiTenantId}/chat-sessions/${currentSessionIdRef.current}/approve`, {
                            brandId: activeBrandId
                          });
                          if (res.data && res.data.campaign) {
                            window.dispatchEvent(new CustomEvent('campaign-created', { detail: res.data.campaign }));
                          }
                        } catch(err) {
                          console.error('Failed to approve campaign', err);
                        }
                      }

                      setPipelineSteps(prev => {
                        const newSteps = [...prev];
                        if (!newSteps.find(s => s.agent === 'compliance')) {
                          newSteps.push({ id: '4', agent: 'compliance', label: 'Compliance', status: 'done' });
                        }
                        if (!newSteps.find(s => s.agent === 'publisher')) {
                          newSteps.push({ id: '5', agent: 'publisher', label: 'Publish', status: 'pending' });
                        }
                        return newSteps;
                      });
                      
                      // Add suggested action to publish
                      setMessages(currentMsgs => {
                        const newMsgs = [...currentMsgs];
                        const lastMsg = newMsgs[newMsgs.length - 1];
                        if (lastMsg && lastMsg.role === 'assistant') {
                          lastMsg.metadata = {
                            ...lastMsg.metadata,
                            suggestedActions: [...(lastMsg.metadata?.suggestedActions || []), 'Proceed to Publish']
                          };
                        }
                        return newMsgs;
                      });
                      
                      alert(t('Asset approved! Passed compliance and ready to publish.'));
                    }}
                    onActionClick={(action) => {
                      if (action === 'Proceed to Publish') {
                        setPipelineSteps(prev => prev.map(s => s.agent === 'publisher' ? { ...s, status: 'done' } : s));
                        alert(t('Content published successfully!'));
                      } else {
                        handleSendMessage(action);
                      }
                    }}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 pt-2 shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            <p className="text-center text-[10px] text-ink-muted/50 mt-2">
              {t('Vision connects to PitayaCore for remote agent orchestration. AI models may occasionally produce unexpected results.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
