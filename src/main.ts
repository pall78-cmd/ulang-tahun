import { createClient, SupabaseClient } from '@supabase/supabase-js';
import confetti from 'canvas-confetti';

// Transmission Messages & Storage System
export interface TransmissionMessage {
    id: number;
    sender: string;
    content: string;
    created_at: string;
}

const STORAGE_KEY = 'dossier_transmissions_jeva_v2';

const INITIAL_MESSAGES: TransmissionMessage[] = [
    {
        id: 1,
        sender: 'OPR_N',
        content: 'Arsip perjalanan 1 tahun penuh berhasil diamankan. Terima kasih atas setiap tawa, perjuangan, dan ketulusan bersama Jeva Muafida. Menuju tahun baru yang lebih indah!',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
        id: 2,
        sender: 'JEVA',
        content: 'Tahun ini penuh berkah, cerita tak terduga, dan momen-momen hangat. Mari kita melangkah ke babak berikutnya dengan hati yang lebih tenang dan gembira ✨',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    }
];

function getStoredMessages(): TransmissionMessage[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MESSAGES));
            return INITIAL_MESSAGES;
        }
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
        }
        return INITIAL_MESSAGES;
    } catch {
        return INITIAL_MESSAGES;
    }
}

function saveStoredMessages(msgs: TransmissionMessage[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
    } catch (e) {
        console.warn('LocalStorage save warning:', e);
    }
}

// Optional Supabase Config (Hybrid Mode)
const SUPABASE_URL = 'https://urcxbufxcebfgrsfvmsj.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyY3hidWZ4Y2ViZmdyc2Z2bXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzExMTYsImV4cCI6MjA4NzI0NzExNn0.CoWpvdB4v27SAWEni48Wu0JQcSMebRoZCPppnJNlLmQ';
const TABLE_NAME = 'messages';
const IS_REMOTE_SYNC_ACTIVE = false;

