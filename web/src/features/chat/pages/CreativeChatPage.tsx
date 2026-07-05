// ─── Creative Chat Page ───────────────────────────────────────────
// Central chat interface for interacting with the AI Agent Pipeline.
// Refactored from the monolithic 1100-line file into a clean composition pattern.

import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Brain, Sparkles, Clock, Settings, } from 'lucide-react';
import { AgentPipeline } from '../components/AgentPipeline';
import { ChatMessageBubble } from '../components/ChatMessageBubble';
import { ChatInput } from '../components/ChatInput';
import { toApiTenantId } from '../../../lib/api';
import type { AgentStep } from '../../../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
}

export function CreativeChatPage() {
  const { tenantId } = useParams<{ tenantId: string }>();
  const apiTenantId = toApiTenantId(tenantId!);
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt || '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [pipelineSteps, setPipelineSteps] = useState<AgentStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // PitayaCore AI integration endpoint (proxied to port 3016 -> pitayacore)
      const res = await axios.post(`/api/tenants/${apiTenantId}/chat-sessions/current/messages`, {
        text: text,
      });

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
      
      // If the message contains JSON metadata block, extract it
      // (This handles the regex extraction defined in the backend requirements)
      let finalContent = aiMessage.content;
      try {
        const jsonMatch = finalContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiMessage.metadata = { ...aiMessage.metadata, ...parsed };
          finalContent = finalContent.replace(jsonMatch[0], '').trim();
          aiMessage.content = finalContent;
        }
      } catch (e) {
        // Ignore JSON parse errors
      }

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
          content: "I'm currently running in demo mode. The backend API is not fully connected, but I understand you want to create something amazing.",
          metadata: {
            suggestedActions: ["Try again", "View Dashboard", "Configure API"]
          }
        }]);
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full animate-fade-in">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        {/* Chat Header */}
        <div className="h-14 border-b border-border-subtle px-6 flex items-center justify-between shrink-0 bg-[#0d0b14]/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center border border-primary/20">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-headings font-bold text-white leading-tight">Creative Director</h1>
              <p className="text-[10px] text-ink-muted leading-tight">PitayaCore Orchestration Agent</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-white/5 text-ink-muted hover:text-white transition-colors" title="Session History">
              <Clock className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/5 text-ink-muted hover:text-white transition-colors" title="Settings">
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
                How can I help you create today?
              </h2>
              <p className="text-sm text-ink-muted mb-8">
                I'm your AI Creative Director. I can help you plan campaigns, design brand assets, write copy, and orchestrate publishing across platforms.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                {[
                  'Plan a Q3 awareness campaign',
                  'Design a logo for AAA Abogados',
                  'Write 5 Facebook posts about AI',
                  'Analyze my current audience'
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
              {messages.map(msg => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 pt-2 shrink-0">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
            <p className="text-center text-[10px] text-ink-muted/50 mt-2">
              Vision connects to PitayaCore for remote agent orchestration. AI models may occasionally produce unexpected results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
