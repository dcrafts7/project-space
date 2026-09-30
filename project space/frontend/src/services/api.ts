import {
  SolarSystemState,
  AstronomicalEvent,
  SpaceWeather,
  NewsArticle,
  SpaceMission,
  SkyTonightData,
  ISSTelemetry,
  AIAssistantResponse,
  ResearchGalaxyData,
  ResearchPaper
} from '../types';

const API_BASE = '/api';

export async function fetchCurrentSolarSystem(): Promise<SolarSystemState> {
  const res = await fetch(`${API_BASE}/solar-system/current`);
  if (!res.ok) throw new Error(`Failed to fetch current solar system: ${res.statusText}`);
  return res.json();
}

export async function fetchSolarSystemAtTime(timestampIso: string): Promise<SolarSystemState> {
  const res = await fetch(`${API_BASE}/solar-system/${encodeURIComponent(timestampIso)}`);
  if (!res.ok) throw new Error(`Failed to fetch solar system at time: ${res.statusText}`);
  return res.json();
}

export async function fetchUpcomingEvents(category?: string): Promise<AstronomicalEvent[]> {
  const url = category && category !== 'all'
    ? `${API_BASE}/events/upcoming?category=${encodeURIComponent(category)}`
    : `${API_BASE}/events/upcoming`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch upcoming events: ${res.statusText}`);
  return res.json();
}

export async function fetchEventDetails(eventId: string): Promise<AstronomicalEvent> {
  const res = await fetch(`${API_BASE}/events/${encodeURIComponent(eventId)}`);
  if (!res.ok) throw new Error(`Failed to fetch event details: ${res.statusText}`);
  return res.json();
}

export async function fetchSkyTonight(lat: number, lon: number, timestamp?: string): Promise<SkyTonightData> {
  let url = `${API_BASE}/sky/tonight?lat=${lat}&lon=${lon}`;
  if (timestamp) url += `&timestamp=${encodeURIComponent(timestamp)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch sky tonight: ${res.statusText}`);
  return res.json();
}

export async function fetchSpaceWeather(): Promise<SpaceWeather> {
  const res = await fetch(`${API_BASE}/space-weather`);
  if (!res.ok) throw new Error(`Failed to fetch space weather: ${res.statusText}`);
  return res.json();
}

export async function fetchNews(category?: string, organization?: string): Promise<NewsArticle[]> {
  let url = `${API_BASE}/news/latest?limit=30`;
  if (category && category !== 'all') url += `&category=${encodeURIComponent(category)}`;
  if (organization && organization !== 'all') url += `&organization=${encodeURIComponent(organization)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch news: ${res.statusText}`);
  return res.json();
}

export async function fetchMissions(agency?: string): Promise<SpaceMission[]> {
  const url = agency && agency !== 'all'
    ? `${API_BASE}/missions?agency=${encodeURIComponent(agency)}`
    : `${API_BASE}/missions`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch missions: ${res.statusText}`);
  return res.json();
}

export async function fetchISSTelemetry(): Promise<ISSTelemetry> {
  const res = await fetch(`${API_BASE}/iss/current`);
  if (!res.ok) throw new Error(`Failed to fetch ISS telemetry: ${res.statusText}`);
  return res.json();
}

export async function fetchNearEarthAsteroids(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/asteroids/near-earth`);
  if (!res.ok) throw new Error(`Failed to fetch asteroids: ${res.statusText}`);
  return res.json();
}

export async function askSpaceVerse(
  query: string,
  context?: Record<string, any>,
  explanationLevel?: string,
  mode?: string
): Promise<AIAssistantResponse> {
  const res = await fetch(`${API_BASE}/assistant/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      context,
      explanation_level: explanationLevel || 'enthusiast',
      mode: mode || 'ask'
    }),
  });
  if (!res.ok) throw new Error(`Assistant query failed: ${res.statusText}`);
  return res.json();
}

export async function explainCurrentView(
  context?: Record<string, any>,
  explanationLevel?: string
): Promise<AIAssistantResponse> {
  const res = await fetch(`${API_BASE}/assistant/explain-view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context,
      explanation_level: explanationLevel || 'enthusiast'
    }),
  });
  if (!res.ok) throw new Error(`Explain view failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSurpriseMe(explanationLevel?: string): Promise<AIAssistantResponse> {
  const level = explanationLevel || 'enthusiast';
  const res = await fetch(`${API_BASE}/assistant/surprise-me?level=${encodeURIComponent(level)}`);
  if (!res.ok) throw new Error(`Surprise me failed: ${res.statusText}`);
  return res.json();
}

export async function fetchResearchGalaxy(): Promise<ResearchGalaxyData> {
  const res = await fetch(`${API_BASE}/assistant/research/galaxy`);
  if (!res.ok) throw new Error(`Failed to fetch research galaxy: ${res.statusText}`);
  return res.json();
}

export async function fetchResearchPapers(target?: string, query?: string): Promise<ResearchPaper[]> {
  let url = `${API_BASE}/assistant/research/papers`;
  const params = new URLSearchParams();
  if (target) params.append('target', target);
  if (query) params.append('q', query);
  const qStr = params.toString();
  if (qStr) url += `?${qStr}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch research papers: ${res.statusText}`);
  return res.json();
}

export async function fetchResearchPaper(paperId: string): Promise<ResearchPaper> {
  const res = await fetch(`${API_BASE}/assistant/research/paper/${encodeURIComponent(paperId)}`);
  if (!res.ok) throw new Error(`Failed to fetch research paper: ${res.statusText}`);
  return res.json();
}

export async function fetchAstronomicalDatasets(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/assistant/research/datasets`);
  if (!res.ok) throw new Error(`Failed to fetch datasets: ${res.statusText}`);
  return res.json();
}
