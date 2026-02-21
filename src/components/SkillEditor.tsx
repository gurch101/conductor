import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, FileCode, MessageSquare, Save } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SkillEditorProps {
  onBack: () => void;
}

const MOCK_GENERATED_SKILL = `# Researcher Skill
**name:** Researcher
**description:** Expert at gathering and synthesizing information.

## 🚀 Capabilities
- **Web Searching:** Deep crawling of technical documentation and news.
- **Data Extraction:** Converting messy HTML into structured JSON.
- **Executive Summaries:** Boiling down 50+ pages into 5 bullet points.

## 🧠 System Prompt
> "You are a meticulous researcher. Your goal is to find accurate, high-quality information. Always cross-reference multiple sources and prioritize peer-reviewed data over blog posts."

---
### Configuration
\`\`\`yaml
version: 1.0
model: gpt-4-turbo
temperature: 0.2
\`\`\`
`;

export const SkillEditor: React.FC<SkillEditorProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedSkill, setGeneratedSkill] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage: Message = { role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);

    // Mock AI response
    setTimeout(() => {
      setGeneratedSkill(MOCK_GENERATED_SKILL);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I've generated an initial skill file for you. You can see it on the right. What would you like to adjust?",
        },
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <div className="h-14 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-500" />
            <h2 className="font-bold text-sm uppercase tracking-widest">Skill Forge</h2>
          </div>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all">
          <Save size={14} /> Save to Library
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Interface */}
        <div className="w-[400px] border-r border-slate-800 flex flex-col bg-slate-900/20 shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-500 mb-4">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-white font-bold mb-2">Generate a New Skill</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Describe what you want your agent to be an expert in. I'll draft the system
                  prompts and capabilities.
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-xl border border-slate-800">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                    <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleGenerate} className="p-4 border-t border-slate-800 bg-slate-950">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Modify skill or generate new..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-blue-500 min-h-[80px] resize-none pr-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate(e);
                  }
                }}
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isGenerating}
                className="absolute bottom-3 right-3 p-1.5 text-blue-500 hover:text-white disabled:text-slate-700 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Skill Preview */}
        <div className="flex-1 bg-slate-950 p-6 overflow-y-auto">
          {!generatedSkill ? (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-700">
              <FileCode size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium italic">Generated skill file will appear here...</p>
            </div>
          ) : (
            <div className="w-full h-full">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <FileCode size={16} />
                  <span className="text-xs font-mono uppercase tracking-widest">
                    agent_skill.md
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                </div>
              </div>
              <div className="prose prose-invert prose-slate max-w-none prose-sm sm:prose-base bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-2xl min-h-full">
                <ReactMarkdown>{generatedSkill}</ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
