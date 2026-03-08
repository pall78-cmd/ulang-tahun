import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Inline Supabase Config for portability
const SUPABASE_URL = 'https://urcxbufxcebfgrsfvmsj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY3hidWZ4Y2ViZmdyc2Z2bXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzExMTYsImV4cCI6MjA4NzI0NzExNn0.CoWpvdB4v27SAWEni48Wu0JQcSMebRoZCPppnJNlLmQ';
const TABLE_NAME = 'messages';

let supabaseClient: SupabaseClient | null = null;
try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("Supabase initialized");
} catch (e) {
    console.error("Supabase init failed:", e);
}

console.log("DossierSystem script loading...");

// Define types for DossierSystem
interface DossierSystemType {
    index: number;
    currentSender: string;
    isTyping: boolean;
    candleBlown: boolean;
    lyricsInterval: number | null;
    fadeIn: (audioId: string, duration?: number) => void;
    fadeOut: (audioId: string, duration?: number) => void;
    playPostcardExperience: () => void;
    stopSparkles: () => void;
    startSparkles: () => void;
    generateTarotCards: () => Promise<void>;
    init: () => void;
    showPin: () => void;
    runConstellationTransition: () => void;
    unlock: () => void;
    setSender: (name: string) => void;
    render: () => void;
    extinguish: () => void;
    next: () => void;
    prev: () => void;
    type: () => void;
    loadMsgs: () => Promise<void>;
    renderMsgs: (data: any[]) => void;
    send: () => Promise<void>;
    openModal: () => void;
    closeModal: () => void;
    confirmPurge: () => Promise<void>;
}

declare global {
    interface Window {
        DossierSystem: DossierSystemType;
    }
}

// Extend HTMLAudioElement to include fadeInterval
interface FadingAudioElement extends HTMLAudioElement {
    fadeInterval?: number | null;
}

