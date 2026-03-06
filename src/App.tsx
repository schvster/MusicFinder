import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Copy, Check, Music, Loader2, Disc3 } from 'lucide-react';

interface OdesliResponse {
  entityUniqueId: string;
  userCountry: string;
  pageUrl: string;
  entitiesByUniqueId: Record<string, any>;
  linksByPlatform: Record<string, { country: string; url: string; entityUniqueId: string }>;
}

const PLATFORM_MAP: Record<string, { name: string; color: string; icon?: React.ReactNode }> = {
  spotify: { 
    name: 'Spotify', 
    color: '#1DB954',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.84.241 1.2zM20.16 9.6C16.44 7.38 9.54 7.2 5.58 8.4c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.56-1.38 12.12-1.14 16.44 1.38.54.3 0.72.96.42 1.5-.3.54-.96.72-1.62.42z"/></svg>
  },
  appleMusic: { 
    name: 'Apple Music', 
    color: '#FA243C',
    icon: <svg viewBox="0 0 384 512" fill="currentColor" className="w-6 h-6"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
  },
  youtube: { 
    name: 'YouTube', 
    color: '#FF0000',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  },
  youtubeMusic: { 
    name: 'YouTube Music', 
    color: '#FF0000',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 19.165c-3.958 0-7.165-3.207-7.165-7.165S8.042 4.835 12 4.835s7.165 3.207 7.165 7.165-3.207 7.165-7.165 7.165z"/><path d="M10.121 8.466v7.068l6.137-3.534z"/></svg>
  },
  soundcloud: { 
    name: 'SoundCloud', 
    color: '#FF3300',
    icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.82 17.51h10.95c.68 0 1.23-.55 1.23-1.23 0-.68-.55-1.23-1.23-1.23h-.22c-.39-3.27-3.16-5.8-6.53-5.8-1.58 0-3.03.56-4.16 1.49-.1-.31-.16-.64-.16-.98 0-1.74 1.41-3.15 3.15-3.15.42 0 .82.08 1.19.23.21-.8.93-1.4 1.8-1.4 1.04 0 1.88.84 1.88 1.88 0 .12-.01.24-.03.35.81.44 1.36 1.28 1.36 2.24 0 .12-.01.24-.03.35.37-.12.77-.18 1.18-.18 2.03 0 3.68 1.65 3.68 3.68 0 .19-.01.38-.04.56h1.16c1.17 0 2.12.95 2.12 2.12s-.95 2.12-2.12 2.12H11.82v-2.12zM9.41 17.51h1.26v-6.91c0-.44-.36-.8-.8-.8s-.8.36-.8.8v6.91zm-2.12 0h1.26v-5.2c0-.44-.36-.8-.8-.8s-.8.36-.8.8v5.2zm-2.12 0h1.26v-3.72c0-.44-.36-.8-.8-.8s-.8.36-.8.8v3.72zm-2.12 0h1.26v-2.13c0-.44-.36-.8-.8-.8s-.8.36-.8.8v2.13zm-2.12 0h1.26v-.8c0-.44-.36-.8-.8-.8s-.8.36-.8.8v.8z"/></svg>
  },
  amazonMusic: { name: 'Amazon Music', color: '#00A8E1' },
  amazonStore: { name: 'Amazon', color: '#FF9900' },
  deezer: { name: 'Deezer', color: '#00C7F2' },
  tidal: { name: 'Tidal', color: '#000000' },
  pandora: { name: 'Pandora', color: '#224099' },
  google: { name: 'Google', color: '#4285F4' },
  googleStore: { name: 'Google Store', color: '#4285F4' },
  napster: { name: 'Napster', color: '#ffffff' },
  yandex: { name: 'Yandex', color: '#FF0000' },
  spinlet: { name: 'Spinlet', color: '#b22222' },
  audiomack: { name: 'Audiomack', color: '#FFA200' },
  anghami: { name: 'Anghami', color: '#8A2BE2' },
  boomplay: { name: 'Boomplay', color: '#0000ff' },
  itunes: { name: 'iTunes', color: '#FA243C' },
};

const PLATFORM_ORDER = [
  'spotify',
  'appleMusic',
  'youtube',
  'youtubeMusic',
  'soundcloud',
  'tidal',
  'amazonMusic',
  'pandora',
  'deezer',
  'audiomack',
  'boomplay',
  'anghami',
  'napster',
  'yandex',
  'spinlet',
  'amazonStore',
  'google',
  'googleStore',
  'itunes'
];

