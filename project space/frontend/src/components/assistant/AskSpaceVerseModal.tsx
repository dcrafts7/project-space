import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  ArrowRight,
  Compass,
  Eye,
  Shuffle,
  Scale,
  FlaskConical,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import { askSpaceVerse, explainCurrentView, fetchSurpriseMe } from '../../services/api';
import { AIAssistantResponse, AIAction } from '../../types';

interface AskSpaceVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteAction?: (action: AIAction) => void;
  onOpenResearchGalaxy?: (paperId?: string) => void;
  currentContext?: Record<string, any>;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  responseObj?: AIAssistantResponse;
}

const QUICK_PROMPTS = [
  { label: "🔭 Explain What I'm Seeing", type: 'explain_view' },
  { label: '✨ Surprise Me!', type: 'surprise' },
  { label: 'How far is Mars right now?', type: 'query', text: 'How far is Mars right now?' },
  { label: 'Why is the Moon red in an eclipse?', type: 'query', text: 'Why is the Moon red during a lunar eclipse?' },
  { label: '⚖️ Compare Earth vs Mars', type: 'compare', text: 'Compare Earth vs Mars' },
  { label: '🧪 What if Moon was half as far?', type: 'hypothetical', text: 'What if the Moon was twice as close to Earth?' },
  { label: 'What is ISRO Gaganyaan mission?', type: 'query', text: 'What is ISRO Gaganyaan mission?' },
  { label: "What's happening with the Sun today?", type: 'query', text: "What's happening with the Sun today?" },
];

