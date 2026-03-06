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

import { SiSpotify, SiApplemusic, SiYoutubemusic, SiTidal, SiSoundcloud } from 'react-icons/si';
import { FaAmazon } from 'react-icons/fa';

const PLATFORM_MAP: Record<string, { name: string; color: string; icon?: React.ReactNode }> = {
  spotify: { 
    name: 'Spotify', 
    color: '#1DB954',
    icon: <SiSpotify className="w-5 h-5 sm:w-6 sm:h-6" />
  },
  appleMusic: { 
    name: 'Apple Music', 
    color: '#FA243C',
    icon: <SiApplemusic className="w-5 h-5 sm:w-6 sm:h-6" />
  },
  youtubeMusic: { 
    name: 'YouTube Music', 
    color: '#FF0000',
    icon: <SiYoutubemusic className="w-5 h-5 sm:w-6 sm:h-6" />
  },
  soundcloud: { 
    name: 'SoundCloud', 
    color: '#FF3300',
    icon: <SiSoundcloud className="w-5 h-5 sm:w-6 sm:h-6" />
  },
  amazonMusic: { 
    name: 'Amazon Music', 
    color: '#00A8E1',
    icon: <FaAmazon className="w-5 h-5 sm:w-6 sm:h-6" />
  },
  tidal: { 
    name: 'Tidal', 
    color: '#000000',
    icon: <SiTidal className="w-5 h-5 sm:w-6 sm:h-6" />
  },
};

const ALLOWED_PLATFORMS = [
  'spotify',
  'appleMusic',
  'youtubeMusic',
  'tidal',
  'soundcloud',
  'amazonMusic'
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
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-white/10 shadow-inner border border-white/10 backdrop-blur-md overflow-hidden" style={{ color: info.color }}>
          {info.imgUrl ? (
            <img src={info.imgUrl} alt={info.name} className="w-5 h-5 sm:w-6 sm:h-6 object-contain" referrerPolicy="no-referrer" />
          ) : info.icon ? (
            info.icon
          ) : (
            <Music size={20} className="sm:w-6 sm:h-6" />
          )}
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
  const [albumName, setAlbumName] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    setLoading(true);
    setError('');
    setResult(null);
    setAlbumName(null);
    
    try {
      // Using our own backend proxy to bypass CORS
      const res = await fetch(`/api/links?url=${encodeURIComponent(url)}`);
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Could not find links for this URL. Make sure it is a valid music link.');
      }
      const data = await res.json();
      setResult(data);

      const mainEntity = data.entitiesByUniqueId[data.entityUniqueId];
      if (mainEntity?.type === 'song') {
        const itunesLink = data.linksByPlatform?.itunes || data.linksByPlatform?.appleMusic;
        if (itunesLink?.entityUniqueId) {
          const itunesId = itunesLink.entityUniqueId.split('::')[1];
          if (itunesId) {
            fetch(`https://itunes.apple.com/lookup?id=${itunesId}`)
              .then(r => r.json())
              .then(itunesData => {
                if (itunesData.results?.[0]?.collectionName) {
                  setAlbumName(itunesData.results[0].collectionName);
                }
              })
              .catch(console.error);
          }
        }
      }
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

  const sortedLinks = result ? Object.entries(result.linksByPlatform)
    .filter(([platform]) => ALLOWED_PLATFORMS.includes(platform))
    .sort(([a], [b]) => ALLOWED_PLATFORMS.indexOf(a) - ALLOWED_PLATFORMS.indexOf(b))
  : [];

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
                  {albumName && (
                    <p className="text-sm sm:text-base text-white/50 font-medium mt-1 sm:mt-2">
                      Album: <span className="text-white/70">{albumName}</span>
                    </p>
                  )}
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
