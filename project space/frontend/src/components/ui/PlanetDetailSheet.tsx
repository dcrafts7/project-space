import React, { useState, useEffect } from 'react';
import {
  X,
  Globe2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  BookOpen,
  ExternalLink,
  Bot,
  ChevronRight
} from 'lucide-react';
import { Planet, ResearchPaper } from '../../types';
import { fetchResearchPapers } from '../../services/api';

interface PlanetDetailSheetProps {
  planet: Planet | null;
  onClose: () => void;
  onOpenResearch?: (paperId?: string) => void;
  onAskAI?: (query: string) => void;
}

export const PlanetDetailSheet: React.FC<PlanetDetailSheetProps> = ({
  planet,
  onClose,
  onOpenResearch,
  onAskAI
}) => {
  const [showTechnical, setShowTechnical] = useState<boolean>(false);
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [papersLoading, setPapersLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!planet) return;
    setPapersLoading(true);
    fetchResearchPapers(planet.name)
      .then((res) => setPapers(res))
      .catch(() => setPapers([]))
      .finally(() => setPapersLoading(false));
  }, [planet]);

  if (!planet) return null;

  return (
    <div className="fixed top-16 right-4 bottom-20 z-40 w-full max-w-md pointer-events-auto select-none">
      <div className="h-full flex flex-col glass-panel rounded-2xl border border-white/15 overflow-hidden shadow-2xl bg-slate-950/85">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
              <Globe2 size={14} />
              <span>Solar System Planetary Body</span>
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-white">{planet.name}</h2>
            {onAskAI && (
              <button
                onClick={() => onAskAI(`Tell me about ${planet.name}`)}
                className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-medium flex items-center gap-1 transition cursor-pointer"
                title={`Ask SpaceVerse AI about ${planet.name}`}
              >
                <Bot size={13} />
                <span>Ask AI</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{planet.description}</p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Real Distance Metrics */}
          <div className="grid grid-cols-2 gap-2 font-mono">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] font-sans">Distance from Earth</span>
              <span className="text-base font-bold text-white block mt-0.5">
                {planet.distance_from_earth_million_km}M km
              </span>
              <span className="text-[10px] text-sky-300 block">{planet.distance_from_earth_au} AU</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] font-sans">Distance from Sun</span>
              <span className="text-base font-bold text-white block mt-0.5">
                {planet.distance_from_sun_million_km}M km
              </span>
              <span className="text-[10px] text-amber-300 block">{planet.distance_from_sun_au} AU</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] font-sans">Apparent Magnitude</span>
              <span className="text-base font-bold text-white block mt-0.5">
                {planet.apparent_magnitude}
              </span>
              <span className="text-[10px] text-emerald-400 block">Naked Eye Visible</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] font-sans">Light Travel Time</span>
              <span className="text-base font-bold text-white block mt-0.5">
                {planet.light_travel_minutes} min
              </span>
              <span className="text-[10px] text-slate-400 block">One-way radio lag</span>
            </div>
          </div>

          {/* BEGINNER EXPLANATION: "WHY IS THIS PLANET HERE?" */}
          <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
              <Sparkles size={14} className="text-sky-400" />
              <span>WHY IS {planet.name.toUpperCase()} HERE RIGHT NOW?</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-xs">
              Planets travel along elliptical orbits dictated by Johannes Kepler's laws of planetary motion.
              Because {planet.name} orbits the Sun once every {planet.orbit_period_days} Earth days at an average speed of{' '}
              {planet.speed_km_s} km/s, its current position reflects where it has advanced along its orbital path since the J2000 astronomical epoch.
            </p>
          </div>

          {/* 🔬 RECENT SCIENTIFIC RESEARCH SECTION */}
          <div className="space-y-2.5 pt-2 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <BookOpen size={14} />
                <span>SCIENTIFIC RESEARCH & PAPERS</span>
              </div>
              {onOpenResearch && (
                <button
                  onClick={() => onOpenResearch(papers[0]?.id)}
                  className="text-[10px] text-amber-300 hover:text-white flex items-center gap-1 font-mono transition cursor-pointer"
                >
                  <span>Research Galaxy</span>
                  <ExternalLink size={10} />
                </button>
              )}
            </div>

            {papersLoading ? (
              <div className="p-3 rounded-xl bg-white/5 text-slate-400 font-mono text-[11px] flex items-center gap-2">
                <Sparkles size={13} className="animate-spin text-amber-400" />
                <span>Querying NASA ADS & arXiv literature...</span>
              </div>
            ) : papers.length > 0 ? (
              <div className="space-y-2">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-amber-500/20 hover:border-amber-500/40 transition text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-amber-300 font-mono">{paper.topic}</span>
                      <span className="text-slate-400 font-mono">{paper.year}</span>
                    </div>

                    <h4 className="font-bold text-white leading-snug line-clamp-2">
                      {paper.title}
                    </h4>

                    <p className="text-slate-300 text-[11px] line-clamp-2">
                      {paper.abstract}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 font-mono">{paper.journal}</span>
                      {onOpenResearch && (
                        <button
                          onClick={() => onOpenResearch(paper.id)}
                          className="text-amber-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                        >
                          <span>8-Point Breakdown</span>
                          <ChevronRight size={11} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-white/5 text-slate-400 text-[11px] flex items-center justify-between">
                <span>Explore astrophysics literature in the Research Galaxy</span>
                {onOpenResearch && (
                  <button
                    onClick={() => onOpenResearch()}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    Open Galaxy
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Atmosphere & Moons */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="p-3 rounded-lg bg-white/5 border border-white/5">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Atmospheric Composition</span>
              <span className="text-slate-200 mt-1 block">{planet.atmosphere}</span>
            </div>

            <div className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Natural Moons</span>
              <span className="font-mono text-white font-bold">{planet.moons_count} known moons</span>
            </div>
          </div>

          {/* Special Moons for Jupiter */}
          {planet.id === 'jupiter' && planet.major_moons && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                Galilean Moons (Discovered by Galileo in 1610)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {planet.major_moons.map((m) => (
                  <div key={m.name} className="p-2.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                      <span>{m.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 line-clamp-2">{m.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advanced Technical Details Collapsible */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              <span>ADVANCED ASTROPHYSICAL PARAMETERS</span>
              {showTechnical ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showTechnical && (
              <div className="mt-2 p-3 rounded-lg bg-black/40 border border-white/5 font-mono space-y-1.5 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Mean Orbital Speed:</span>
                  <span>{planet.speed_km_s} km/s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Orbital Period:</span>
                  <span>{planet.orbit_period_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mean Volumetric Radius:</span>
                  <span>{planet.radius_km.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heliocentric X (AU):</span>
                  <span>{planet.coordinates.heliocentric_au.x}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heliocentric Y (AU):</span>
                  <span>{planet.coordinates.heliocentric_au.y}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Heliocentric Z (AU):</span>
                  <span>{planet.coordinates.heliocentric_au.z}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