export const AskSpaceVerseModal: React.FC<AskSpaceVerseModalProps> = ({
  isOpen,
  onClose,
  onExecuteAction,
  onOpenResearchGalaxy,
  currentContext,
}) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [explanationLevel, setExplanationLevel] = useState<'simple' | 'student' | 'enthusiast' | 'technical'>('enthusiast');
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);

  const [conversation, setConversation] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Welcome to ✨ SPACEVERSE AI — your intelligent guide to the universe. I am synchronized with live celestial ephemeris, real-time space weather, active space missions, and peer-reviewed astrophysical research.",
    },
  ]);

  if (!isOpen) return null;

  const handleSend = async (customQuery?: string, mode: string = 'ask') => {
    const textToSend = customQuery !== undefined ? customQuery : query;
    if (!textToSend.trim() && mode === 'ask') return;
    if (loading) return;

    const userMsgId = `user-${Date.now()}`;
    if (textToSend) {
      setConversation((prev) => [
        ...prev,
        { id: userMsgId, sender: 'user', text: textToSend }
      ]);
    }
    setQuery('');
    setLoading(true);

    try {
      let res: AIAssistantResponse;
      if (mode === 'explain_view') {
        res = await explainCurrentView(currentContext, explanationLevel);
      } else if (mode === 'surprise') {
        res = await fetchSurpriseMe(explanationLevel);
      } else {
        res = await askSpaceVerse(textToSend, currentContext, explanationLevel, mode);
      }

      setConversation((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          sender: 'assistant',
          text: res.answer,
          responseObj: res
        }
      ]);
    } catch (e) {
      setConversation((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to reach the astronomical intelligence engine. Please check backend connection.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getEvidenceBadge = (level?: string) => {
    switch (level) {
      case 'OBSERVED':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">● OBSERVED DATA</span>;
      case 'CALCULATED':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">● CALCULATED EPHEMERIS</span>;
      case 'REPORTED':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">● REPORTED MISSION</span>;
      case 'RESEARCHED':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">● PEER-REVIEWED RESEARCH</span>;
      case 'PREDICTED':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">● CELESTIAL FORECAST</span>;
      case 'HYPOTHETICAL':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">● HYPOTHETICAL PHYSICS</span>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 md:p-6 pointer-events-auto">
      <div className="w-full max-w-3xl h-[86vh] glass-panel rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500/30 to-purple-500/30 text-sky-300 border border-sky-500/40 shadow-lg shadow-sky-500/10">
              <Sparkles size={19} className="text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold text-white tracking-wide">
                  ASK THE UNIVERSE
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-sky-300 border border-sky-400/20 font-mono">
                  ✨ SPACEVERSE AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Curious about something? Let's explore it.
              </p>
            </div>
          </div>

          {/* Explanation Level Selector & Close Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 text-[11px]">
              {(
                [
                  { id: 'simple', label: '🧑‍🚀 Simple' },
                  { id: 'student', label: '🎓 Student' },
                  { id: 'enthusiast', label: '🔭 Enthusiast' },
                  { id: 'technical', label: '🧪 Deep' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  onClick={() => setExplanationLevel(lvl.id)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                    explanationLevel === lvl.id
                      ? 'bg-sky-500 text-black font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 space-y-4 text-xs">
          {conversation.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[92%] p-4 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-tr-none shadow-lg'
                    : 'glass-panel text-slate-200 border border-white/15 rounded-tl-none shadow-xl bg-slate-950/70'
                }`}
              >
                {/* Evidence Badge if Assistant */}
                {msg.responseObj && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                    {getEvidenceBadge(msg.responseObj.evidence_level)}
                    {msg.responseObj.context_summary?.resolved_target && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        Target: {msg.responseObj.context_summary.resolved_target}
                      </span>
                    )}
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-line text-xs md:text-sm">
                  {msg.text}
                </div>

                {/* What We Know / Scientific Pillars */}
                {msg.responseObj?.what_we_know && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                    {msg.responseObj.what_we_know.map((item, wIdx) => (
                      <div key={wIdx} className="text-[11px] flex items-start gap-1.5">
                        <span className="font-semibold text-sky-400 shrink-0">
                          {item.category}:
                        </span>
                        <span className="text-slate-300">{item.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3D Action Execution Card */}
                {msg.responseObj?.action && (
                  <div className="mt-3 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Compass size={16} className="text-sky-400 shrink-0" />
                      <span className="text-xs font-semibold text-sky-200">
                        {msg.responseObj.action.label}
                      </span>
                    </div>
                    {onExecuteAction && (
                      <button
                        onClick={() => {
                          onExecuteAction(msg.responseObj!.action!);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-md"
                      >
                        <span>Execute in 3D</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                )}

                {/* Collapsible 8-Point Scientific Breakdown */}
                {msg.responseObj?.eight_point_paper && (
                  <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedPaperId(
                          expandedPaperId === msg.id ? null : msg.id
                        )
                      }
                      className="w-full px-3 py-2 flex items-center justify-between text-[11px] font-bold text-amber-300 hover:bg-amber-500/10 transition cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen size={13} />
                        <span>8-POINT SCIENTIFIC RESEARCH BREAKDOWN</span>
                      </span>
                      {expandedPaperId === msg.id ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>

                    {expandedPaperId === msg.id && (
                      <div className="p-3 border-t border-amber-500/20 space-y-2 text-[11px] text-slate-300 bg-slate-950/60">
                        <div>
                          <strong className="text-amber-400">1. QUESTION:</strong>{' '}
                          {msg.responseObj.eight_point_paper.question}
                        </div>
                        <div>
                          <strong className="text-sky-400">2. DATA:</strong>{' '}
                          {msg.responseObj.eight_point_paper.data}
                        </div>
                        <div>
                          <strong className="text-purple-400">3. METHOD:</strong>{' '}
                          {msg.responseObj.eight_point_paper.method}
                        </div>
                        <div>
                          <strong className="text-emerald-400">4. RESULT:</strong>{' '}
                          {msg.responseObj.eight_point_paper.result}
                        </div>
                        <div>
                          <strong className="text-indigo-400">5. SIGNIFICANCE:</strong>{' '}
                          {msg.responseObj.eight_point_paper.significance}
                        </div>
                        <div>
                          <strong className="text-rose-400">6. LIMITATIONS:</strong>{' '}
                          {msg.responseObj.eight_point_paper.limitations}
                        </div>
                        <div>
                          <strong className="text-amber-300">7. OPEN QUESTIONS:</strong>{' '}
                          {msg.responseObj.eight_point_paper.open_questions}
                        </div>
                        <div>
                          <strong className="text-slate-400">8. SOURCE:</strong>{' '}
                          <span className="font-mono text-[10px]">
                            {msg.responseObj.eight_point_paper.source}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sources & Citations */}
                {msg.responseObj?.sources && msg.responseObj.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-500">Citations:</span>
                    {msg.responseObj.sources.map((s, sIdx) => (
                      <a
                        key={sIdx}
                        href={s.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-sky-400 hover:underline flex items-center gap-1 transition"
                      >
                        <span>{s.title.substring(0, 36)}...</span>
                        <ExternalLink size={9} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Follow-up Prompts */}
              {msg.responseObj?.suggested_followups && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-2">
                  {msg.responseObj.suggested_followups.map((f, fIdx) => (
                    <button
                      key={fIdx}
                      onClick={() => handleSend(f)}
                      className="px-2.5 py-1 rounded-full text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition cursor-pointer"
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sky-400 text-xs font-mono p-3 glass-panel rounded-xl w-fit">
              <Sparkles size={15} className="animate-spin" />
              <span>Querying live ephemeris & astrophysical research...</span>
            </div>
          )}
        </div>

        {/* Quick Actions Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-t border-white/5 flex overflow-x-auto gap-2 scrollbar-none text-[11px]">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (qp.type === 'explain_view') {
                  handleSend(undefined, 'explain_view');
                } else if (qp.type === 'surprise') {
                  handleSend(undefined, 'surprise');
                } else {
                  handleSend(qp.text);
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{qp.label}</span>
            </button>
          ))}
          {onOpenResearchGalaxy && (
            <button
              onClick={() => {
                onOpenResearchGalaxy();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap transition cursor-pointer flex items-center gap-1.5"
            >
              <Compass size={12} />
              <span>🌌 Research Galaxy</span>
            </button>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-white/10 bg-slate-950/90 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about planets, upcoming eclipses, space weather, research papers..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={!query.trim() || loading}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-black transition cursor-pointer shadow-md"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};