// Define DossierSystem in global scope
window.DossierSystem = {
    index: 0,
    currentSender: 'N',
    isTyping: false,
    candleBlown: false,
    lyricsInterval: null,

    fadeIn(audioId: string, duration = 2000) {
        const audio = document.getElementById(audioId) as FadingAudioElement | null;
        if (!audio) return;
        if (audio.fadeInterval) clearInterval(audio.fadeInterval);
        
        audio.volume = 0;
        audio.play().catch(e => console.warn("Playback blocked or failed:", e));
        
        const step = 0.05;
        const interval = duration * step;
        
        audio.fadeInterval = window.setInterval(() => {
            if (audio.volume < 1 - step) {
                audio.volume += step;
            } else {
                audio.volume = 1;
                if (audio.fadeInterval) clearInterval(audio.fadeInterval);
                audio.fadeInterval = null;
            }
        }, interval);
    },

    fadeOut(audioId: string, duration = 2000) {
        const audio = document.getElementById(audioId) as FadingAudioElement | null;
        if (!audio || audio.paused) return;
        if (audio.fadeInterval) clearInterval(audio.fadeInterval);
        
        const step = 0.05;
        const interval = duration * step;
        
        audio.fadeInterval = window.setInterval(() => {
            if (audio.volume > step) {
                audio.volume -= step;
            } else {
                audio.volume = 0;
                audio.pause();
                audio.currentTime = 0;
                if (audio.fadeInterval) clearInterval(audio.fadeInterval);
                audio.fadeInterval = null;
            }
        }, interval);
    },

    playPostcardExperience() {
        const video = document.getElementById('hidden-greeting') as HTMLVideoElement | null;
        const overlay = document.getElementById('lyrics-overlay');
        if (!video) {
            console.error("Video element 'hidden-greeting' not found!");
            return;
        }
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.classList.add('active');
        }
        video.classList.remove('hidden');
        video.play().catch(e => console.warn("Playback blocked or failed:", e));
        this.startSparkles();
    },

    stopSparkles() {
        const existing = document.querySelectorAll('.sparkle');
        existing.forEach(s => s.remove());
        const overlay = document.getElementById('lyrics-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.classList.add('hidden');
        }
    },

    startSparkles() {
        this.stopSparkles(); // Clear any existing ones
        const container = document.getElementById('lyrics-overlay');
        if (!container) return;
        for (let i = 0; i < 15; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 80 + 20}%`; // Start lower down
            sparkle.style.animationDelay = `${Math.random() * 3}s`;
            sparkle.style.animationDuration = `${Math.random() * 2 + 3}s`; // Vary duration
            container.appendChild(sparkle);
        }
    },

    async generateTarotCards() {
        // Using static tarot images for reliability and pure HTML/JS experience
        const cards = [
            { id: 'tarot-lovers', seed: 'lovers' },
            { id: 'tarot-star', seed: 'star' },
            { id: 'tarot-moon', seed: 'moon' }
        ];

        for (const card of cards) {
            const el = document.getElementById(card.id) as HTMLImageElement | null;
            if (el) {
                // Using Picsum with specific seeds to simulate tarot card imagery
                el.src = `https://picsum.photos/seed/${card.seed}/300/400`;
            }
        }
    },

    init() {
        this.generateTarotCards();
        // Calendar Injection
        const cal = document.getElementById('calendar-grid');
        if (cal) {
            const days = ['S','S','R','K','J','S','M'];
            days.forEach(d => {
                const div = document.createElement('div');
                div.className = 'font-bold opacity-30 mb-2';
                div.innerText = d;
                cal.appendChild(div);
            });
            for(let i=1; i<=31; i++) {
                const div = document.createElement('div');
                div.className = 'p-2 transition-all duration-300 hover:bg-red-900/10 hover:scale-110 cursor-default rounded-sm';
                if (i === 30) {
                    div.className += ' date-highlight cursor-pointer relative group';
                    div.innerHTML = `
                        ${i}
                        <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 bg-red-900 text-white text-[8px] p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            Target Date Reached! Happy 17th Birthday, sayangku! ❤️
                            <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-900"></div>
                        </div>
                        <div class="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-[6px] text-red-800 font-bold animate-bounce whitespace-nowrap">TAP ME</div>
                    `;
                    div.onclick = () => {
                        window.DossierSystem.fadeIn('applause-sfx', 500);
                        alert("Sistem mendeteksi anomali kebahagiaan yang ekstrim pada tanggal ini. Selamat ulang tahun sayangku! 🎉");
                    };
                } else {
                    div.innerText = i.toString();
                }
                cal.appendChild(div);
            }
        }

        if (supabaseClient) {
            supabaseClient.channel('messages_channel')
                .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => { this.loadMsgs(); })
                .subscribe();
        } else {
            console.warn("Supabase client not available, skipping real-time subscription");
        }
        
        this.render();
        const msgField = document.getElementById('msg-field');
        if (msgField) {
            msgField.addEventListener('keypress', (e) => { if(e.key==='Enter') this.send(); });
        }

        // Tape Interaction
        document.querySelectorAll('.tape-strip, .washi-tape').forEach(tape => {
            tape.addEventListener('click', (e) => {
                const mouseEvent = e as MouseEvent;
                const msgs = ["Secret Found!", "XOXO", "Love You", "Top Secret", "Don't Peel!"];
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                
                const note = document.createElement('div');
                note.className = 'hidden-note';
                note.innerText = msg;
                note.style.left = (mouseEvent.clientX - 20) + 'px';
                note.style.top = (mouseEvent.clientY - 30) + 'px';
                note.style.display = 'block';
                document.body.appendChild(note);
                
                setTimeout(() => note.remove(), 2000);
            });
        });
        console.log("DossierSystem initialized");
    },

    showPin() {
        console.log("Access Archive button clicked");
        const initScreen = document.getElementById('init-screen');
        const pinScreen = document.getElementById('pin-screen');
        const pinField = document.getElementById('pin-field');
        if (initScreen) initScreen.style.display = 'none';
        if (pinScreen) pinScreen.style.display = 'block';
        if (pinField) pinField.focus();
    },

    runConstellationTransition() {
        const loader = document.getElementById('constellation-loader');
        if (!loader) return;
        loader.style.display = 'flex';
        setTimeout(() => loader.style.opacity = '1', 10);
        setTimeout(() => {
            loader.style.opacity = '0';
            this.unlock();
            setTimeout(() => loader.style.display = 'none', 500);
        }, 2500);
    },

    unlock() {
        const authModule = document.getElementById('auth-module');
        if (!authModule) return;
        authModule.style.opacity = '0';
        setTimeout(() => { authModule.style.display = 'none'; }, 800);
    },

    setSender(name: string) {
        this.currentSender = name;
        const btnN = document.getElementById('btn-n');
        const btnAristia = document.getElementById('btn-aristia');
        if (btnN) btnN.classList.toggle('active', name === 'N');
        if (btnAristia) btnAristia.classList.toggle('active', name === 'Aristia');
    },

    render() {
        // Audio Fade Out Logic
        if (this.index !== 4) this.fadeOut('birthday-song', 1500);
        if (this.index !== 5) {
            const video = document.getElementById('hidden-greeting') as HTMLVideoElement | null;
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.classList.add('hidden');
            }
            this.stopSparkles();
        }
        if (this.index !== 3) this.fadeOut('applause-sfx', 500);

        document.querySelectorAll('.page-module').forEach((m, i) => m.classList.toggle('active', i === this.index));
        const pageNum = document.getElementById('page-num');
        if (pageNum) pageNum.innerText = `${this.index + 1} / 7`;
        
        const backBtn = document.getElementById('back-nav-btn');
        const centerStamp = document.getElementById('center-stamp');

        if (this.index === 6) { // Chat Page is now at index 6
            this.loadMsgs();
        }
        
        if (this.index === 5) { // Postcard page is at index 5
            if (backBtn) backBtn.style.display = 'inline-block';
            if (centerStamp) centerStamp.style.display = 'none';
        } else {
            if (backBtn) backBtn.style.display = 'none';
            if (centerStamp) centerStamp.style.display = 'inline-block';
        }

        if(this.index === 4 && !this.candleBlown) {
            const candleStage = document.getElementById('candle-stage');
            if (candleStage) {
                candleStage.style.display = 'flex';
                candleStage.style.opacity = '1';
            }
        }
    },

    extinguish() {
        const flash = document.getElementById('flash-overlay');
        if (flash) flash.classList.add('flash-active');
        this.fadeIn('birthday-song');
        
        setTimeout(() => {
            const candleStage = document.getElementById('candle-stage');
            if (candleStage) candleStage.style.opacity = '0';
            setTimeout(() => {
                if (candleStage) candleStage.style.display = 'none';
                this.candleBlown = true;
                this.type();
            }, 1000);
            if (flash) flash.classList.remove('flash-active');
        }, 400); 
    },

    next() { if(this.index < 6) { this.index++; this.render(); } },
    prev() { if(this.index > 0) { this.index--; this.render(); } },

    type() {
        if(this.isTyping) return;
        this.isTyping = true;
        const out = document.getElementById('typewriter-output');
        const seal = document.getElementById('wax-seal-area');
        const page3 = document.getElementById('mod-4');
        const txt = "Kepada Aset Berharga,\n\nDi hari yang luar biasa spesial ini, aku ingin kamu tahu betapa berartinya setiap detik kehadiranmu bagi duniaku. Selamat ulang tahun yang ke-17, sayangku.\n\nTujuh belas adalah awal dari petualangan yang lebih dewasa, lebih menantang. Aku akan tetap di sini, di sisimu, memastikan setiap memori kita tersimpan dengan aman dalam arsip rahasia ini.\n\nTetaplah bersinar, tetaplah menjadi dirimu yang luar biasa. Happy 17th Birthday, my honey.\n\nSelamanya milikmu,\nN.";
        if (out) out.textContent = ""; 
        let i = 0;
        if (seal) seal.classList.remove('seal-active');

        const intrvl = setInterval(() => {
            if (out) out.textContent += txt[i]; 
            i++;
            if(i >= txt.length) { 
                clearInterval(intrvl); 
                this.isTyping = false;
                if (out) out.classList.add('typing-done'); // Optional class to stop cursor blink if needed
                setTimeout(() => { 
                    if (page3) page3.classList.add('victorian-bg'); 
                    if (seal) seal.classList.add('seal-active'); 
                }, 500);
            }
        }, 40); // slightly faster typing
    },

    async loadMsgs() {
        if (!supabaseClient) return;
        try {
            const { data, error } = await supabaseClient.from(TABLE_NAME).select('*').order('created_at', { ascending: true });
            if (error) throw error;
            this.renderMsgs(data || []);
        } catch (err) {
            console.error('loadMsgs failed:', err);
        }
    },

    renderMsgs(data: any[]) {
        const box = document.getElementById('msg-display');
        if(!box) return;
        box.innerHTML = (data && data.length > 0) ? data.map(m => `
            <div class="message-bubble ${m.sender === 'N' ? 'msg-n' : 'msg-aristia'}">
                <span class="block text-[6px] font-bold opacity-40 mb-1 uppercase">${m.sender}</span>
                <div>${m.content}</div>
            </div>
        `).join('') : '<p class="text-center opacity-20 py-10 italic text-[9px]">Channel empty.</p>';
        box.scrollTop = box.scrollHeight;
    },

    async send() {
        const f = document.getElementById('msg-field') as HTMLInputElement | null;
        if(!f || !f.value.trim()) return;
        const content = f.value.trim();
        f.value = '';
        
        if (!supabaseClient) {
            alert("Offline mode: Cannot send messages.");
            return;
        }

        try {
            await supabaseClient.from(TABLE_NAME).insert([{ content: content, sender: this.currentSender }]);
            this.loadMsgs();
            
            // Trigger wax seal animation on Page 4
            const sealElement = document.getElementById('wax-seal-element');
            if (sealElement) {
                // Remove class if it exists to allow re-triggering
                sealElement.classList.remove('stamp-active');
                // Force reflow
                void sealElement.offsetWidth;
                // Add class to trigger animation
                sealElement.classList.add('stamp-active');
            }
        } catch (err) {
            console.error('send() error:', err);
        }
    },

    openModal() { 
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'flex'; 
    },
    closeModal() { 
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'none'; 
    },

    async confirmPurge() {
        if (confirm("WARNING: Permanent deletion of all transmission logs. Proceed?")) {
            if (!supabaseClient) return;
            try {
                await supabaseClient.from(TABLE_NAME).delete().neq('id', -1);
                this.loadMsgs(); 
                this.closeModal();
            } catch(e) {
                console.error("Purge error", e);
            }
        }
    }
};

const initApp = () => {
    console.log("DOM ready, initializing DossierSystem...");
    
    // Setup PIN listener immediately
    const pinField = document.getElementById('pin-field') as HTMLInputElement | null;
    if (pinField) {
        pinField.oninput = (e) => {
            const target = e.target as HTMLInputElement;
            if(target.value === "300326") window.DossierSystem.runConstellationTransition();
        };
        console.log("PIN listener attached");
    } else {
        console.error("PIN field not found!");
    }

    // Initialize system
    window.DossierSystem.init();
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
