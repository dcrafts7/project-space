import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Sparkles,
  Compass,
  BookOpen,
  ExternalLink,
  Orbit,
  Search,
  Layers,
  FileText,
  ChevronRight,
  LayoutGrid,
  Share2,
  CheckCircle2,
  Atom
} from 'lucide-react';
import { fetchResearchGalaxy, fetchResearchPaper } from '../../services/api';
import { ResearchGalaxyData, GalaxyNode, ResearchPaper } from '../../types';

interface ResearchGalaxyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFlyToTarget?: (targetId: string) => void;
  initialPaperId?: string;
}

export const ResearchGalaxyModal: React.FC<ResearchGalaxyModalProps> = ({
  isOpen,
  onClose,
  onFlyToTarget,
  initialPaperId
}) => {
  const [galaxyData, setGalaxyData] = useState<ResearchGalaxyData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<GalaxyNode | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [paperCache, setPaperCache] = useState<Record<string, ResearchPaper>>({});
  const [paperLoading, setPaperLoading] = useState<boolean>(false);
  const [explanationLevel, setExplanationLevel] = useState<'simple' | 'student' | 'enthusiast' | 'technical'>('enthusiast');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'catalog'>('graph');

  // Load galaxy data on modal open
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);

    fetchResearchGalaxy()
      .then(async (data) => {
        setGalaxyData(data);

        // Preload initial paper or first paper
        const papers = data.nodes.filter((n: GalaxyNode) => n.type === 'paper');
        const targetPaperId = initialPaperId || (papers.length > 0 ? papers[0].id : null);

        if (targetPaperId) {
          const matched = data.nodes.find((n: GalaxyNode) => n.id === targetPaperId) || papers[0];
          setSelectedNode(matched || null);
          if (matched && matched.type === 'paper') {
            try {
              const details = await fetchResearchPaper(matched.id);
              setPaperCache((prev) => ({ ...prev, [matched.id]: details }));
            } catch (err) {
              console.warn('Initial paper fetch error', err);
            }
          }
        }
      })
      .catch((err) => console.error('Galaxy fetch failed', err))
      .finally(() => setLoading(false));
  }, [isOpen, initialPaperId]);

  // Deterministic, non-jittering node layout calculated synchronously
  const nodePositions = useMemo(() => {
    if (!galaxyData) return {};
    const pos: Record<string, { x: number; y: number }> = {};
    const cx = 375;
    const cy = 275;

    // 1. Celestial Targets (inner orbit, r = 135)
    const targets = galaxyData.nodes.filter((n: GalaxyNode) => n.type === 'target');
    targets.forEach((t: GalaxyNode, i: number) => {
      const angle = (i / Math.max(targets.length, 1)) * Math.PI * 2 - Math.PI / 2;
      pos[t.id] = {
        x: cx + Math.cos(angle) * 135,
        y: cy + Math.sin(angle) * 135
      };
    });

    // 2. Topics (middle orbit, r = 205)
    const topics = galaxyData.nodes.filter((n: GalaxyNode) => n.type === 'topic');
    topics.forEach((top: GalaxyNode, i: number) => {
      const angle = (i / Math.max(topics.length, 1)) * Math.PI * 2 - Math.PI / 4;
      pos[top.id] = {
        x: cx + Math.cos(angle) * 205,
        y: cy + Math.sin(angle) * 205
      };
    });

    // 3. Papers (outer orbital band, r = 265 - 285)
    const papers = galaxyData.nodes.filter((n: GalaxyNode) => n.type === 'paper');
    papers.forEach((p: GalaxyNode, i: number) => {
      const angle = (i / Math.max(papers.length, 1)) * Math.PI * 2 + 0.15;
      const r = i % 2 === 0 ? 275 : 295;
      pos[p.id] = {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r
      };
    });

    // 4. Datasets (corner satellites)
    const datasets = galaxyData.nodes.filter((n: GalaxyNode) => n.type === 'dataset');
    const datasetCoords = [
      { x: 75, y: 75 },
      { x: 675, y: 75 },
      { x: 75, y: 475 },
      { x: 675, y: 475 }
    ];
    datasets.forEach((d: GalaxyNode, i: number) => {
      pos[d.id] = datasetCoords[i % datasetCoords.length];
    });

    return pos;
  }, [galaxyData]);

  const handleSelectNode = async (node: GalaxyNode) => {
    setSelectedNode(node);
    if (node.type === 'paper') {
      if (paperCache[node.id]) {
        // Cached instantly, zero loading flicker!
        return;
      }
      setPaperLoading(true);
      try {
        const details = await fetchResearchPaper(node.id);
        setPaperCache((prev) => ({ ...prev, [node.id]: details }));
      } catch (err) {
        console.error('Failed to fetch paper details', err);
      } finally {
        setPaperLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  const currentPaperDetails: ResearchPaper | null =
    selectedNode && selectedNode.type === 'paper' ? paperCache[selectedNode.id] || null : null;

  const filteredNodes = (galaxyData?.nodes || []).filter((n: GalaxyNode) => {
    if (activeFilter !== 'all' && n.type !== activeFilter) return false;
    if (!searchFilter.trim()) return true;
    return (
      n.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (n.target && n.target.toLowerCase().includes(searchFilter.toLowerCase()))
    );
  });

  const allPapers = (galaxyData?.nodes || []).filter((n: GalaxyNode) => n.type === 'paper');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 md:p-6 pointer-events-auto select-none">
      <div className="w-full max-w-6xl h-[88vh] glass-panel rounded-2xl border border-white/15 shadow-2xl flex flex-col overflow-hidden bg-slate-950/90">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10">
              <Compass size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm md:text-base font-bold text-white tracking-wide">
                  RESEARCH GALAXY & CITATION GRAPH
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  NASA ADS • arXiv • OpenAlex
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Peer-reviewed astronomical literature, 8-point breakdowns, and scientific datasets
              </p>
            </div>
          </div>

          {/* Controls: View Switcher, Filter Pills, and Close */}
          <div className="flex items-center gap-2.5">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('graph')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'graph'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Share2 size={13} />
                <span>Galaxy Graph</span>
              </button>
              <button
                onClick={() => setViewMode('catalog')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'catalog'
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Paper Catalog</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* Sub-bar: Search & Filter Tabs */}
        <div className="px-5 py-2 border-b border-white/10 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10 flex-1 max-w-md">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search papers, celestial objects (Mars, Europa, Sun), topics..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
            {searchFilter && (
              <button onClick={() => setSearchFilter('')} className="text-slate-500 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Node Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {(['all', 'paper', 'target', 'topic', 'dataset'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-amber-500 text-black font-bold shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'all' ? 'All Nodes' : `${cat}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* VIEW MODE 1: INTERACTIVE GALAXY GRAPH */}
          {viewMode === 'graph' ? (
            <div className="flex-1 flex flex-col relative border-r border-white/10 bg-slate-950/50 overflow-hidden">
              {loading ? (
                <div className="flex-1 flex items-center justify-center text-amber-400 gap-2 font-mono text-xs">
                  <Sparkles size={16} className="animate-spin" />
                  <span>Synthesizing Astronomical Research Galaxy...</span>
                </div>
              ) : (
                <div className="flex-1 relative flex items-center justify-center p-2 overflow-hidden">
                  <svg
                    viewBox="0 0 750 550"
                    className="w-full h-full max-h-[550px] select-none"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Background Galaxy Guides */}
                    <circle cx="375" cy="275" r="135" fill="none" stroke="rgba(56, 189, 248, 0.12)" strokeDasharray="3 3" />
                    <circle cx="375" cy="275" r="205" fill="none" stroke="rgba(168, 85, 247, 0.1)" strokeDasharray="4 4" />
                    <circle cx="375" cy="275" r="285" fill="none" stroke="rgba(245, 158, 11, 0.08)" strokeDasharray="5 5" />

                    {/* Central Galaxy Core Marker */}
                    <circle cx="375" cy="275" r="8" fill="#38bdf8" fillOpacity="0.15" />
                    <circle cx="375" cy="275" r="3" fill="#38bdf8" />
                    <text x="375" y="293" textAnchor="middle" fill="#64748b" fontSize="8px" fontFamily="monospace">
                      SOLAR SYSTEM CORE
                    </text>

                    {/* Graph Connection Lines */}
                    {(galaxyData?.links || []).map((link, idx) => {
                      const src = nodePositions[link.source];
                      const tgt = nodePositions[link.target];
                      if (!src || !tgt) return null;
                      const isLinkedToSelected =
                        selectedNode && (selectedNode.id === link.source || selectedNode.id === link.target);
                      return (
                        <line
                          key={idx}
                          x1={src.x}
                          y1={src.y}
                          x2={tgt.x}
                          y2={tgt.y}
                          stroke={isLinkedToSelected ? '#f59e0b' : 'rgba(255, 255, 255, 0.12)'}
                          strokeWidth={isLinkedToSelected ? 2 : 0.8}
                          strokeDasharray={link.relation === 'analyzes_dataset' ? '3 3' : undefined}
                          opacity={isLinkedToSelected ? 0.9 : 0.4}
                        />
                      );
                    })}

                    {/* Graph Nodes */}
                    {filteredNodes.map((node: GalaxyNode) => {
                      const pos = nodePositions[node.id];
                      if (!pos) return null;
                      const isSelected = selectedNode?.id === node.id;
                      const isHovered = hoveredNodeId === node.id;
                      const radius = node.type === 'target' ? 14 : node.type === 'paper' ? 9 : 8;

                      return (
                        <g
                          key={node.id}
                          transform={`translate(${pos.x}, ${pos.y})`}
                          onClick={() => handleSelectNode(node)}
                          onMouseEnter={() => setHoveredNodeId(node.id)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className="cursor-pointer"
                        >
                          {/* Generous invisible hit-area so mouse never falls off and jitters */}
                          <circle r={radius + 12} fill="transparent" />

                          {/* Static/Glow halo */}
                          {isSelected && (
                            <circle r={radius + 8} fill={node.color} fillOpacity="0.25" stroke={node.color} strokeWidth="1" strokeOpacity="0.5" />
                          )}

                          {/* Node circle */}
                          <circle
                            r={radius + (isHovered ? 2.5 : 0)}
                            fill={node.color}
                            stroke={isSelected ? '#ffffff' : isHovered ? '#fde68a' : 'rgba(0,0,0,0.6)'}
                            strokeWidth={isSelected ? 2.2 : isHovered ? 1.8 : 1}
                          />

                          {/* Clean Label */}
                          <text
                            y={radius + 12}
                            textAnchor="middle"
                            fill={isSelected ? '#ffffff' : isHovered ? '#fbbf24' : '#94a3b8'}
                            fontSize={node.type === 'target' ? '10px' : '8.5px'}
                            fontWeight={isSelected ? 'bold' : 'normal'}
                            className="pointer-events-none select-none"
                          >
                            {node.label.length > 20 ? `${node.label.substring(0, 18)}...` : node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Bottom Legend */}
              <div className="px-4 py-2 border-t border-white/5 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Papers</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block" /> Celestial Targets</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" /> Scientific Topics</span>
                  <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> Datasets</span>
                </div>
                <span className="text-[10px] text-slate-500">Click any paper to inspect its 8-point breakdown</span>
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: LITERATURE CATALOG VIEW */
            <div className="flex-1 flex flex-col border-r border-white/10 bg-slate-950/40 overflow-y-auto p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300 pb-1 flex items-center justify-between border-b border-white/10">
                <span>PEER-REVIEWED PAPERS ({allPapers.length})</span>
                <span className="text-amber-400 text-[11px] font-mono">NASA ADS & arXiv Grounded</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allPapers.map((paperNode: GalaxyNode) => {
                  const isSelected = selectedNode?.id === paperNode.id;
                  return (
                    <div
                      key={paperNode.id}
                      onClick={() => handleSelectNode(paperNode)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-400/50 shadow-lg'
                          : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                          {paperNode.target}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {paperNode.year}
                        </span>
                      </div>

                      <h4 className="font-bold text-white leading-snug line-clamp-2">
                        {paperNode.label}
                      </h4>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                        {paperNode.journal}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-amber-400 flex items-center gap-1 font-medium">
                          <span>Inspect 8-Point Breakdown</span>
                          <ChevronRight size={12} />
                        </span>
                        {paperNode.doi && (
                          <span className="text-slate-500 font-mono text-[10px]">DOI available</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right Panel: Explainer & 8-Point Scientific Breakdown */}
          <div className="w-full md:w-[480px] bg-slate-950/90 flex flex-col overflow-y-auto p-5 border-l border-white/10">
            {selectedNode && selectedNode.type === 'paper' ? (
              paperLoading && !currentPaperDetails ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 gap-2 font-mono text-xs">
                  <Sparkles size={16} className="animate-spin text-amber-400" />
                  <span>Loading paper breakdown telemetry...</span>
                </div>
              ) : currentPaperDetails ? (
                <div className="space-y-5 text-xs">
                  {/* Target Badge & 3D Fly Button */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                      <Orbit size={11} />
                      <span>TARGET: {currentPaperDetails.target.toUpperCase()}</span>
                    </span>

                    {onFlyToTarget && (
                      <button
                        onClick={() => {
                          onFlyToTarget(currentPaperDetails.target.toLowerCase());
                          onClose();
                        }}
                        className="px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                      >
                        <span>Fly to {currentPaperDetails.target} in 3D</span>
                        <ChevronRight size={13} />
                      </button>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white leading-snug">
                      {currentPaperDetails.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {currentPaperDetails.authors} ({currentPaperDetails.year})
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">
                        {currentPaperDetails.journal}
                      </span>
                      {currentPaperDetails.doi && (
                        <a
                          href={`https://doi.org/${currentPaperDetails.doi}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span>DOI: {currentPaperDetails.doi}</span>
                          <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* 4 Explanation Levels Switcher */}
                  <div className="bg-slate-900/90 p-1.5 rounded-xl border border-white/10">
                    <div className="text-[10px] text-slate-400 font-semibold mb-1 px-1 flex items-center justify-between">
                      <span>EXPLANATION DEPTH:</span>
                      <span className="text-amber-400 uppercase font-mono">{explanationLevel}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {(
                        [
                          { id: 'simple', label: '🧑‍🚀 Simple' },
                          { id: 'student', label: '🎓 Student' },
                          { id: 'enthusiast', label: '🔭 Enthusiast' },
                          { id: 'technical', label: '🧪 Technical' },
                        ] as const
                      ).map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => setExplanationLevel(lvl.id)}
                          className={`py-1.5 px-1 rounded-lg text-[10px] font-medium transition cursor-pointer text-center ${
                            explanationLevel === lvl.id
                              ? 'bg-amber-500 text-black font-bold'
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>

                    {/* Active Explanation Content */}
                    <div className="mt-3 p-3 rounded-lg bg-black/40 border border-white/5 text-slate-200 leading-relaxed text-xs">
                      {currentPaperDetails.levels?.[explanationLevel] || currentPaperDetails.abstract}
                    </div>
                  </div>

                  {/* 8-Point Scientific Paper Breakdown */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white border-b border-white/10 pb-1.5">
                      <FileText size={14} className="text-amber-400" />
                      <span>THE 8-POINT SCIENTIFIC BREAKDOWN</span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-amber-400 font-bold tracking-wider block text-[10px]">1. QUESTION</span>
                        <p className="text-slate-300 mt-0.5">{currentPaperDetails.eight_point_breakdown.question}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-sky-400 font-bold tracking-wider block text-[10px]">2. DATASET / TELESCOPE</span>
                        <p className="text-slate-300 mt-0.5">{currentPaperDetails.eight_point_breakdown.data}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-purple-400 font-bold tracking-wider block text-[10px]">3. METHOD</span>
                        <p className="text-slate-300 mt-0.5">{currentPaperDetails.eight_point_breakdown.method}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-emerald-400 font-bold tracking-wider block text-[10px]">4. RESULT</span>
                        <p className="text-slate-300 mt-0.5">{currentPaperDetails.eight_point_breakdown.result}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-indigo-400 font-bold tracking-wider block text-[10px]">5. SIGNIFICANCE</span>
                        <p className="text-slate-300 mt-0.5">{currentPaperDetails.eight_point_breakdown.significance}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-rose-400 font-bold tracking-wider block text-[10px]">6. LIMITATIONS</span>
                        <p className="text-slate-300 mt-0.5">{currentPaperDetails.eight_point_breakdown.limitations}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-amber-300 font-bold tracking-wider block text-[10px]">7. OPEN QUESTIONS</span>
                        <p className="text-slate-300 mt-0.5">{currentPaperDetails.eight_point_breakdown.open_questions}</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
                        <span className="text-slate-400 font-bold tracking-wider block text-[10px]">8. VERIFIED SOURCE</span>
                        <p className="text-slate-400 mt-0.5 font-mono text-[10px]">{currentPaperDetails.eight_point_breakdown.source}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null
            ) : selectedNode ? (
              <div className="p-6 text-center space-y-4 my-auto">
                <div
                  className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center border"
                  style={{
                    backgroundColor: `${selectedNode.color}20`,
                    borderColor: `${selectedNode.color}40`,
                    color: selectedNode.color
                  }}
                >
                  <Layers size={26} />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    GALAXY NODE: {selectedNode.type}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedNode.label}</h3>
                  {selectedNode.records && (
                    <p className="text-xs text-emerald-400 mt-1 font-mono">{selectedNode.records}</p>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Click connected paper nodes in the galaxy to view their detailed 8-point research breakdowns.
                </p>
                {selectedNode.type === 'target' && onFlyToTarget && (
                  <button
                    onClick={() => {
                      onFlyToTarget(selectedNode.label.toLowerCase());
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition cursor-pointer"
                  >
                    Fly to {selectedNode.label} in 3D
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500 my-auto text-xs">
                Select any node in the Research Galaxy to view astronomical publications and datasets.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
