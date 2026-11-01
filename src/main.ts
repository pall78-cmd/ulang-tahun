// The Ledger of Us - Buku Kenangan untuk Bubby dari Naufal
import { DossierSystemType } from './types';
import { fadeIn, fadeOut, playPageFlipSound, playTapeClickSound, playLinkChimeSound, prewarmAudio, ambientSound } from './audio';
import { CalendarController } from './calendar';
import { CandleController } from './candle';
import { VideoController } from './video';
import { NavigationController } from './navigation';
import { MessagesController } from './messages';
import { TimeCapsuleController } from './timecapsule';
import { Route3DController } from './route3d';

// Instantiate modular controllers
const calendarCtrl = new CalendarController();
const candleCtrl = new CandleController();
const videoCtrl = new VideoController();
const navCtrl = new NavigationController();
const msgsCtrl = new MessagesController();
const capsuleCtrl = new TimeCapsuleController();
const route3dCtrl = new Route3DController();

// Hook page change events
navCtrl.onPageChange = (pageIdx: number) => {
    if (pageIdx === 7) {
        void msgsCtrl.loadMsgs();
    }
    if (pageIdx === 6) {
        route3dCtrl.start();
    } else {
        route3dCtrl.stop();
        route3dCtrl.setTouchLock(false);
    }
    if (pageIdx === 4 && !candleCtrl.candleBlown) {
        const candleStage = document.getElementById('candle-stage');
        if (candleStage) {
            candleStage.style.display = 'flex';
            candleStage.style.opacity = '1';
        }
        candleCtrl.initTracking();
    }
};

