// Types and shared interfaces for Dossier System

export interface TransmissionMessage {
    id: number;
    sender: string;
    content: string;
    created_at: string;
    is_hidden?: boolean;
}


export interface FadingAudioElement extends HTMLAudioElement {
    fadeInterval?: number | null;
}

export interface MilestoneDateItem {
    key: string;
    day: number;
    month: number; // 0-indexed: 2 = Maret, 3 = April, 11 = Desember
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

    // Audio methods
    fadeIn: (audioId: string, duration?: number) => void;
    fadeOut: (audioId: string, duration?: number) => void;
    playPageFlipSound: () => void;
    playTapeClickSound: () => void;
    playLinkChimeSound: () => void;
    toggleAmbientSound: () => void;
    getAmbientSoundState: () => { mode: string; label: string; icon: string };

    // Video methods
    openVideoModal: () => void;
    closeVideoModal: () => void;
    playDossierVideo: () => void;
    playEvidenceVideo: () => void;
    retryEvidenceVideo: () => void;
    openShortsVideo: (e?: Event) => void;

    // Calendar methods
    renderCalendar: () => void;
    changeCalendarMonth: (delta: number) => void;
    selectMilestone: (key: string) => void;
    jumpToMilestone: (key: string) => void;
    openCurrentMilestoneModal: () => void;
    openDateNoteModal: (key?: string) => void;
    closeDateNoteModal: () => void;
    saveCurrentDateMemo: () => void;
    getNextMilestoneData: () => MilestoneDateItem | null;
    jumpToNextMilestone: () => void;

    // Visuals & gestures
    stopSparkles: () => void;
    startSparkles: () => void;
    generateTarotCards: () => void;
    initBookGestures: () => void;

    // Core lifecycle & navigation
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

    // Messages
    loadMsgs: () => Promise<void>;
    renderMsgs: (data: TransmissionMessage[]) => void;
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

    // 3D Route & Candle methods
    finishTyping: () => void;
    toggle3DRouteTracking: () => void;
    focusRoutePoint: (target: 'surabaya' | 'sidoarjo' | 'pandaan' | 'purwodadi' | 'lawang' | 'malang' | 'all') => void;
    toggleMapTouchLock: (lock?: boolean) => void;

    // Time capsule & tutorial
    openTimeCapsule: () => void;
    closeTimeCapsule: () => void;
    toggleCapsuleSimulation: () => void;
    updateTimeCapsuleCountdown: () => void;
    toggleTutorial: () => void;
    showTutorial: (autoHide?: boolean) => void;
    hideTutorial: () => void;
}

declare global {
    interface Window {
        DossierSystem: DossierSystemType;
    }
}