let supabaseClient: SupabaseClient | null = null;
if (IS_REMOTE_SYNC_ACTIVE) {
    try {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch {
        supabaseClient = null;
    }
}

// Extend HTMLAudioElement to include fadeInterval
interface FadingAudioElement extends HTMLAudioElement {
    fadeInterval?: number | null;
}

export interface MilestoneDateItem {
    key: string;
    day: number;
    month: number; // 0-indexed (2 = Maret, 3 = April, 11 = Desember)
    monthName: string;
    label: string;
    badge: string;
    icon: string;
    title: string;
    subtitle: string;
    ref: string;
    body: string[];
    quote: string;
}

export const MONTH_NAMES = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const MILESTONES: Record<string, MilestoneDateItem> = {
    '08-03': {
        key: '08-03',
        day: 8,
        month: 2, // Maret
        monthName: 'Maret',
        label: 'Awal Chat Kita',
        badge: 'FIRST CONTACT // PERCAKAPAN PERTAMA',
        icon: '🌸',
        title: 'Awal Mula Kisah Kita',
        subtitle: 'KOORDINAT 08 MARET 2026 // AWAL CHAT KITA',
        ref: '2026-JM-LOG08',
        body: [
            '<b>Subjek: Jeva Muafida & Naufal — Pertemuan Pesan Pertama.</b>',
            'Hari di mana layar ponsel menyala dengan percikan obrolan pertama kita. Berawal dari sapaan sederhana dan sedikit rasa canggung yang manis, detik demi detik obrolan perlahan menjelma menjadi percakapan hangat tanpa henti yang selalu dinantikan setiap harinya.',
            'Dari tanggal 8 Maret inilah, kisah penuh tawa, cerita konyol, hingga obrolan mendalam yang menenangkan hati bermula. Titik awal dari segala rasa nyaman yang kini terasa begitu abadi dan tak tergantikan.'
        ],
        quote: '"Sebuah pesan singkat di tanggal 8 Maret yang menjadi babak terindah dalam lembaran hidupku bersama Jeva Muafida."'
    },
    '24-04': {
        key: '24-04',
        day: 24,
        month: 3, // April
        monthName: 'April',
        label: 'Ultah Sosok Tersayang',
        badge: 'HER BIRTHDAY // JEVA MUAFIDA',
        icon: '🎂',
        title: 'Hari Lahir Orang Paling Kusayang',
        subtitle: 'KOORDINAT 24 APRIL 2026 // ULTAH JEVA MUAFIDA',
        ref: '2026-JM-LOG24',
        body: [
            '<b>Target Operasional: Jeva Muafida — Orang Paling Kusayang di Seluruh Semesta.</b>',
            'Tanggal 24 April adalah hari lahir seseorang yang paling istimewa dan paling berharga di hatiku. Kehadiranmu ke dunia ini adalah anugerah terbesar yang selalu kusyukuri tanpa jeda.',
            'Terima kasih telah hadir dengan ketulusan hati, senyum yang selalu meluruhkan lelah, dan kebaikan yang menyinari duniaku. Semoga setiap langkahmu selalu dipeluk bahagia, dilimpahi kesehatan, dan dikelilingi cinta tak berujung.'
        ],
        quote: '"Selamat ulang tahun untuk orang paling kusayangi di dunia. Terima kasih telah terlahir dan menjadi rumah terhangat bagi hatiku."'
    },
    '13-12': {
        key: '13-12',
        day: 13,
        month: 11, // Desember
        monthName: 'Desember',
        label: 'Ultah Naufal (Aku)',
        badge: "NAUFAL'S BIRTHDAY // OPERATOR N",
        icon: '🎁',
        title: 'Hari Kelahiran Naufal (Aku)',
        subtitle: 'KOORDINAT 13 DESEMBER 2026 // ULTAH NAUFAL',
        ref: '2026-JM-LOG13',
        body: [
            '<b>Subjek: Naufal (Operator N) — Hari Kelahiran.</b>',
            '13 Desember adalah hari kelahiranku. Bertambahnya usia kali ini terasa jauh lebih berwarna, tenang, dan berarti karena aku menjalaninya bersamamu, Jeva.',
            'Rasa syukur terdalam kupanjatkan bukan hanya atas bertambahnya angka tahun, melainkan atas anugerah memiliki kamu di sisiku, menemani setiap perjuangan, tawa, dan mimpi masa depan.'
        ],
        quote: '"Kado terindah dalam setiap pertambahan usiaku adalah mengetahui bahwa hatiku berjalan berdampingan bersamamu."'
    },
    '30-03': {
        key: '30-03',
        day: 30,
        month: 2,
        monthName: 'Maret',
        label: 'Milestone Monumental',
        badge: 'MONUMENTAL MILESTONE',
        icon: '✨',
        title: 'Catatan Momen Monumental 2026',
        subtitle: 'LOGBOOK OPERASIONAL // KOORDINAT TANGGAL 30',
        ref: '2026-JM-LOG30',
        body: [
            '<b>Target Operasional: Jeva Muafida.</b>',
            'Tanggal 30 adalah penanda khusus jejak monumental yang kita lalui bersama. Menjadi saksi dari setiap tawa lepas, perjuangan hebat, dan langkah penuh keberanian yang kamu tapaki.',
            'Semua tawa dan kenangan yang tercipta menjadi bukti betapa berartinya kebersamaan ini.'
        ],
        quote: '"Terima kasih telah menjadikan perjalanan satu tahun ini begitu indah dan tak tergantikan. Kamu adalah anugerah terbaik."'
    }
};

// Define types for DossierSystem
export interface DossierSystemType {
    index: number;
    currentSender: string;
    isTyping: boolean;
    candleBlown: boolean;
    direction: string;
    isCapsuleSimulatedUnlocked: boolean;
    isFlipping: boolean;
    capsuleInterval: number | null;
    tutorialTimeout: number | null;
    calendarMonth: number;
    calendarYear: number;
    currentDateKey: string;

    fadeIn: (audioId: string, duration?: number) => void;
    fadeOut: (audioId: string, duration?: number) => void;
    
    openVideoModal: () => void;
    closeVideoModal: () => void;
    playDossierVideo: () => void;
    
    renderCalendar: () => void;
    changeCalendarMonth: (delta: number) => void;
    selectMilestone: (key: string) => void;
    jumpToMilestone: (key: string) => void;
    openCurrentMilestoneModal: () => void;
    openDateNoteModal: (key?: string) => void;
    closeDateNoteModal: () => void;
    saveCurrentDateMemo: () => void;
    getNextMilestoneData: () => any;
    jumpToNextMilestone: () => void;

    stopSparkles: () => void;
    startSparkles: () => void;
    generateTarotCards: () => void;
    initBookGestures: () => void;
    init: () => void;
    showPin: () => void;
    runConstellationTransition: () => void;
    unlock: () => void;
    setSender: (name: string) => void;
    turnPage: (targetIdx: number, dir: 'next' | 'prev') => void;
    render: () => void;
    extinguish: () => void;
    next: () => void;
    prev: () => void;
    goTo: (pageIdx: number) => void;
    type: () => void;
    loadMsgs: () => Promise<void>;
    renderMsgs: (data: any[]) => void;
    send: () => Promise<void>;
    openModal: () => void;
    closeModal: () => void;
    showAlert: (msg: string) => void;
    closeAlert: () => void;
    confirmPurge: () => Promise<void>;
    openDbManager: () => void;
    closeDbManager: () => void;
    pingDatabase: () => Promise<void>;
    deleteRecord: (id: number) => Promise<void>;
    renderDbRecords: (data: any[]) => void;
    openTimeCapsule: () => void;
    closeTimeCapsule: () => void;
    updateTimeCapsuleCountdown: () => void;
    toggleCapsuleSimulation: () => void;
    toggleTutorial: () => void;
    showTutorial: (autoHide?: boolean) => void;
    hideTutorial: () => void;
}

declare global {
    interface Window {
        DossierSystem: DossierSystemType;
    }
}

// Implementation of window.DossierSystem
window.DossierSystem = {
    index: 0,
    currentSender: 'N',
    isTyping: false,
    candleBlown: false,
    direction: 'next',
    isCapsuleSimulatedUnlocked: false,
    isFlipping: false,
    capsuleInterval: null,
    tutorialTimeout: null,
    calendarMonth: 2, // Default: Maret 2026 (Momen awal chat 8 Maret)
    calendarYear: 2026,
    currentDateKey: '08-03',

    fadeIn(audioId: string, duration = 2000) {
        const audio = document.getElementById(audioId) as FadingAudioElement | null;
        if (!audio) return;
        if (audio.fadeInterval) clearInterval(audio.fadeInterval);
        
        audio.volume = 0;
        audio.play().catch(e => console.warn("Audio playback blocked:", e));
        
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

    fadeOut(audioId: string, duration = 1500) {
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

    openVideoModal() {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('dossier-video') as HTMLVideoElement | null;
        if (modal) {
            modal.style.display = 'flex';
        }
        if (video) {
            video.currentTime = 0;
            video.play().catch(e => {
                console.warn("Video autoplay with sound restricted by browser, user can click play:", e);
            });
        }
        this.startSparkles();
    },

    closeVideoModal() {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('dossier-video') as HTMLVideoElement | null;
        if (video) {
            video.pause();
        }
        if (modal) {
            modal.style.display = 'none';
        }
        this.stopSparkles();
    },

    playDossierVideo() {
        const video = document.getElementById('dossier-video') as HTMLVideoElement | null;
        if (video) {
            video.currentTime = 0;
            video.play().catch(e => console.warn("Video play triggered:", e));
        }
    },

    renderCalendar() {
        const cal = document.getElementById('calendar-grid');
        const monthLabel = document.getElementById('calendar-month-label');
        const activeTag = document.getElementById('calendar-active-tag');
        const snippetText = document.getElementById('scrapbook-snippet-text');
        const polaroidCaption = document.getElementById('polaroid-caption-text');

        if (monthLabel) {
            monthLabel.innerText = `${MONTH_NAMES[this.calendarMonth].toUpperCase()} ${this.calendarYear}`;
        }

        // Check milestones in this month
        const milestonesThisMonth = Object.values(MILESTONES).filter(m => m.month === this.calendarMonth);
        if (activeTag) {
            if (milestonesThisMonth.length > 0) {
                activeTag.innerText = `${milestonesThisMonth.length} Momen Spesial`;
                activeTag.className = 'text-[7px] px-1.5 py-0.2 bg-red-900 text-yellow-300 font-bold rounded font-mono uppercase border border-yellow-500/30';
            } else {
                activeTag.innerText = 'Logbook Aktif';
                activeTag.className = 'text-[7px] px-1.5 py-0.2 bg-black/40 text-gray-400 rounded font-mono uppercase';
            }
        }

        if (snippetText) {
            if (this.calendarMonth === 2) {
                snippetText.innerText = 'Maret 2026: Koordinat 08 Maret menandai obrolan pertama penuh cerita.';
            } else if (this.calendarMonth === 3) {
                snippetText.innerText = 'April 2026: Koordinat 24 April merayakan hari lahir sosok paling kusayang.';
            } else if (this.calendarMonth === 11) {
                snippetText.innerText = 'Desember 2026: Koordinat 13 Desember adalah hari kelahiranku (Naufal).';
            } else {
                snippetText.innerText = 'Koordinat penting: 08 Mar (Awal Chat), 24 Apr (Ultah Tersayang), 13 Des (Ultah Naufal).';
            }
        }

        if (polaroidCaption) {
            if (this.calendarMonth === 2) polaroidCaption.innerText = '08 Mar: Awal Chat';
            else if (this.calendarMonth === 3) polaroidCaption.innerText = '24 Apr: Ultah Tersayang';
            else if (this.calendarMonth === 11) polaroidCaption.innerText = '13 Des: Ultah Naufal';
            else polaroidCaption.innerText = 'Milestone 2026';
        }

        if (!cal) return;
        cal.innerHTML = '';

        // Day names header (MIN, SEN, SEL, RAB, KAM, JUM, SAB)
        const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
        days.forEach((d, idx) => {
            const div = document.createElement('div');
            div.className = `font-bold mb-1 text-[8px] ${idx === 0 ? 'text-red-700' : 'text-gray-600'} opacity-70`;
            div.innerText = d;
            cal.appendChild(div);
        });

        // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
        const firstDay = new Date(this.calendarYear, this.calendarMonth, 1).getDay();
        const totalDays = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();

        // Empty cells for offset
        for (let b = 0; b < firstDay; b++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'p-1 text-transparent select-none opacity-0';
            emptyCell.innerText = '-';
            cal.appendChild(emptyCell);
        }

        // Render each day of the month
        for (let d = 1; d <= totalDays; d++) {
            const div = document.createElement('div');
            const dayKey = `${String(d).padStart(2, '0')}-${String(this.calendarMonth + 1).padStart(2, '0')}`;
            const milestone = MILESTONES[dayKey] || (d === 30 ? MILESTONES['30-03'] : null);

            if (milestone) {
                div.className = 'p-1.5 date-highlight cursor-pointer relative group bg-red-800 text-white font-bold rounded-sm shadow-sm transition-transform hover:scale-110 active:scale-95 flex flex-col items-center justify-center';
                div.innerHTML = `
                    <span class="text-[9.5px] leading-tight flex items-center gap-0.5">${milestone.icon} ${d}</span>
                    <div class="absolute -bottom-3.5 left-1/2 transform -translate-x-1/2 text-[6px] text-yellow-300 font-bold animate-bounce whitespace-nowrap bg-black/90 px-1 py-0.2 rounded border border-yellow-500/60 z-30 shadow-md">
                        ${milestone.label.split(' ')[0]}
                    </div>
                `;
                div.onclick = (e) => {
                    e.stopPropagation();
                    this.openDateNoteModal(milestone.key);
                };
            } else {
                div.className = 'p-1.5 text-gray-700 hover:bg-black/10 hover:text-black cursor-pointer rounded-sm text-[9.5px] transition-colors relative';
                div.innerText = d.toString();
                div.title = `Ketuk untuk lihat catatan ${d} ${MONTH_NAMES[this.calendarMonth]}`;
                div.onclick = (e) => {
                    e.stopPropagation();
                    this.openDateNoteModal(dayKey);
                };
            }
            cal.appendChild(div);
        }

        // Highlight active chip buttons in ribbon
        const marChip = document.getElementById('chip-milestone-mar');
        const aprChip = document.getElementById('chip-milestone-apr');
        const desChip = document.getElementById('chip-milestone-des');
        if (marChip) marChip.className = `p-1.5 border rounded text-left shadow-xs transition-all flex flex-col group cursor-pointer active:scale-95 ${this.calendarMonth === 2 ? 'bg-amber-100 border-red-800 ring-2 ring-red-800' : 'bg-white/90 hover:bg-white border-red-900/30'}`;
        if (aprChip) aprChip.className = `p-1.5 border rounded text-left shadow-xs transition-all flex flex-col group cursor-pointer active:scale-95 ${this.calendarMonth === 3 ? 'bg-amber-100 border-red-800 ring-2 ring-red-800' : 'bg-white/90 hover:bg-white border-red-900/30'}`;
        if (desChip) desChip.className = `p-1.5 border rounded text-left shadow-xs transition-all flex flex-col group cursor-pointer active:scale-95 ${this.calendarMonth === 11 ? 'bg-amber-100 border-red-800 ring-2 ring-red-800' : 'bg-white/90 hover:bg-white border-red-900/30'}`;
    },

    changeCalendarMonth(delta: number) {
        this.calendarMonth += delta;
        if (this.calendarMonth < 0) {
            this.calendarMonth = 11;
            this.calendarYear -= 1;
        } else if (this.calendarMonth > 11) {
            this.calendarMonth = 0;
            this.calendarYear += 1;
        }
        this.renderCalendar();
    },

    selectMilestone(key: string) {
        const milestone = MILESTONES[key];
        if (milestone) {
            this.calendarMonth = milestone.month;
            this.calendarYear = 2026;
            this.renderCalendar();
            this.openDateNoteModal(key);
        }
    },

    jumpToMilestone(key: string) {
        this.selectMilestone(key);
    },

    openCurrentMilestoneModal() {
        const activeMilestones = Object.values(MILESTONES).filter(m => m.month === this.calendarMonth);
        if (activeMilestones.length > 0) {
            this.openDateNoteModal(activeMilestones[0].key);
        } else {
            this.openDateNoteModal('08-03');
        }
    },

    openDateNoteModal(key?: string) {
        const modal = document.getElementById('date-note-modal');
        if (!key) {
            key = this.currentDateKey || '08-03';
        }
        this.currentDateKey = key;

        const milestone = MILESTONES[key];
        const titleEl = document.getElementById('date-note-title');
        const refEl = document.getElementById('date-note-ref');
        const badgeEl = document.getElementById('date-note-badge');
        const bodyEl = document.getElementById('date-note-body');
        const footerRefEl = document.getElementById('date-note-footer-ref');
        const memoInput = document.getElementById('date-custom-memo') as HTMLTextAreaElement | null;
        const saveStatus = document.getElementById('memo-save-status');

        if (saveStatus) saveStatus.innerText = '';

        if (milestone) {
            if (titleEl) titleEl.innerText = milestone.title;
            if (refEl) refEl.innerText = milestone.subtitle;
            if (badgeEl) badgeEl.innerText = milestone.badge;
            if (footerRefEl) footerRefEl.innerText = `REF: ${milestone.ref}`;
            if (bodyEl) {
                bodyEl.innerHTML = `
                    ${milestone.body.map(p => `<p>${p}</p>`).join('')}
                    <div class="mt-3 pt-2 border-t border-amber-900/30 text-center font-serif italic text-red-950 font-bold text-[11px] bg-amber-100/60 p-2 rounded">
                        ${milestone.quote}
                    </div>
                `;
            }
        } else {
            // General Date Note
            const parts = key.split('-');
            const d = parseInt(parts[0], 10) || 1;
            const m = (parseInt(parts[1], 10) || 1) - 1;
            const mName = MONTH_NAMES[m] || 'Bulan';
            if (titleEl) titleEl.innerText = `Catatan Kalender: ${d} ${mName} 2026`;
            if (refEl) refEl.innerText = `LOGBOOK HARIAN // ${d} ${mName.toUpperCase()} 2026`;
            if (badgeEl) badgeEl.innerText = 'LOGBOOK HARIAN // CATATAN PRIBADI';
            if (footerRefEl) footerRefEl.innerText = `REF: 2026-JM-${key}`;
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <p><b>Koordinat: ${d} ${mName} 2026.</b></p>
                    <p>Setiap lembaran hari yang kita lewati bersama memiliki tempat berharga dalam linimasa perjalanan ini. Hari-hari yang tampak tenang kerap menyimpan kenangan manis dan senyuman yang tak ternilai.</p>
                    <p class="italic text-gray-700">"Tuliskan catatan atau doa untuk hari ini pada kolom di bawah. Catatan akan tersimpan otomatis di perangkat Anda."</p>
                `;
            }
        }

        // Load saved memo from localStorage
        if (memoInput) {
            const saved = localStorage.getItem(`milestone_memo_${key}`);
            memoInput.value = saved || '';
        }

        if (modal) modal.style.display = 'flex';
        this.fadeIn('applause-sfx', 400);
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#8b0000', '#d4af37', '#ffffff']
        });
    },

    saveCurrentDateMemo() {
        const memoInput = document.getElementById('date-custom-memo') as HTMLTextAreaElement | null;
        const saveStatus = document.getElementById('memo-save-status');
        if (memoInput && this.currentDateKey) {
            const val = memoInput.value.trim();
            if (val) {
                localStorage.setItem(`milestone_memo_${this.currentDateKey}`, val);
            } else {
                localStorage.removeItem(`milestone_memo_${this.currentDateKey}`);
            }
            if (saveStatus) {
                saveStatus.innerText = '✓ Catatan Berhasil Tersimpan!';
                setTimeout(() => {
                    if (saveStatus) saveStatus.innerText = '';
                }, 3000);
            }
        }
    },

    closeDateNoteModal() {
        const modal = document.getElementById('date-note-modal');
        if (modal) modal.style.display = 'none';
    },

    getNextMilestoneData() {
        const now = new Date();
        const currentYear = now.getFullYear();

        const candidates = [
            {
                key: '08-03',
                title: '8 Maret — Awal Chat Kita',
                desc: 'Momen pertama percakapan obrolan kita dimulai dan membuka kisah manis.',
                month: 2,
                day: 8
            },
            {
                key: '24-04',
                title: '24 April — Ulang Tahun Jeva Muafida',
                desc: 'Hari lahir sosok paling istimewa dan paling kusayangi di seluruh dunia.',
                month: 3,
                day: 24
            },
            {
                key: '13-12',
                title: '13 Desember — Ulang Tahun Naufal (Aku)',
                desc: 'Hari kelahiranku, bersyukur melangkah bersama orang paling kucintai.',
                month: 11,
                day: 13
            },
            {
                key: '31-12',
                title: '31 Desember — Pergantian Menuju Tahun Baru',
                desc: 'Kapsul waktu akan terbuka menyambut lembaran babak baru bersama.',
                month: 11,
                day: 31
            }
        ];

        let closestCandidate: any = null;
        let minDiff = Infinity;

        for (const c of candidates) {
            let target = new Date(currentYear, c.month, c.day, 23, 59, 59).getTime();
            let diff = target - now.getTime();
            if (diff <= 0) {
                target = new Date(currentYear + 1, c.month, c.day, 23, 59, 59).getTime();
                diff = target - now.getTime();
            }
            if (diff > 0 && diff < minDiff) {
                minDiff = diff;
                closestCandidate = { ...c, diff, target };
            }
        }

        return closestCandidate;
    },

    jumpToNextMilestone() {
        this.closeTimeCapsule();
        this.goTo(3); // Go to Page 4 (Logbook Kalender)
        const nextMilestone = this.getNextMilestoneData();
        if (nextMilestone) {
            setTimeout(() => {
                this.selectMilestone(nextMilestone.key);
            }, 350);
        }
    },

    stopSparkles() {
        const existing = document.querySelectorAll('.sparkle');
        existing.forEach(s => s.remove());
    },

    startSparkles() {
        this.stopSparkles();
        const container = document.body;
        for (let i = 0; i < 18; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 80 + 10}%`;
            sparkle.style.animationDelay = `${Math.random() * 2}s`;
            sparkle.style.animationDuration = `${Math.random() * 2 + 2.5}s`;
            container.appendChild(sparkle);
        }
    },

    generateTarotCards() {
        const cards = [
            { id: 'tarot-lovers', seed: 'lovers' },
            { id: 'tarot-star', seed: 'star' }
        ];

        for (const card of cards) {
            const el = document.getElementById(card.id) as HTMLImageElement | null;
            if (el) {
                el.src = `https://picsum.photos/seed/${card.seed}/300/400`;
            }
        }
    },

    init() {
        // Global Image Fallback for expired external assets
        window.addEventListener('error', (event) => {
            const target = event.target as HTMLElement | null;
            if (target && target.tagName === 'IMG') {
                const img = target as HTMLImageElement;
                if (!img.dataset.fallbackApplied) {
                    img.dataset.fallbackApplied = 'true';
                    const alt = (img.alt || '').toLowerCase();
                    if (alt.includes('kyoto')) {
                        img.src = 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80';
                    } else if (alt.includes('paris')) {
                        img.src = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80';
                    } else if (alt.includes('new york')) {
                        img.src = 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=600&q=80';
                    } else if (alt.includes('milestone')) {
                        img.src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80';
                    } else {
                        img.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
                    }
                }
            }
        }, true);

        this.generateTarotCards();

        // Render Interactive Multi-Moment Calendar
        this.renderCalendar();

        // Initialize 3D Book Gesture Pull & Drag System
        this.initBookGestures();

        if (supabaseClient && IS_REMOTE_SYNC_ACTIVE) {
            try {
                supabaseClient.channel('messages_channel')
                    .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, () => { void this.loadMsgs(); })
                    .subscribe();
            } catch {
                // Safely ignored
            }
        }

        this.render();

        const msgField = document.getElementById('msg-field');
        if (msgField) {
            msgField.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.send(); });
        }

        // Tape Interactivity Easter Egg
        document.querySelectorAll('.tape-strip, .washi-tape').forEach(tape => {
            tape.addEventListener('click', (e) => {
                const mouseEvent = e as MouseEvent;
                const msgs = ["Jeva Muafida ✨", "Kilas Balik 2026", "Menyongsong Tahun Baru", "Memori Terbaik", "Top Secret Dossier"];
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
    },

    initBookGestures() {
        const viewport = document.getElementById('module-viewport');
        if (!viewport) return;

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isDragging = false;
        let startTime = 0;
        let activeModule: HTMLElement | null = null;

        const onPointerDown = (e: MouseEvent | TouchEvent) => {
            if ('touches' in e && e.touches.length > 1) return;

            const target = e.target as HTMLElement | null;
            if (!target) return;

            // Don't hijack if user is interacting with form inputs, buttons, media or modal elements
            const tag = target.tagName;
            if (['INPUT', 'TEXTAREA', 'BUTTON', 'A', 'VIDEO', 'AUDIO'].includes(tag) && !target.closest('.corner-peel')) {
                return;
            }
            if (target.closest('button, input, textarea, a, video, .flame, .date-highlight, #date-note-modal, #capsule-modal, #video-modal, #db-manager-modal, #delete-modal, #alert-modal')) {
                return;
            }

            const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
            startX = point.clientX;
            startY = point.clientY;
            currentX = startX;
            startTime = Date.now();
            isDragging = true;

            activeModule = document.querySelector<HTMLElement>('.page-module.active');
        };

        const onPointerMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging || !activeModule || this.isFlipping) return;

            const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
            currentX = point.clientX;
            const deltaX = currentX - startX;
            const deltaY = point.clientY - startY;

            // Vertical scrolling intent check
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaX) < 18) {
                return;
            }

            if (Math.abs(deltaX) > 18 && e.cancelable) {
                e.preventDefault();
            }

            // Turning forward (right to left): 3D page curl along left spine
            if (deltaX < 0 && this.index < 6) {
                const nextMod = document.getElementById(`mod-${this.index + 1}`);
                if (nextMod) {
                    nextMod.classList.add('page-underneath');
                }
                const progress = Math.min(Math.abs(deltaX) / 240, 1);
                const rotateDeg = -progress * 65;
                activeModule.style.transformOrigin = 'left center';
                activeModule.style.transform = `perspective(1800px) rotateY(${rotateDeg}deg) translateZ(${progress * 10}px)`;
                activeModule.style.boxShadow = `${-progress * 25}px 0 ${progress * 35}px rgba(0,0,0,${progress * 0.4})`;
                activeModule.style.transition = 'none';
            }
            // Turning backward (left to right): 3D page curl along right edge
            else if (deltaX > 0 && this.index > 0) {
                const prevMod = document.getElementById(`mod-${this.index - 1}`);
                if (prevMod) {
                    prevMod.classList.add('page-flipping-in-prev');
                    const progress = Math.min(deltaX / 240, 1);
                    const rotateDeg = -88 + (progress * 88);
                    prevMod.style.transformOrigin = 'left center';
                    prevMod.style.transform = `perspective(1800px) rotateY(${rotateDeg}deg) translateZ(${(1 - progress) * 10}px)`;
                    prevMod.style.boxShadow = `${-(1 - progress) * 25}px 0 ${(1 - progress) * 35}px rgba(0,0,0,${(1 - progress) * 0.4})`;
                    prevMod.style.transition = 'none';
                }
            }
        };

        const onPointerUp = () => {
            if (!isDragging) return;
            isDragging = false;

            const deltaX = currentX - startX;
            const elapsed = Math.max(Date.now() - startTime, 1);
            const velocity = Math.abs(deltaX) / elapsed;

            const nextMod = document.getElementById(`mod-${this.index + 1}`);
            const prevMod = document.getElementById(`mod-${this.index - 1}`);

            // If user swiped or pulled past 40px or with swipe flick speed:
            if (deltaX < -40 || (deltaX < -18 && velocity > 0.32)) {
                if (activeModule) {
                    activeModule.style.transform = '';
                    activeModule.style.boxShadow = '';
                    activeModule.style.transition = '';
                }
                if (this.index < 6) this.next();
            } else if (deltaX > 40 || (deltaX > 18 && velocity > 0.32)) {
                if (prevMod) {
                    prevMod.style.transform = '';
                    prevMod.style.boxShadow = '';
                    prevMod.style.transition = '';
                }
                if (this.index > 0) this.prev();
            } else {
                if (activeModule) {
                    activeModule.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.25s ease';
                    activeModule.style.transform = '';
                    activeModule.style.boxShadow = '';
                }
                if (nextMod) {
                    nextMod.classList.remove('page-underneath');
                }
                if (prevMod) {
                    prevMod.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.25s ease';
                    prevMod.style.transform = '';
                    prevMod.style.boxShadow = '';
                    setTimeout(() => prevMod?.classList.remove('page-flipping-in-prev'), 250);
                }
            }
        };

        // Viewport Listeners
        viewport.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        viewport.addEventListener('touchstart', onPointerDown, { passive: false });
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend', onPointerUp);
        window.addEventListener('touchcancel', onPointerUp);

        // Corner Peels Listeners
        const peelR = document.getElementById('corner-peel-r');
        const peelL = document.getElementById('corner-peel-l');
        if (peelR) {
            peelR.addEventListener('touchstart', onPointerDown, { passive: false });
            peelR.addEventListener('mousedown', onPointerDown);
        }
        if (peelL) {
            peelL.addEventListener('touchstart', onPointerDown, { passive: false });
            peelL.addEventListener('mousedown', onPointerDown);
        }
    },

    showPin() {
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
        }, 2200);
    },

    unlock() {
        const authModule = document.getElementById('auth-module');
        if (!authModule) return;
        authModule.style.opacity = '0';
        setTimeout(() => { 
            authModule.style.display = 'none'; 
            this.showTutorial(true);
        }, 800);
    },

    setSender(name: string) {
        this.currentSender = name;
        const btnN = document.getElementById('btn-n');
        const btnJeva = document.getElementById('btn-jeva');
        if (btnN) btnN.classList.toggle('active', name === 'N');
        if (btnJeva) btnJeva.classList.toggle('active', name === 'Jeva');
    },

    render() {
        // Audio Management
        if (this.index !== 4) this.fadeOut('birthday-song', 1200);
        if (this.index !== 3) this.fadeOut('applause-sfx', 500);

        // Reset inline transforms and transition classes on modules
        document.querySelectorAll<HTMLElement>('.page-module').forEach((m, i) => {
            m.style.transform = '';
            m.style.boxShadow = '';
            m.style.transition = '';
            m.classList.remove('turn-next', 'turn-prev', 'page-flipping-out-next', 'page-flipping-in-prev', 'page-underneath');
            if (i === this.index) {
                m.classList.add('active');
            } else {
                m.classList.remove('active');
            }
        });

        // Update page indicators
        const pageNum = document.getElementById('page-num');
        const pageNumTop = document.getElementById('page-num-top');
        if (pageNum) pageNum.innerText = `${this.index + 1} / 7`;
        if (pageNumTop) pageNumTop.innerText = `${this.index + 1} / 7`;

        // Update active page chip in tutorial guide
        document.querySelectorAll('.page-chip').forEach((chip, idx) => {
            if (idx === this.index) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });
        
        // Accurate Tutorial Instructions for each page
        const tutorialGuides = [
            {
                title: "HALAMAN 1: THE LEDGER (KOVER KILAS BALIK)",
                text: "Ini adalah kover dossier kilas balik perjalanan satu tahun penuh <strong>Jeva Muafida</strong>.<br><br>👉 <strong>MEMBUKA BUKU:</strong> Tarik sudut kanan bawah layar atau geser layar ke kiri seperti membuka lembaran buku sungguhan!<br><br>👉 <strong>KAPSUL WAKTU:</strong> Tekan ikon jam pasir [⏳] di sudut kanan atas untuk membuka hitung mundur WIB real-time."
            },
            {
                title: "HALAMAN 2: EVIDENCE (LINIMASA ARSIP)",
                text: "Dossier rekapitulasi babak-babak penting sepanjang tahun ini.<br><br>👉 <strong>INTERAKSI:</strong> Ketuk tombol <strong>'Tap to Decrypt Signal'</strong> di tengah berkas untuk membuka arsip rekaman visual pendek.<br><br>👉 <strong>NAVIGASI BUKU:</strong> Tarik sudut layar [❮ Balik] atau [Tarik ❯] untuk membalik lembaran."
            },
            {
                title: "HALAMAN 3: DIGITAL CLIPPING (KLIPING MEMORI)",
                text: "Koleksi foto polaroid kenangan manis dan cuplikan reels perjalanan tahun ini.<br><br>👉 <strong>INTERAKSI:</strong> Ketuk banner Instagram Reel untuk melihat cuplikan media, atau amati 3 foto polaroid terbaru Jeva.<br><br>👉 <strong>NAVIGASI BUKU:</strong> Tarik lembar buku ke kiri untuk menuju Kalender Momen."
            },
            {
                title: "HALAMAN 4: LOGBOOK OPERASIONAL // MULTI-MOMEN SPESIAL",
                text: "Logbook monumental linimasa perjalanan 2026.<br><br>👉 <strong class='text-yellow-300 underline uppercase'>TIGA KOORDINAT UTAMA:</strong><br>• <strong>🌸 08 MAR:</strong> Awal Chat Kita<br>• <strong>🎂 24 APR:</strong> Ulang Tahun Orang Paling Kusayang (Jeva Muafida)<br>• <strong>🎁 13 DES:</strong> Ulang Tahun Naufal (Aku)<br><br>👉 <strong>INTERAKSI:</strong> Ketuk tombol pin koordinat di atas kalender atau navigasikan bulan [◀ / ▶] untuk membuka lembar memori rahasia dan menyimpan catatan kenanganmu!"
            },
            {
                title: "HALAMAN 5: LENTERA REFLEKSI & SURAT TAHUN BARU",
                text: "Ruang kontemplasi dan doa akhir tahun menyongsong babak baru.<br><br>👉 <strong>PETUNJUK INTERAKSI:</strong> <strong>KETUK NYALA LILIN / LENTERA</strong> di layar untuk memulai mesin tik mengetik surat refleksi tahunan secara otomatis.<br><br>👉 <strong>NAVIGASI BUKU:</strong> Tarik sudut lembar buku ke kiri untuk lanjut ke Halaman 6."
            },
            {
                title: "HALAMAN 6: CARTE POSTALE (KARTU POS & VIDEO)",
                text: "Kartu pos kenangan manis perjalanan satu tahun penuh.<br><br>👉 <strong class='text-yellow-300 underline uppercase'>PETUNJUK INTERAKSI UTAMA:</strong> <strong>KETUK FOTO JEVA</strong> di sebelah kiri kartu pos untuk memutar video montase kenangan (Hindia - Everything U Are)!<br><br>👉 <strong>NAVIGASI BUKU:</strong> Tarik lembar buku ke kiri untuk menuju Terminal Transmisi."
            },
            {
                title: "HALAMAN 7: TERMINAL TRANSMISI (PESAN REFLEKSI)",
                text: "Kirimkan doa akhir tahun dan harapan tahun baru ke terminal transmisi aman.<br><br>👉 <strong>INTERAKSI:</strong> Pilih identitas pengirim (OPR_N atau JEVA), ketik pesan pada kolom teks, lalu tekan tombol <strong>'KIRIM'</strong>."
            }
        ];

        const guideTitle = document.getElementById('guide-title');
        const tutText = document.getElementById('tutorial-text');
        const currentGuide = tutorialGuides[this.index] || tutorialGuides[0];
        
        if (guideTitle) guideTitle.innerHTML = currentGuide.title;
        if (tutText) tutText.innerHTML = currentGuide.text;

        // Manage navigation arrows and corner peel visibility
        const arrowL = document.getElementById('arrow-l');
        const arrowR = document.getElementById('arrow-r');
        if (arrowL) arrowL.style.display = this.index > 0 ? 'inline-block' : 'none';
        if (arrowR) arrowR.style.display = this.index < 6 ? 'inline-block' : 'none';

        const navL = document.getElementById('nav-l');
        const navR = document.getElementById('nav-r');
        if (navL) navL.style.display = this.index > 0 ? 'flex' : 'none';
        if (navR) navR.style.display = this.index < 6 ? 'flex' : 'none';

        const peelL = document.getElementById('corner-peel-l');
        const peelR = document.getElementById('corner-peel-r');
        if (peelL) peelL.style.display = this.index > 0 ? 'block' : 'none';
        if (peelR) peelR.style.display = this.index < 6 ? 'block' : 'none';

        const backBtn = document.getElementById('back-nav-btn');
        if (backBtn) backBtn.style.display = this.index > 0 ? 'inline-block' : 'none';

        const nextBtn = document.getElementById('next-nav-btn');
        if (nextBtn) nextBtn.style.display = this.index < 6 ? 'inline-block' : 'none';

        if (this.index === 6) {
            this.loadMsgs();
        }

        if (this.index === 4 && !this.candleBlown) {
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
        this.fadeIn('birthday-song', 2000);
        
        setTimeout(() => {
            const candleStage = document.getElementById('candle-stage');
            if (candleStage) candleStage.style.opacity = '0';
            
            const bdayText = document.getElementById('bday-text');
            if (bdayText) bdayText.style.opacity = '1';

            // Confetti celebration
            const duration = 2.5 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 5,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#8b0000', '#ffffff', '#ffd700']
                });
                confetti({
                    particleCount: 5,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#8b0000', '#ffffff', '#ffd700']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

            setTimeout(() => {
                if (candleStage) candleStage.style.display = 'none';
                this.candleBlown = true;
                this.type();
            }, 800);
            if (flash) flash.classList.remove('flash-active');
        }, 400); 
    },

    turnPage(targetIdx: number, dir: 'next' | 'prev') {
        if (targetIdx === this.index || targetIdx < 0 || targetIdx > 6) return;
        if (this.isFlipping) return;

        const currentIdx = this.index;
        const currentMod = document.getElementById(`mod-${currentIdx}`);
        const nextMod = document.getElementById(`mod-${targetIdx}`);

        if (!currentMod || !nextMod) {
            this.index = targetIdx;
            this.direction = dir;
            this.render();
            return;
        }

        this.isFlipping = true;
        this.direction = dir;

        // Reset inline transforms first
        currentMod.style.transform = '';
        currentMod.style.boxShadow = '';
        currentMod.style.transition = '';
        nextMod.style.transform = '';
        nextMod.style.boxShadow = '';
        nextMod.style.transition = '';

        if (dir === 'next') {
            // Next page revealed underneath
            nextMod.classList.remove('active', 'page-flipping-out-next', 'page-flipping-in-prev');
            nextMod.classList.add('page-underneath');

            // Current page physically folds away across spine to the left
            currentMod.classList.remove('page-underneath', 'page-flipping-in-prev');
            currentMod.classList.add('page-flipping-out-next');

            setTimeout(() => {
                currentMod.classList.remove('active', 'page-flipping-out-next', 'page-underneath');
                currentMod.style.display = 'none';

                nextMod.classList.remove('page-underneath', 'page-flipping-out-next');
                nextMod.classList.add('active');

                this.index = targetIdx;
                this.isFlipping = false;
                this.render();
            }, 500);
        } else {
            // Current page stays underneath
            currentMod.classList.remove('active', 'page-flipping-out-next', 'page-flipping-in-prev');
            currentMod.classList.add('page-underneath');

            // Next page unfolds into view from the left spine over current page
            nextMod.classList.remove('page-underneath', 'page-flipping-out-next');
            nextMod.classList.add('page-flipping-in-prev');

            setTimeout(() => {
                currentMod.classList.remove('active', 'page-underneath');
                currentMod.style.display = 'none';

                nextMod.classList.remove('page-flipping-in-prev', 'page-underneath');
                nextMod.classList.add('active');

                this.index = targetIdx;
                this.isFlipping = false;
                this.render();
            }, 500);
        }
    },

    next() {
        if (this.index < 6 && !this.isFlipping) {
            this.turnPage(this.index + 1, 'next');
        }
    },

    prev() {
        if (this.index > 0 && !this.isFlipping) {
            this.turnPage(this.index - 1, 'prev');
        }
    },

    goTo(pageIdx: number) {
        if (pageIdx !== this.index && pageIdx >= 0 && pageIdx <= 6 && !this.isFlipping) {
            this.turnPage(pageIdx, pageIdx > this.index ? 'next' : 'prev');
        }
    },

    type() {
        if (this.isTyping) return;
        this.isTyping = true;
        const out = document.getElementById('typewriter-output');
        const seal = document.getElementById('wax-seal-area');
        const pageMod = document.getElementById('mod-4');
        
        const txt = "Kepada Jeva Muafida,\n\nSatu tahun penuh telah kita lalui bersama. Ada begitu banyak cerita, tawa yang tak terhitung, perjuangan yang kita bagi, dan impian-impian kecil yang satu per satu mulai menemukan jalannya.\n\nMelihat kembali perjalananmu sepanjang tahun ini, aku begitu bangga melihat bagaimana kamu terus tumbuh menjadi pribadi yang tegar, hangat, dan selalu memancarkan kebaikan bagi orang-orang di sekitarmu.\n\nMenjelang babak baru yang ada di depan mata, aku ingin kamu tahu bahwa kamu adalah bagian terindah dalam hidupku. Terima kasih telah menjadi sosok yang luar biasa sepanjang tahun ini.\n\nMari kita langkahkan kaki menyongsong tahun baru dengan senyum yang lebih lebar dan kebahagiaan yang kian melimpah.\n\nSelamanya milikmu,\nN.";

        if (out) out.textContent = ""; 
        let i = 0;
        if (seal) seal.classList.remove('seal-active');

        const intrvl = setInterval(() => {
            if (out) out.textContent += txt[i]; 
            i++;
            if (i >= txt.length) { 
                clearInterval(intrvl); 
                this.isTyping = false;
                if (out) out.classList.add('typing-done');
                setTimeout(() => { 
                    if (pageMod) pageMod.classList.add('victorian-bg'); 
                    if (seal) seal.classList.add('seal-active'); 
                }, 400);
            }
        }, 30);
    },

    async loadMsgs() {
        // Load immediately from local storage for fast & 100% reliable rendering
        const localData = getStoredMessages();
        this.renderMsgs(localData);

        // Optional background sync if remote endpoint is active
        if (supabaseClient && IS_REMOTE_SYNC_ACTIVE) {
            try {
                const fetchPromise = supabaseClient.from(TABLE_NAME).select('*').order('created_at', { ascending: true });
                const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 2500)
                );
                const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
                if (!error && Array.isArray(data) && data.length > 0) {
                    saveStoredMessages(data);
                    this.renderMsgs(data);
                }
            } catch {
                // Silently keep local storage data, no console error
            }
        }
    },

    renderMsgs(data: TransmissionMessage[]) {
        const box = document.getElementById('msg-display');
        if (!box) return;
        box.innerHTML = (data && data.length > 0) ? data.map(m => `
            <div class="message-bubble ${(m.sender === 'N' || m.sender === 'OPR_N') ? 'msg-n' : 'msg-jeva'}">
                <span class="block text-[6px] font-bold opacity-60 mb-0.5 uppercase">${m.sender}</span>
                <div class="leading-relaxed">${m.content}</div>
            </div>
        `).join('') : '<p class="text-center opacity-30 py-8 italic text-[9px] font-mono">Belum ada catatan transmisi. Tuliskan pesan pertama.</p>';
        box.scrollTop = box.scrollHeight;
    },

    async send() {
        const f = document.getElementById('msg-field') as HTMLInputElement | null;
        if (!f || !f.value.trim()) return;
        const content = f.value.trim();
        f.value = '';
        
        const newMsg: TransmissionMessage = {
            id: Date.now(),
            sender: this.currentSender || 'OPR_N',
            content: content,
            created_at: new Date().toISOString()
        };

        const currentMsgs = getStoredMessages();
        currentMsgs.push(newMsg);
        saveStoredMessages(currentMsgs);
        this.renderMsgs(currentMsgs);
        
        const sealElement = document.getElementById('wax-seal-element');
        if (sealElement) {
            sealElement.classList.remove('stamp-active');
            void sealElement.offsetWidth;
            sealElement.classList.add('stamp-active');
        }

        // Background remote sync if enabled
        if (supabaseClient && IS_REMOTE_SYNC_ACTIVE) {
            try {
                await supabaseClient.from(TABLE_NAME).insert([{
                    id: newMsg.id,
                    content: newMsg.content,
                    sender: newMsg.sender,
                    created_at: newMsg.created_at
                }]);
            } catch {
                // Kept safely in local store
            }
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

    showAlert(msg: string) {
        const modal = document.getElementById('alert-modal');
        const msgEl = document.getElementById('alert-message');
        if (msgEl) msgEl.textContent = msg;
        if (modal) modal.style.display = 'flex';
    },

    closeAlert() {
        const modal = document.getElementById('alert-modal');
        if (modal) modal.style.display = 'none';
    },

    async confirmPurge() {
        saveStoredMessages([]);
        this.renderMsgs([]);
        this.closeModal();
        this.openDbManager();

        if (supabaseClient && IS_REMOTE_SYNC_ACTIVE) {
            try {
                await supabaseClient.from(TABLE_NAME).delete().neq('id', -1);
            } catch {
                // Purged locally
            }
        }
    },

    async openDbManager() {
        const modal = document.getElementById('db-manager-modal');
        if (modal) modal.style.display = 'flex';

        const localData = getStoredMessages().slice().reverse();
        this.renderDbRecords(localData);

        const statusEl = document.getElementById('db-status');
        if (statusEl) {
            statusEl.textContent = IS_REMOTE_SYNC_ACTIVE ? "Connected (Cloud Sync)" : "Connected (Penyimpanan Lokal Aktif & Aman)";
        }

        if (supabaseClient && IS_REMOTE_SYNC_ACTIVE) {
            try {
                const { data, error } = await supabaseClient.from(TABLE_NAME).select('*').order('created_at', { ascending: false });
                if (!error && Array.isArray(data)) {
                    this.renderDbRecords(data);
                }
            } catch {
                // Fallback preserved
            }
        }
    },

    closeDbManager() {
        const modal = document.getElementById('db-manager-modal');
        if (modal) modal.style.display = 'none';
    },

    async pingDatabase() {
        const statusEl = document.getElementById('db-status');
        if (statusEl) statusEl.textContent = "Pinging...";

        if (supabaseClient && IS_REMOTE_SYNC_ACTIVE) {
            try {
                const checkPromise = supabaseClient.from(TABLE_NAME).select('id').limit(1);
                const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
                    setTimeout(() => reject(new Error('timeout')), 2000)
                );
                await Promise.race([checkPromise, timeoutPromise]);
                if (statusEl) statusEl.textContent = "Connected (Cloud OK)";
                setTimeout(() => {
                    if (statusEl) statusEl.textContent = "Connected";
                }, 2000);
                return;
            } catch {
                // fallback below
            }
        }

        setTimeout(() => {
            if (statusEl) statusEl.textContent = "Connected (Penyimpanan Lokal Siaga)";
        }, 300);
    },

    async deleteRecord(id: number) {
        const currentMsgs = getStoredMessages().filter(m => m.id !== id);
        saveStoredMessages(currentMsgs);
        this.renderMsgs(currentMsgs);
        this.renderDbRecords(currentMsgs.slice().reverse());

        if (supabaseClient && IS_REMOTE_SYNC_ACTIVE) {
            try {
                await supabaseClient.from(TABLE_NAME).delete().eq('id', id);
            } catch {
                // Kept in local state
            }
        }
    },

    renderDbRecords(data: any[]) {
        const tbody = document.getElementById('db-records-table');
        const totalEl = document.getElementById('db-total-records');
        if (totalEl) totalEl.textContent = data.length.toString();
        
        if (!tbody) return;
        tbody.innerHTML = data.length > 0 ? data.map(m => `
            <tr class="border-b border-green-900/30 hover:bg-green-900/10">
                <td class="p-1">${m.id}</td>
                <td class="p-1">${m.sender}</td>
                <td class="p-1 truncate max-w-[150px]">${m.content}</td>
                <td class="p-1 text-right">
                    <button onclick="DossierSystem.deleteRecord(${m.id})" class="text-red-400 hover:text-red-300 uppercase text-[8px] border border-red-900/50 px-1 rounded">Del</button>
                </td>
            </tr>
        `).join('') : '<tr><td colspan="4" class="text-center p-3 opacity-50">Belum ada transmisi tersimpan.</td></tr>';
    },

    openTimeCapsule() {
        const modal = document.getElementById('time-capsule-modal');
        if (modal) modal.style.display = 'flex';
        this.updateTimeCapsuleCountdown();
    },

    closeTimeCapsule() {
        const modal = document.getElementById('time-capsule-modal');
        if (modal) modal.style.display = 'none';
        if (this.capsuleInterval) {
            clearTimeout(this.capsuleInterval);
            this.capsuleInterval = null;
        }
    },

    toggleCapsuleSimulation() {
        this.isCapsuleSimulatedUnlocked = !this.isCapsuleSimulatedUnlocked;
        if (this.isCapsuleSimulatedUnlocked) {
            confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#f59e0b', '#ef4444', '#ffffff']
            });
        }
        this.updateTimeCapsuleCountdown();
    },

    updateTimeCapsuleCountdown() {
        // Target: 31 Desember 2026, 23:59:59 WIB (Asia/Jakarta, UTC+7)
        // ISO string with +07:00 timezone gives exact universal epoch ms
        const targetDate = new Date('2026-12-31T23:59:59+07:00').getTime();
        const nowObj = new Date();
        const now = nowObj.getTime();
        const distance = targetDate - now;

        const lockedDiv = document.getElementById('capsule-locked');
        const unlockedDiv = document.getElementById('capsule-unlocked');
        const daysEl = document.getElementById('countdown-days');
        const hoursEl = document.getElementById('countdown-hours');
        const minutesEl = document.getElementById('countdown-minutes');
        const secondsEl = document.getElementById('countdown-seconds');
        const currentTimeDisplay = document.getElementById('current-wib-time');

        // Formatted Real-time WIB display
        if (currentTimeDisplay) {
            const wibDate = nowObj.toLocaleDateString('id-ID', {
                timeZone: 'Asia/Jakarta',
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            const wibTime = nowObj.toLocaleTimeString('id-ID', {
                timeZone: 'Asia/Jakarta',
                hour12: false
            });
            currentTimeDisplay.innerText = `WAKTU REAL-TIME (WIB): ${wibDate}, ${wibTime} WIB`;
        }

        // Calculate and update Radar Momen Terdekat (Next Milestone Radar)
        const nextMilestone = this.getNextMilestoneData();
        const nextTitleEl = document.getElementById('next-milestone-title');
        const nextDescEl = document.getElementById('next-milestone-desc');
        const nextBadgeEl = document.getElementById('next-milestone-badge');

        if (nextMilestone) {
            if (nextTitleEl) nextTitleEl.innerText = nextMilestone.title;
            if (nextDescEl) nextDescEl.innerText = nextMilestone.desc;
            if (nextBadgeEl) {
                const totalSec = Math.max(0, Math.floor(nextMilestone.diff / 1000));
                const d = Math.floor(totalSec / 86400);
                const h = Math.floor((totalSec % 86400) / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                if (d > 0) {
                    nextBadgeEl.innerText = `${d} HARI ${h} JAM LAGI`;
                } else {
                    nextBadgeEl.innerText = `${h} JAM ${m} MENIT LAGI`;
                }
            }
        }

        if (this.isCapsuleSimulatedUnlocked || distance <= 0) {
            if (lockedDiv) lockedDiv.classList.add('hidden');
            if (unlockedDiv) unlockedDiv.classList.remove('hidden');
        } else {
            if (lockedDiv) lockedDiv.classList.remove('hidden');
            if (unlockedDiv) unlockedDiv.classList.add('hidden');

            const totalSeconds = Math.max(0, Math.floor(distance / 1000));
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            if (daysEl) daysEl.innerText = days.toString();
            if (hoursEl) hoursEl.innerText = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.innerText = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.innerText = seconds.toString().padStart(2, '0');

            const modal = document.getElementById('time-capsule-modal');
            if (modal && modal.style.display === 'flex') {
                if (this.capsuleInterval) clearTimeout(this.capsuleInterval);
                this.capsuleInterval = window.setTimeout(() => this.updateTimeCapsuleCountdown(), 1000);
            }
        }
    },

    toggleTutorial() {
        const tutBanner = document.getElementById('tutorial-banner');
        if (!tutBanner) return;
        if (tutBanner.style.display === 'none' || tutBanner.style.opacity === '0') {
            this.showTutorial(false);
        } else {
            this.hideTutorial();
        }
    },

    showTutorial(autoHide = true) {
        const tutBanner = document.getElementById('tutorial-banner');
        if (!tutBanner) return;
        
        tutBanner.style.display = 'block';
        setTimeout(() => tutBanner.style.opacity = '1', 50);
        
        if (this.tutorialTimeout) clearTimeout(this.tutorialTimeout);
        
        if (autoHide) {
            this.tutorialTimeout = window.setTimeout(() => {
                this.hideTutorial();
            }, 12000); // 12 seconds read time
        }
    },

    hideTutorial() {
        const tutBanner = document.getElementById('tutorial-banner');
        if (!tutBanner) return;
        tutBanner.style.opacity = '0';
        setTimeout(() => {
            if (tutBanner.style.opacity === '0') tutBanner.style.display = 'none';
        }, 300);
    }
};

const initApp = () => {
    console.log("DOM ready, initializing DossierSystem for Jeva Muafida...");
    
    // PIN listener
    const pinField = document.getElementById('pin-field') as HTMLInputElement | null;
    if (pinField) {
        pinField.oninput = (e) => {
            const target = e.target as HTMLInputElement;
            if (target.value === "300326") {
                window.DossierSystem.runConstellationTransition();
            }
        };
    }

    // Initialize core system
    window.DossierSystem.init();

    // Auto-ping Supabase every 5 minutes
    setInterval(() => {
        window.DossierSystem.pingDatabase();
    }, 5 * 60 * 1000);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
