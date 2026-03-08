import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Send, Trash2, Volume2, VolumeX, Play, Search, Fingerprint, Heart } from 'lucide-react';

// Supabase Config
const SUPABASE_URL = 'https://urcxbufxcebfgrsfvmsj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY3hidWZ4Y2ViZmdyc2Z2bXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzExMTYsImV4cCI6MjA4NzI0NzExNn0.CoWpvdB4v27SAWEni48Wu0JQcSMebRoZCPppnJNlLmQ';
const TABLE_NAME = 'messages';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const JournalEntry: React.FC<{ text: string; delay?: number; className?: string }> = ({ text, delay = 40, className = "" }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) {
      setStarted(true);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(interval);
      }, delay);
      return () => clearInterval(interval);
    }
  }, [text, delay, started]);

  return <p className={className}>{displayedText}</p>;
};

const App: React.FC = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSender, setCurrentSender] = useState<'N' | 'S'>('N');
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typewriterText, setTypewriterText] = useState('');
  const [candleBlown, setCandleBlown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPostcardExperience, setShowPostcardExperience] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [romanticMessage, setRomanticMessage] = useState('');
  const [calendarTooltip, setCalendarTooltip] = useState<{ day: number; msg: string; x: number; y: number } | null>(null);

  const birthdaySongRef = useRef<HTMLAudioElement>(null);
  const applauseSfxRef = useRef<HTMLAudioElement>(null);
  const hiddenGreetingRef = useRef<HTMLVideoElement>(null);
  const msgDisplayRef = useRef<HTMLDivElement>(null);
  const typewriterIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [confetti, setConfetti] = useState<any[]>([]);

  const totalPages = 7;

  const triggerConfetti = () => {
    const pieces = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      delay: Math.random() * 2 + 's',
      color: ['#8b0000', '#f2ecd9', '#d4af37', '#ff9800'][Math.floor(Math.random() * 4)]
    }));
    setConfetti(pieces);
    
    const messages = [
      "Kamu adalah anugerah terindah dalam hidupku. ❤️",
      "Selamat ulang tahun, pusat semestaku. ✨",
      "Tujuh belas tahun yang lalu, dunia menjadi lebih indah karena kamu lahir. 🌹",
      "Aku akan selalu ada untukmu, di setiap langkahmu. 💍",
      "Happy Birthday, Sayangku. Kamu adalah segalanya bagiku. 💖"
    ];
    setRomanticMessage(messages[Math.floor(Math.random() * messages.length)]);
    
    setTimeout(() => {
      setConfetti([]);
      setRomanticMessage('');
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isUnlocked && pageIndex === 6) {
      loadMessages();
      const channel = supabase
        .channel('messages_channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => loadMessages())
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isUnlocked, pageIndex]);

  useEffect(() => {
    if (pageIndex === 4 && candleBlown && !isTyping && typewriterText === '') {
      startTypewriter();
    }
  }, [pageIndex, candleBlown]);

  useEffect(() => {
    if (msgDisplayRef.current) {
      msgDisplayRef.current.scrollTop = msgDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('loadMessages failed:', err);
    }
  };

  const handlePinInput = (val: string) => {
    setPin(val);
    if (val === '300326') {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsUnlocked(true);
      }, 2500);
    }
  };

  const next = () => {
    if (pageIndex < totalPages - 1) setPageIndex(pageIndex + 1);
  };

  const prev = () => {
    if (pageIndex > 0) setPageIndex(pageIndex - 1);
  };

  const fadeIn = (audio: HTMLAudioElement | null, duration = 2000) => {
    if (!audio) return;
    audio.volume = 0;
    audio.play().catch(e => console.warn("Playback blocked:", e));
    let vol = 0;
    const interval = setInterval(() => {
      if (vol < 1) {
        vol += 0.05;
        audio.volume = Math.min(vol, 1);
      } else {
        clearInterval(interval);
      }
    }, duration / 20);
  };

  const fadeOut = (audio: HTMLAudioElement | null, duration = 2000) => {
    if (!audio || audio.paused) return;
    let vol = audio.volume;
    const interval = setInterval(() => {
      if (vol > 0.05) {
        vol -= 0.05;
        audio.volume = Math.max(vol, 0);
      } else {
        audio.volume = 0;
        audio.pause();
        audio.currentTime = 0;
        clearInterval(interval);
      }
    }, duration / 20);
  };

  const startTypewriter = () => {
    if (isTyping) return;
    setIsTyping(true);
    setTypewriterText('');
    const txt = "Kepada Aset Berharga,\n\nDi hari yang luar biasa istimewa ini, aku ingin kamu tahu betapa berartinya setiap detik kehadiranmu bagi duniaku. Selamat ulang tahun yang ke-17, sayangku.\n\nTujuh belas adalah awal dari petualangan yang lebih dewasa, lebih menantang. Aku akan tetap di sini, di sisimu, memastikan setiap memori kita tersimpan dengan aman dalam arsip rahasia ini.\n\nTetaplah bersinar, tetaplah menjadi dirimu yang luar biasa. Selamat ulang tahun ke-17, Sayangku.\n\nSelamanya milikmu,\nN.";
    let i = 0;
    if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
    
    typewriterIntervalRef.current = setInterval(() => {
      setTypewriterText(txt.slice(0, i + 1));
      i++;
      if (i >= txt.length) {
        if (typewriterIntervalRef.current) clearInterval(typewriterIntervalRef.current);
        setIsTyping(false);
      }
    }, 50);
  };

  const extinguishCandle = () => {
    setFlashActive(true);
    fadeIn(birthdaySongRef.current);
    setTimeout(() => {
      setCandleBlown(true);
      setFlashActive(false);
    }, 400);
  };

  const sendMessage = async () => {
    if (!msgInput.trim()) return;
    const content = msgInput.trim();
    setMsgInput('');
    try {
      await supabase.from(TABLE_NAME).insert([{ content, sender: currentSender }]);
      loadMessages();
    } catch (err) {
      console.error('send() error:', err);
    }
  };

  const confirmPurge = async () => {
    if (window.confirm("WARNING: Permanent deletion of all transmission logs. Proceed?")) {
      try {
        await supabase.from(TABLE_NAME).delete().neq('id', -1);
        loadMessages();
        setShowDeleteModal(false);
      } catch (e) {
        console.error("Purge error", e);
      }
    }
  };

  if (!isUnlocked) {
    return (
      <div id="auth-module" className={isLoading ? 'scanning-active' : ''}>
        <div id="scanning-line"></div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              id="constellation-loader"
              style={{ display: 'flex' }}
            >
              <svg viewBox="0 0 200 200" width="180" height="180" className="mb-4">
                <g className="twinkle">
                  <circle cx="100" cy="40" r="2" className="star" />
                  <circle cx="120" cy="70" r="2" className="star" />
                  <circle cx="110" cy="110" r="2" className="star" />
                  <circle cx="70" cy="90" r="2" className="star" />
                  <circle cx="150" cy="60" r="2" className="star" />
                  <circle cx="140" cy="95" r="2" className="star" />
                </g>
                <path d="M100 40 L120 70 L110 110 L70 90 L120 70 M120 70 L150 60 L140 95 L110 110" fill="none" className="const-line" />
              </svg>
              <p className="text-[9px] uppercase tracking-[0.4em] opacity-60">Aligning Sagittarius...</p>
            </motion.div>
          ) : !showPin ? (
            <motion.div
              key="init"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="terminal-container"
            >
              <button className="init-btn" onClick={() => setShowPin(true)}>Access Archive</button>
            </motion.div>
          ) : (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="terminal-container decode-interface"
              style={{ display: 'block' }}
            >
              <input
                type="password"
                value={pin}
                onChange={(e) => handlePinInput(e.target.value)}
                maxLength={6}
                className="w-full bg-transparent border-b border-red-900 text-center text-4xl text-red-700 outline-none tracking-[0.5em] py-2"
                placeholder="******"
                autoFocus
              />
              <p className="text-[9px] mt-6 text-white/40 tracking-widest uppercase">Hint: 300326</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
      <div id="flash-overlay" className={flashActive ? 'flash-active' : ''}></div>
      <div className="vintage-overlay"></div>

      {confetti.map(p => (
        <div 
          key={p.id} 
          className="confetti-piece confetti-anim" 
          style={{ left: p.left, animationDelay: p.delay, backgroundColor: p.color }}
        ></div>
      ))}

      {romanticMessage && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-10 left-1/2 transform -translate-x-1/2 z-[2000] bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-red-100"
        >
          <p className="text-red-900 font-serif italic text-sm text-center">{romanticMessage}</p>
        </motion.div>
      )}

      {showDeleteModal && (
        <div id="delete-modal" className="custom-modal" style={{ display: 'flex' }}>
          <div className="bg-[#f2ecd9] p-6 max-w-xs w-full border-t-8 border-red-900 text-center shadow-2xl relative z-50">
            <h3 className="font-bold uppercase text-[10px] tracking-widest mb-2">Penghancuran Berkas?</h3>
            <p className="text-[9px] mb-6 opacity-70">Log transmisi akan dihapus secara permanen.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2 border border-black text-[9px] uppercase">Abort</button>
              <button onClick={confirmPurge} className="flex-1 py-2 bg-red-900 text-white text-[9px] uppercase">Execute</button>
            </div>
          </div>
        </div>
      )}

      <main className="paper-container">
        <div id="nav-l" className="nav-zone nav-left" onClick={prev}></div>
        <div id="nav-r" className="nav-zone nav-right" onClick={next}></div>

        <div id="module-viewport" className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="popLayout">
            {/* Page 0: Editorial */}
            {pageIndex === 0 && (
              <motion.section
                key="page0"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="page-module victorian-bg active"
              >
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="newspaper-fragment" style={{ top: '8%', right: '5%', transform: 'rotate(12deg)', width: '100px', opacity: 0.8, boxShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}>
                    <h4>BREAKING</h4>
                    <p>Sinyal misterius terdeteksi dari sektor 17.</p>
                  </div>
                  <div className="washi-tape washi-pattern" style={{ top: '5%', right: '2%', transform: 'rotate(45deg)', width: '60px' }}></div>
                  <div className="pushpin" style={{ top: '10%', left: '15%' }}></div>
                </div>

                <div className="torn-paper torn-bottom p-6 shadow-xl relative bg-[#f9f7f1] mt-8 mx-2 rotate-[-2deg] z-10">
                  <div className="coffee-stain" style={{ top: '10px', right: '10px', opacity: 0.4 }}></div>
                  <div className="washi-tape" style={{ top: '-12px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: '120px' }}></div>
                  <div className="text-center mb-2 border-b-2 border-double border-black/20 pb-2">
                    <p className="text-[9px] uppercase tracking-[0.4em] opacity-50 font-serif">Special Issue: March 30, 2026</p>
                  </div>
                  <h1 className="text-5xl text-center my-4 font-black italic tracking-tighter leading-none font-playfair">The Ledger</h1>
                  
                  <div className="space-y-4 text-justify leading-relaxed relative z-10 font-garamond">
                    <JournalEntry className="nyt-lead text-[1.2rem]" text="Tepat pada koordinat waktu yang telah ditentukan, sayangku secara resmi memasuki fase kedewasaan ke-17 tahun, menandai berakhirnya sebuah era dan dimulainya babak baru yang lebih krusial." />
                    <JournalEntry className="text-[1rem]" text="Laporan intelijen ini bukan sekadar arsip rutin, melainkan bukti otentik dari perjalanan panjang yang penuh makna. Tujuh belas tahun bukanlah sekadar angka dalam kalender, melainkan akumulasi dari setiap tawa, mimpi, dan keberanian yang telah kamu bentuk dengan indah, sayangku." />
                  </div>
                </div>

                <div className="relative mt-6 mx-4 z-10">
                  <div className="notebook-paper transform rotate-2">
                    <div className="coffee-stain" style={{ bottom: '-30px', left: '-20px', width: '80px', height: '80px' }}></div>
                    <div className="washi-tape washi-blue" style={{ top: '-10px', left: '-10px', transform: 'rotate(-45deg)', width: '50px' }}></div>
                    <div className="quote-block !m-0 !bg-transparent !border-none !p-0">
                      "Beberapa jiwa bersinar terlalu terang untuk sekadar dilewatkan oleh waktu; mereka adalah naskah yang ditulis oleh takdir."
                    </div>
                  </div>
                </div>
                
                <div className="mt-auto mb-8 p-4 relative z-10">
                  <div className="handwritten-note absolute -top-4 -left-2 z-20 opacity-60">"You're the best!"</div>
                  <div className="torn-paper torn-top p-4 bg-white rotate-1 shadow-md">
                    <div className="paperclip" style={{ top: '-20px', right: '20px', transform: 'rotate(15deg)' }}></div>
                    <JournalEntry className="text-[1rem] font-serif text-justify" text="Statusmu kini telah ditingkatkan menjadi aset paling berharga dalam sejarah operasional hidupku. Ketahuilah bahwa di setiap detak waktu yang berlalu, sayangku akan selalu menjadi pusat dari segala koordinat kebahagiaanku. Selamat datang di gerbang baru kehidupan." />
                    <div className="mt-4 border-t border-dashed border-black/30 pt-2 text-right">
                      <span className="scrap-text text-[8px]">REF: OPR-17-SWEET</span>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Page 1: Evidence */}
            {pageIndex === 1 && (
              <motion.section
                key="page1"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="page-module victorian-bg active"
              >
                <div className="grid-paper shadow-2xl rotate-[1deg] !h-auto mb-4 mt-6 mx-2 relative z-10">
                  <div className="washi-tape washi-yellow" style={{ top: '-10px', right: '20px', transform: 'rotate(15deg)', width: '80px' }}></div>
                  <div className="washi-tape" style={{ bottom: '-10px', left: '20px', transform: 'rotate(-15deg)', width: '80px' }}></div>
                  
                  <div className="absolute top-[-20px] right-[-10px] z-30">
                    <div className="polaroid w-28 rotate-[5deg]">
                      <div className="pushpin" style={{ top: '5px', left: '50%', transform: 'translateX(-50%)' }}></div>
                      <img src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/Desain%20tanpa%20judul_20250821_003903_0000.jpg" alt="Sayangku" referrerPolicy="no-referrer" />
                      <div className="polaroid-caption">Target Acquired</div>
                    </div>
                  </div>
                  
                  <div className="form-header border-b-2 border-black mb-4 pb-1 w-2/3">
                    <div className="text-[14px] font-black uppercase tracking-[0.1em] text-black font-serif">CONFIDENTIAL FILE</div>
                    <div className="text-[8px] font-mono">CASE ID: 017/AF-MAR</div>
                  </div>

                  <div className="mt-2 space-y-2 pr-[95px] font-mono text-[10px]">
                    <div className="bg-white/50 p-1 border-b border-dotted border-black/30 flex justify-between">
                      <span className="font-bold text-gray-500">SUBJECT:</span>
                      <span className="font-bold">SAYANGKU</span>
                    </div>
                    <div className="bg-white/50 p-1 border-b border-dotted border-black/30 flex justify-between">
                      <span className="font-bold text-gray-500">CLASS:</span>
                      <span className="font-bold text-red-800">S-TIER ASSET</span>
                    </div>
                    <div className="bg-white/50 p-1 border-b border-dotted border-black/30 flex justify-between">
                      <span className="font-bold text-gray-500">AGE:</span>
                      <span className="font-bold">17 YEARS</span>
                    </div>
                    <div className="bg-white/50 p-1 border-b border-dotted border-black/30 flex justify-between">
                      <span className="font-bold text-gray-500">ORIGIN:</span>
                      <span className="font-bold">30/03/2009</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 relative">
                    <div className="newspaper-fragment" style={{ top: '-15px', left: '-15px', transform: 'rotate(-5deg)', zIndex: 10 }}>
                      <h4>EVIDENCE #1</h4>
                      <p>Rekaman visual terenkripsi.</p>
                    </div>
                    <div className="bg-black/[0.04] p-3 border-2 border-dashed border-black/20 rounded-sm relative group bg-white">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[8px] font-bold uppercase opacity-50">Encrypted Signal:</p>
                        <span className="text-[7px] font-mono text-red-800 bg-red-100 px-1 border border-red-200">{isDecrypted ? 'DECRYPTED' : 'LOCKED'}</span>
                      </div>
                      
                      {isDecrypted ? (
                        <div className="transition-all duration-500 ease-in-out">
                          <video controls className="w-full border border-black/10 shadow-sm" style={{ maxHeight: '120px', objectFit: 'cover' }}>
                            <source src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/VID_20250808204246202.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsDecrypted(true)}
                          className="w-full py-3 border border-dashed border-black/30 bg-[#f0f0f0] hover:bg-white transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                        >
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-700">Tap to Decrypt Signal</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-2 bg-yellow-50 border border-yellow-100 text-justify relative">
                    <div className="washi-tape washi-pattern" style={{ top: '-5px', left: '40%', width: '60px', height: '15px' }}></div>
                    <p className="text-[9px] leading-relaxed text-gray-800 font-serif italic">
                      "Subjek menunjukkan perkembangan emosional yang signifikan. Prioritas pengawasan: MUTLAK."
                    </p>
                  </div>
                  
                  <div className="stamp-container-v2 mt-4">
                    <div className="round-stamp opacity-80 rotate-[-10deg]">
                      VERIFIED<br />BY N.<br />SECURE
                    </div>
                    <Fingerprint className="fingerprint-zone opacity-40" />
                    <div className="barcode-strip opacity-30"></div>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Page 2: Clipping */}
            {pageIndex === 2 && (
              <motion.section
                key="page2"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="page-module victorian-bg active"
              >
                <h2 className="text-center font-bold text-[10px] uppercase mb-6 border-b pb-2 tracking-[0.2em]">Digital Clipping: Ext. Source</h2>
                
                <div className="relative bg-white p-2 shadow-lg rotate-1 border border-gray-300 mt-4 mx-2">
                  <div className="washi-tape washi-blue" style={{ top: '-10px', left: '10%', transform: 'rotate(-2deg)', width: '80px' }}></div>
                  <div className="washi-tape washi-yellow" style={{ bottom: '-10px', right: '10%', transform: 'rotate(2deg)', width: '80px' }}></div>
                  <div className="border border-black/10 p-4 bg-gray-50">
                    <p className="text-[8px] font-bold uppercase mb-3 text-center opacity-60 tracking-widest">Intercepted Signal: Instagram</p>
                    <a href="https://www.instagram.com/reel/DQEbbnuEj95/?igsh=MXJ0ejJ5amxsZW1y" target="_blank" rel="noopener noreferrer" className="block group relative overflow-hidden border border-black/20">
                      <div className="aspect-video bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <Play className="h-5 w-5 text-pink-600 fill-current" />
                        </div>
                        <span className="absolute bottom-2 text-[8px] font-bold bg-white/90 px-2 py-0.5 rounded-sm shadow-sm">TAP TO VIEW REEL</span>
                      </div>
                    </a>
                    <div className="mt-3 text-justify">
                      <p className="text-[9px] font-serif italic leading-relaxed text-gray-600">
                        "Visual evidence intercepted from public channels. Subject appears in high spirits. Archiving for sentimental analysis."
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4">
                  <img src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/images.jpeg" className="w-full h-auto rounded-md shadow-lg transform rotate-[-3deg] hover:scale-105 transition-transform" alt="Postcard 1" referrerPolicy="no-referrer" />
                  <img src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/1196-front-661x1024.jpg" className="w-full h-auto rounded-md shadow-lg transform rotate-[2deg] hover:scale-105 transition-transform" alt="Postcard 2" referrerPolicy="no-referrer" />
                  <img src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/images%20(1).jpeg" className="w-full h-auto rounded-md shadow-lg transform rotate-[-1deg] hover:scale-105 transition-transform" alt="Postcard 3" referrerPolicy="no-referrer" />
                </div>
              </motion.section>
            )}

            {/* Page 3: Calendar */}
            {pageIndex === 3 && (
              <motion.section
                key="page3"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="page-module victorian-bg active"
              >
                <audio ref={applauseSfxRef} src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/Applause%20Sound%20Effect%28MP3_320K%29.mp3" preload="auto"></audio>
                <h2 className="text-center font-bold text-[10px] uppercase mb-4 border-b pb-2 tracking-[0.2em] relative z-10">Logbook Operasional: Maret 2026</h2>
                
                <div className="relative h-48 mb-4">
                  <div className="absolute top-2 left-2 w-24 h-16 bg-[#f4ebd0] border border-[#d3c5a3] shadow-md transform rotate-[-15deg] z-0 p-1 flex flex-col justify-between">
                    <div className="washi-tape washi-blue" style={{ top: '-10px', left: '-10px', transform: 'rotate(-30deg)', width: '40px' }}></div>
                    <div className="flex justify-between items-start border-b border-double border-[#d3c5a3] pb-1">
                      <span className="text-[4px] font-serif uppercase text-[#8b0000]">Postcard</span>
                      <div className="w-3 h-4 border border-dashed border-[#d3c5a3]"></div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-1 mt-1">
                      <div className="border-b border-[#d3c5a3] w-full"></div>
                      <div className="border-b border-[#d3c5a3] w-full"></div>
                      <div className="border-b border-[#d3c5a3] w-3/4"></div>
                    </div>
                  </div>

                  <div className="newspaper-fragment" style={{ top: '10px', left: '20px', transform: 'rotate(-8deg)', zIndex: 5 }}>
                    <h4>DAILY CHRONICLE</h4>
                    <p>Laporan cuaca menunjukkan kondisi cerah pada tanggal 30. Persiapan perayaan telah mencapai tahap akhir.</p>
                  </div>
                  <div className="newspaper-fragment" style={{ bottom: '20px', right: '-5px', transform: 'rotate(5deg)', width: '120px', background: '#dcd0c0' }}>
                    <h4>ARCHIVE 017</h4>
                    <p>Dokumen rahasia ini diklasifikasikan sebagai prioritas utama. Jangan disebarluaskan tanpa izin otoritas tertinggi.</p>
                  </div>

                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 rotate-2 z-10">
                    <div className="polaroid w-32">
                      <div className="pushpin" style={{ top: '5px', left: '50%', transform: 'translateX(-50%)' }}></div>
                      <img src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/IMG-20250502-WA0070.jpg" alt="Featured Memory" referrerPolicy="no-referrer" />
                      <div className="polaroid-caption">March 30th</div>
                    </div>
                  </div>

                  <div className="absolute top-0 right-4 w-12 h-12 border-2 border-red-800 rounded-full flex items-center justify-center transform rotate-12 opacity-70 z-20">
                    <span className="text-[6px] font-bold text-red-800 text-center leading-tight">MARCH<br />30<br />2026</span>
                  </div>
                </div>

                <div id="calendar-grid" className="grid grid-cols-7 gap-1 text-[11px] text-center p-4 bg-white/50 border border-black/10 relative z-10 shadow-sm" onMouseLeave={() => setCalendarTooltip(null)}>
                  <div className="coffee-stain" style={{ top: '-20px', left: '-20px' }}></div>
                  {['S','S','R','K','J','S','M'].map((d, idx) => <div key={`${d}-${idx}`} className="font-bold opacity-30 mb-2">{d}</div>)}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(i => (
                    <div 
                      key={i} 
                      className={`p-2 transition-all duration-300 hover:bg-red-900/10 hover:scale-110 cursor-default rounded-sm relative ${i === 30 ? 'date-highlight cursor-pointer group' : 'cursor-pointer'}`}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const msgs = [
                          "Hari yang indah untukmu.",
                          "Kamu selalu ada di pikiranku.",
                          "Setiap hari bersamamu adalah hadiah.",
                          "Senyummu adalah cahayaku.",
                          "Aku beruntung memilikimu.",
                          "Kamu adalah segalanya.",
                          "Cintaku padamu tak terbatas.",
                          "Terima kasih telah hadir.",
                          "Kamu membuatku bahagia.",
                          "Selamanya bersamamu."
                        ];
                        setCalendarTooltip({ 
                          day: i, 
                          msg: msgs[i % msgs.length],
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });

                        if (i === 30) {
                          fadeIn(applauseSfxRef.current, 500);
                          triggerConfetti();
                        }
                      }}
                    >
                      {i}
                      {i === 30 && (
                        <>
                          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-[6px] text-red-800 font-bold animate-bounce whitespace-nowrap">TAP ME</div>
                        </>
                      )}
                    </div>
                  ))}

                  <AnimatePresence>
                    {calendarTooltip && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: -10 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed z-[3000] bg-red-900 text-white text-[9px] p-2 rounded shadow-xl pointer-events-none whitespace-nowrap"
                        style={{ left: calendarTooltip.x, top: calendarTooltip.y, transform: 'translateX(-50%)' }}
                      >
                        <div className="font-bold mb-1">Day {calendarTooltip.day}</div>
                        <div className="italic opacity-90">{calendarTooltip.msg}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-900"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="radar-box relative z-10 bg-[#f2ecd9]/80 backdrop-blur-sm p-2 mt-4 border border-black/5">
                  <div className="monitor-line">
                    <div className="wave-pulse"></div>
                  </div>
                  <div className="data-readout uppercase mt-2">
                    <div>Target: Sayangku</div>
                    <div>Coord: 30.0326.N</div>
                    <div>Status: Critical Path</div>
                    <div>Signal: Strong 100%</div>
                  </div>
                  <p className="text-[7px] opacity-60 mt-2 text-justify font-serif italic">
                    "Pemantauan transmisi otomatis diaktifkan. Seluruh sistem sinkron dengan detak waktu target."
                  </p>
                </div>
              </motion.section>
            )}

            {/* Page 4: Surprise */}
            {pageIndex === 4 && (
              <motion.section
                key="page4"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="page-module active"
              >
                <audio ref={birthdaySongRef} src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/gemini_generated_media_e9d2356c.mp3" preload="auto"></audio>
                {!candleBlown && (
                  <div id="candle-stage" style={{ display: 'flex', opacity: 1 }}>
                    <div className="candle">
                      <div className="candle-glow"></div>
                      <div className="flame" onClick={extinguishCandle}></div>
                    </div>
                    <p className="candle-hint">Tap flame to initiate</p>
                  </div>
                )}
                
                <div className={`notebook-paper shadow-lg h-full relative rotate-1 mx-2 mt-4 z-10 ${candleBlown ? 'victorian-bg' : ''}`}>
                  <div className="washi-tape washi-pattern" style={{ top: '-15px', left: '50%', transform: 'translateX(-50%) rotate(2deg)', width: '100px' }}></div>
                  <div className="washi-tape washi-blue" style={{ bottom: '-15px', right: '20px', transform: 'rotate(-5deg)', width: '80px' }}></div>
                  
                  <div className="flex justify-between items-end mb-8 opacity-60 border-b border-black/10 pb-2">
                    <h2 className="text-[9px] font-bold uppercase tracking-widest font-serif text-red-900">Internal Memo: Confidential</h2>
                    <span className="text-[8px] font-mono bg-black/5 px-1">LOG-ID: 300326</span>
                  </div>
                  
                  <div id="typewriter-output" className="relative z-10 min-h-[300px]">{typewriterText}</div>

                  <div className="tarot-card" style={{ top: '20px', left: '-40px', transform: 'rotate(-15deg)' }}>
                    <div className="coffee-stain" style={{ top: '0', left: '0', width: '40px', height: '40px', opacity: 0.3 }}></div>
                    <img src="https://picsum.photos/seed/lovers/300/400" alt="The Lovers" referrerPolicy="no-referrer" />
                    <div className="tarot-label">The Lovers</div>
                  </div>
                  <div className="tarot-card" style={{ top: '140px', left: '-35px', transform: 'rotate(-5deg)' }}>
                    <img src="https://picsum.photos/seed/star/300/400" alt="The Star" referrerPolicy="no-referrer" />
                    <div className="tarot-label">The Star</div>
                  </div>
                  <div className="tarot-card" style={{ top: '80px', right: '-40px', transform: 'rotate(12deg)' }}>
                    <img src="https://picsum.photos/seed/moon/300/400" alt="The Moon" referrerPolicy="no-referrer" />
                    <div className="tarot-label">The Moon</div>
                  </div>
                  
                  <div id="wax-seal-area" className={`wax-seal-decoration mt-auto ${candleBlown && !isTyping ? 'seal-active opacity-100 scale-100' : ''}`}>
                    <div className="newspaper-fragment" style={{ bottom: '10px', left: '-10px', transform: 'rotate(5deg)', width: '80px', zIndex: 0 }}>
                      <h4>VERIFIED</h4>
                      <p>Otentikasi biometrik selesai.</p>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="red-ribbon shadow-sm"></div>
                      <div className="wax-seal shadow-md"></div>
                      <div className="verification-grid mt-4 bg-white/50 p-2 border border-black/5">
                        <div className="bio-info">
                          <div className="bio-row">AUTH: <span className="bio-val">OPR_N</span></div>
                          <div className="bio-row">SESS: <span className="bio-val">AF-17</span></div>
                          <div className="bio-row">SIG: <span className="bio-val">ENCR</span></div>
                        </div>
                        <div className="retro-qr-graphic opacity-60"></div>
                      </div>
                    </div>
                    
                    <div className="footer-shred mt-4"></div>
                    <p className="text-[7px] opacity-30 uppercase tracking-[0.4em] -mt-2 text-center">Official Archive Termination</p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Page 5: Postcard Experience */}
            {pageIndex === 5 && (
              <motion.section
                key="page5"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="page-module victorian-bg active"
              >
                <div id="lyrics-overlay" className={`lyrics-overlay ${showPostcardExperience ? 'active' : 'hidden'}`}>
                  {showPostcardExperience && (
                    <div className="lyrics-viewport">
                       <p className="lyric-line active">Everything you are...</p>
                    </div>
                  )}
                </div>
                <video 
                  ref={hiddenGreetingRef}
                  src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/Hindia%20-%20everything%20u%20are%20edit%28720P_HD%29.mp4" 
                  className={`absolute inset-0 w-full h-full object-cover z-[100] ${showPostcardExperience ? '' : 'hidden'}`}
                  preload="auto" 
                  playsInline
                  onClick={() => setShowPostcardExperience(false)}
                ></video>
                <div className="relative h-full w-full">
                  <div className="absolute top-4 left-2 right-2 bg-[#f4ebd0] p-3 shadow-md transform rotate-[-2deg] border border-[#d3c5a3]">
                    <div className="flex justify-between items-start border-b-2 border-double border-[#d3c5a3] pb-2 mb-2">
                      <div className="text-[8px] font-serif uppercase tracking-widest text-[#8b0000]">Carte Postale</div>
                      <div className="w-8 h-10 border border-dashed border-[#d3c5a3] flex items-center justify-center text-[6px] text-gray-400 text-center">Place<br />Stamp<br />Here</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="w-1/2 relative cursor-pointer group z-[50]" onClick={() => setShowPostcardExperience(true)}>
                        <div className="tape-strip" style={{ top: '-5px', left: '-5px', transform: 'rotate(-15deg)', width: '30px' }}></div>
                        <div className="tape-strip" style={{ bottom: '-5px', right: '-5px', transform: 'rotate(15deg)', width: '30px' }}></div>
                        <img src="https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/IMG-20250504-WA0073.jpg" className="w-full h-auto border-4 border-white shadow-sm filter sepia-[0.1] group-hover:sepia-0 transition-all duration-500" alt="Sweet Memory" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/80 rounded-full p-2 shadow-lg">
                            <Play className="h-4 w-4 text-red-800 fill-current" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-1/2 flex flex-col justify-between">
                        <div className="space-y-2 mt-2">
                          <div className="border-b border-[#d3c5a3] text-[6px] font-serif italic text-[#8b0000] pt-1">Dearest,</div>
                          <div className="border-b border-[#d3c5a3] text-[6px] font-serif italic text-[#5a4a42] pt-1">Selamat ulang tahun yang ke-17.</div>
                          <div className="border-b border-[#d3c5a3] text-[6px] font-serif italic text-[#5a4a42] pt-1">Semoga harimu seindah</div>
                          <div className="border-b border-[#d3c5a3] text-[6px] font-serif italic text-[#5a4a42] pt-1">senyumanmu.</div>
                          <div className="border-b border-[#d3c5a3] text-[6px] font-serif italic text-[#8b0000] text-right pt-1">Love, N</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="newspaper-fragment" style={{ bottom: '10%', left: '5%', transform: 'rotate(-10deg)', zIndex: 10 }}>
                    <h4>MEMORIES</h4>
                    <p>Tersimpan rapi dalam arsip waktu.</p>
                  </div>
                  
                  <div className="absolute bottom-5 right-5 transform rotate-12 z-10">
                    <div className="w-10 h-10 rounded-full border-2 border-red-800 flex items-center justify-center bg-transparent">
                      <span className="text-[8px] font-bold text-red-800 uppercase transform -rotate-12">Love</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-10 transform rotate-12 z-20 opacity-80">
                    <Heart className="text-red-500 w-6 h-6" />
                  </div>
                </div>
              </motion.section>
            )}

            {/* Page 6: Chat Terminal */}
            {pageIndex === 6 && (
              <motion.section
                key="page6"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="page-module active"
              >
                <div className="torn-paper p-1 bg-[#f0f0f0] shadow-2xl h-full flex flex-col rotate-[0.5deg]">
                  <div className="tape-strip" style={{ top: '-10px', left: '10px', transform: 'rotate(-10deg)' }}></div>
                  <div className="tape-strip" style={{ top: '-10px', right: '10px', transform: 'rotate(10deg)' }}></div>
                  
                  <div className="bg-[#1a1a1a] text-green-500 p-4 flex-1 flex flex-col font-mono text-[10px] relative overflow-hidden border-4 border-gray-300 shadow-inner">
                    <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20"></div>
                    
                    <div className="flex justify-between items-center mb-4 border-b border-green-900/50 pb-2 relative z-30">
                      <h2 className="font-bold uppercase tracking-widest animate-pulse">Terminal Comms</h2>
                      <button onClick={() => setShowDeleteModal(true)} className="text-red-500 hover:text-red-400 font-bold uppercase underline decoration-dotted">Purge Logs</button>
                    </div>
                    
                    <div ref={msgDisplayRef} id="msg-display" className="relative z-30 flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-green-900 scrollbar-track-transparent">
                      {messages.length > 0 ? messages.map((m, idx) => (
                        <div key={idx} className={`message-bubble ${m.sender === 'N' ? 'msg-n' : 'msg-aristia'}`}>
                          <span className="block text-[6px] font-bold opacity-40 mb-1 uppercase">{m.sender === 'Aristia' ? 'S' : m.sender}</span>
                          <div>{m.content}</div>
                        </div>
                      )) : <p className="text-center opacity-20 py-10 italic text-[9px]">Channel empty.</p>}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-green-900/50 relative z-30">
                      <div className="identity-toggle mb-2 border border-green-900/30 inline-flex">
                        <div onClick={() => setCurrentSender('N')} className={`toggle-btn text-green-500 hover:bg-green-900/20 ${currentSender === 'N' ? 'active' : ''}`}>OPR_N</div>
                        <div onClick={() => setCurrentSender('S')} className={`toggle-btn text-green-500 hover:bg-green-900/20 ${currentSender === 'S' ? 'active' : ''}`}>SUB_S</div>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={msgInput}
                          onChange={(e) => setMsgInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Input transmission..." 
                          className="flex-1 bg-black border-b border-green-700 text-green-400 outline-none py-2 px-1 placeholder-green-900" 
                          autoComplete="off" 
                        />
                        <button onClick={sendMessage} className="bg-green-900/30 text-green-400 border border-green-700 px-4 py-2 uppercase font-bold hover:bg-green-900/50 transition-colors">Send</button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-8 left-0 w-full flex justify-center">
                    <div className="newspaper-fragment transform rotate-[-2deg] shadow-lg">
                      <h4>SYSTEM STATUS</h4>
                      <p>Koneksi aman. Enkripsi end-to-end aktif.</p>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        <footer className="p-4 border-t border-black/5 flex justify-between items-center text-[8px] opacity-40 font-bold tracking-widest uppercase">
          <div className="flex items-center">
            {pageIndex > 0 && <span id="back-nav-btn" style={{ display: 'inline-block' }} onClick={prev}>[ BACK ]</span>}
            <span>Dossier Cryptography v1.15</span>
          </div>
          <span id="center-stamp">AUTHORIZED ACCESS ONLY</span>
          <span id="page-num">{pageIndex + 1} / {totalPages}</span>
        </footer>
      </main>
    </div>
  );
};

export default App;