// Assemble full window.DossierSystem object
const systemImplementation: DossierSystemType = {
    get index() { return navCtrl.index; },
    set index(val: number) { navCtrl.index = val; },

    get currentSender() { return msgsCtrl.currentSender; },
    set currentSender(val: string) { msgsCtrl.currentSender = val; },

    get isTyping() { return candleCtrl.isTyping; },
    set isTyping(val: boolean) { candleCtrl.isTyping = val; },

    get candleBlown() { return candleCtrl.candleBlown; },
    set candleBlown(val: boolean) { candleCtrl.candleBlown = val; },

    get direction() { return navCtrl.direction; },
    set direction(val: string) { navCtrl.direction = val; },

    get isCapsuleSimulatedUnlocked() { return capsuleCtrl.isCapsuleSimulatedUnlocked; },
    set isCapsuleSimulatedUnlocked(val: boolean) { capsuleCtrl.isCapsuleSimulatedUnlocked = val; },

    get isFlipping() { return navCtrl.isFlipping; },
    set isFlipping(val: boolean) { navCtrl.isFlipping = val; },

    get capsuleInterval() { return capsuleCtrl.capsuleInterval; },
    set capsuleInterval(val: number | null) { capsuleCtrl.capsuleInterval = val; },

    get tutorialTimeout() { return navCtrl.tutorialTimeout; },
    set tutorialTimeout(val: number | null) { navCtrl.tutorialTimeout = val; },

    get calendarMonth() { return calendarCtrl.calendarMonth; },
    set calendarMonth(val: number) { calendarCtrl.calendarMonth = val; },

    get calendarYear() { return calendarCtrl.calendarYear; },
    set calendarYear(val: number) { calendarCtrl.calendarYear = val; },

    get currentDateKey() { return calendarCtrl.currentDateKey; },
    set currentDateKey(val: string) { calendarCtrl.currentDateKey = val; },

    // Audio methods
    fadeIn,
    fadeOut,
    playPageFlipSound,
    playTapeClickSound,
    playLinkChimeSound,
    toggleAmbientSound: () => {
        ambientSound.toggle();
    },
    getAmbientSoundState: () => ambientSound.getModeMeta(),

    // Video methods
    openVideoModal: () => videoCtrl.openVideoModal(),
    closeVideoModal: () => videoCtrl.closeVideoModal(),
    playDossierVideo: () => videoCtrl.playDossierVideo(),
    playEvidenceVideo: () => videoCtrl.playEvidenceVideo(),
    retryEvidenceVideo: () => videoCtrl.retryEvidenceVideo(),
    openShortsVideo: (e?: Event) => videoCtrl.openShortsVideo(e),

    // Calendar methods
    renderCalendar: () => calendarCtrl.renderCalendar(),
    changeCalendarMonth: (delta: number) => calendarCtrl.changeCalendarMonth(delta),
    selectMilestone: (key: string) => calendarCtrl.selectMilestone(key),
    jumpToMilestone: (key: string) => calendarCtrl.jumpToMilestone(key),
    openCurrentMilestoneModal: () => calendarCtrl.openCurrentMilestoneModal(),
    openDateNoteModal: (key?: string) => calendarCtrl.openDateNoteModal(key),
    closeDateNoteModal: () => calendarCtrl.closeDateNoteModal(),
    saveCurrentDateMemo: () => calendarCtrl.saveCurrentDateMemo(),
    getNextMilestoneData: () => calendarCtrl.getNextMilestoneData(),
    jumpToNextMilestone: () => calendarCtrl.jumpToNextMilestone(),

    // Visuals & gestures
    stopSparkles: () => videoCtrl.stopSparkles(),
    startSparkles: () => videoCtrl.startSparkles(),
    generateTarotCards: () => {
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
    initBookGestures: () => navCtrl.initBookGestures(),

    // Core lifecycle & navigation
    init: () => {
        window.addEventListener('error', (event) => {
            if (event.message && (
                event.message.includes('ResizeObserver loop completed with undelivered notifications') ||
                event.message.includes('ResizeObserver loop limit exceeded')
            )) {
                event.stopImmediatePropagation();
                return;
            }
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
                    } else if (alt.includes('new york') || alt.includes('ny')) {
                        img.src = 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=80';
                    } else {
                        img.src = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80';
                    }
                }
            }
        }, true);

        // Pre-warm audio elements
        prewarmAudio();

        // Render calendar & setup gestures
        calendarCtrl.renderCalendar();
        navCtrl.initBookGestures();
        navCtrl.render();
        route3dCtrl.init('route-3d-canvas-container');
        if (navCtrl.index === 6) {
            route3dCtrl.start();
        }

        const msgField = document.getElementById('msg-field');
        if (msgField) {
            msgField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') void msgsCtrl.send();
            });
        }
    },

    showPin: () => {
        const initScreen = document.getElementById('init-screen');
        const pinScreen = document.getElementById('pin-screen');
        const pinField = document.getElementById('pin-field');
        if (initScreen) initScreen.style.display = 'none';
        if (pinScreen) pinScreen.style.display = 'block';
        if (pinField) pinField.focus();
    },

    runConstellationTransition: () => {
        const loader = document.getElementById('constellation-loader');
        if (!loader) return;
        loader.style.display = 'flex';
        setTimeout(() => loader.style.opacity = '1', 10);
        setTimeout(() => {
            loader.style.opacity = '0';
            systemImplementation.unlock();
            setTimeout(() => loader.style.display = 'none', 500);
        }, 1800);
    },

    unlock: () => {
        const authModule = document.getElementById('auth-module');
        if (!authModule) return;
        authModule.style.opacity = '0';
        setTimeout(() => {
            authModule.style.display = 'none';
            navCtrl.showTutorial(true);
        }, 700);
    },

    setSender: (name: string) => msgsCtrl.setSender(name),
    turnPage: (targetIdx: number, dir: 'next' | 'prev') => navCtrl.turnPage(targetIdx, dir),
    render: () => navCtrl.render(),
    extinguish: () => candleCtrl.extinguish(),
    next: () => navCtrl.next(),
    prev: () => navCtrl.prev(),
    goTo: (pageIdx: number) => navCtrl.goTo(pageIdx),
    type: () => candleCtrl.type(),

    // Messages
    loadMsgs: () => msgsCtrl.loadMsgs(),
    renderMsgs: (data) => msgsCtrl.renderMsgs(data),
    send: () => msgsCtrl.send(),
    openModal: () => msgsCtrl.openModal(),
    closeModal: () => msgsCtrl.closeModal(),
    showAlert: (msg: string) => msgsCtrl.showAlert(msg),
    closeAlert: () => msgsCtrl.closeAlert(),
    confirmPurge: () => msgsCtrl.confirmPurge(),
    openDbManager: () => msgsCtrl.openDbManager(),
    closeDbManager: () => msgsCtrl.closeDbManager(),
    pingDatabase: () => msgsCtrl.pingDatabase(),
    deleteRecord: (id: number) => msgsCtrl.deleteRecord(id),
    renderDbRecords: (data) => msgsCtrl.renderDbRecords(data),

    // 3D Route & Candle methods
    finishTyping: () => candleCtrl.finishTyping(),
    toggle3DRouteTracking: () => route3dCtrl.toggleTrackingMode(),
    focusRoutePoint: (target) => route3dCtrl.focusPoint(target),
    toggleMapTouchLock: (lock?: boolean) => route3dCtrl.setTouchLock(lock ?? !route3dCtrl.isTouchLocked),

    // Time capsule & tutorial
    openTimeCapsule: () => capsuleCtrl.openTimeCapsule(),
    closeTimeCapsule: () => capsuleCtrl.closeTimeCapsule(),
    toggleCapsuleSimulation: () => capsuleCtrl.toggleCapsuleSimulation(),
    updateTimeCapsuleCountdown: () => capsuleCtrl.updateTimeCapsuleCountdown(),
    toggleTutorial: () => navCtrl.toggleTutorial(),
    showTutorial: (autoHide?: boolean) => navCtrl.showTutorial(autoHide),
    hideTutorial: () => navCtrl.hideTutorial()
};

window.DossierSystem = Object.assign(window.DossierSystem || {}, systemImplementation);

const initApp = () => {
    const initBtn = document.querySelector('.init-btn') as HTMLElement | null;
    if (initBtn) {
        initBtn.onclick = () => window.DossierSystem.showPin();
    }

    // PIN listener: Decryption access code updated to ChapterOfUs with anti-XSS sanitized validation
    const pinField = document.getElementById('pin-field') as HTMLInputElement | null;
    if (pinField) {
        const verifyPin = () => {
            const raw = pinField.value || '';
            const sanitized = raw.replace(/[<>"'&/\\;`]/g, '').trim();
            if (raw !== sanitized) {
                pinField.value = sanitized;
            }
            if (sanitized.toLowerCase() === "chapterofus".toLowerCase()) {
                window.DossierSystem.runConstellationTransition();
            }
        };

        pinField.oninput = verifyPin;
        pinField.onkeydown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                verifyPin();
            }
        };
    }

    window.DossierSystem.init();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