const Background = () => (
  <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0a0a0a]">
    <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-purple-600/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/30 blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
    <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-pink-600/20 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
    <div className="absolute bottom-[20%] left-[10%] w-[45%] h-[45%] rounded-full bg-indigo-600/20 blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '9s', animationDelay: '3s' }} />
    
    {/* Noise overlay for texture */}
    <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
  </div>
);

const PlatformCard = ({ platform, url }: { platform: string, url: string }) => {
  const [copied, setCopied] = useState(false);
  const info = PLATFORM_MAP[platform] || { name: platform, color: '#ffffff' };

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex items-center justify-between p-3 sm:p-4 rounded-[1.25rem] sm:rounded-[1.5rem] bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-xl overflow-hidden shadow-lg"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: `linear-gradient(135deg, transparent, ${info.color}, transparent)` }} />
      
      <div className="flex items-center gap-3 sm:gap-4 z-10">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/10 shadow-inner border border-white/10 backdrop-blur-md" style={{ color: info.color }}>
          {info.icon ? info.icon : <Music size={20} className="sm:w-6 sm:h-6" />}
        </div>
        <span className="font-semibold text-white/90 text-base sm:text-lg tracking-tight capitalize">{info.name}</span>
      </div>

      <button
        onClick={handleCopy}
        className="z-10 p-2.5 sm:p-3 rounded-full bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors border border-white/10 hover:border-white/20 backdrop-blur-md"
        title="Copy Link"
      >
        {copied ? <Check size={18} className="sm:w-5 sm:h-5 text-green-400" /> : <Copy size={18} className="sm:w-5 sm:h-5" />}
      </button>
    </a>
  );
};

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OdesliResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const res = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('Could not find links for this URL. Make sure it is a valid music link.');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const entityInfo = result ? (() => {
    const entity = result.entitiesByUniqueId[result.entityUniqueId];
    return {
      title: entity?.title || 'Unknown Title',
      artist: entity?.artistName || 'Unknown Artist',
      thumbnail: entity?.thumbnailUrl || '',
    };
  })() : null;

  const sortedLinks = result ? Object.entries(result.linksByPlatform).sort(([a], [b]) => {
    const indexA = PLATFORM_ORDER.indexOf(a);
    const indexB = PLATFORM_ORDER.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  }) : [];

  return (
    <div className="min-h-screen text-white font-sans selection:bg-white/30 selection:text-white pb-20">
      <Background />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 sm:pt-32">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-[1.25rem] sm:rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl mb-4 sm:mb-6">
            <Music className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-3 sm:mb-4">Music Match</h1>
          <p className="text-base sm:text-lg text-white/60 font-medium px-4">Paste a link to get it on every platform.</p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="relative group"
        >
          <div className="absolute inset-0 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors duration-500" />
          <div className="relative flex items-center bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="pl-4 sm:pl-6 pr-2 text-white/50">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onClick={(e) => e.currentTarget.select()}
              placeholder="Paste Spotify, Apple Music..."
              className="w-full bg-transparent py-4 sm:py-5 text-base sm:text-lg text-white placeholder-white/40 focus:outline-none"
              required
            />
            <div className="pr-2 sm:pr-3 pl-1 sm:pl-2">
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="bg-white text-black p-2.5 sm:p-3 rounded-full hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Search className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-6 p-4 rounded-2xl bg-red-500/20 border border-red-500/30 backdrop-blur-md text-red-200 text-center text-sm sm:text-base font-medium"
            >
              {error}
            </motion.div>
          )}

          {result && entityInfo && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.2 }}
              className="mt-8 sm:mt-12"
            >
              {/* Glass Card for Album Info */}
              <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-8 shadow-[0_16px_40px_0_rgba(0,0,0,0.4)] mb-6 sm:mb-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
                {entityInfo.thumbnail ? (
                  <img 
                    src={entityInfo.thumbnail} 
                    alt={entityInfo.title} 
                    className="w-32 h-32 sm:w-48 sm:h-48 rounded-[1rem] sm:rounded-[1.5rem] shadow-2xl object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-[1rem] sm:rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
                    <Disc3 className="w-12 h-12 sm:w-16 sm:h-16 text-white/30" />
                  </div>
                )}
                <div className="text-center sm:text-left flex-1">
                  <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-3 tracking-tight leading-tight">{entityInfo.title}</h2>
                  <p className="text-lg sm:text-xl text-white/70 font-medium">{entityInfo.artist}</p>
                </div>
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {sortedLinks.map(([platform, linkData]) => (
                  <PlatformCard key={platform} platform={platform} url={linkData.url} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
