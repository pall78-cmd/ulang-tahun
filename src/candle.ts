// Candle reflection stage, gyroscope & mouse 3D tracking, and typewriter letter module
import confetti from 'canvas-confetti';
import { fadeIn } from './audio';

export class CandleController {
    public candleBlown = false;
    public isTyping = false;
    private typeInterval: number | null = null;
    private fullLetterText = "";
    private audioCtx: AudioContext | null = null;
    private trackingInitialized = false;

    // Subtle 3D tilt tracking parameters
    private targetTiltX = 0;
    private targetTiltY = 0;
    private currentTiltX = 0;
    private currentTiltY = 0;
    private animFrameId: number | null = null;

    // Listeners for clean lifecycle management
    private boundMouseMove: ((e: MouseEvent) => void) | null = null;
    private boundOrientation: ((e: DeviceOrientationEvent) => void) | null = null;
    private touchStartX = 0;
    private touchStartY = 0;
    private hasGyroscope = false;

    constructor() {
        this.fullLetterText = "Bubby, My Pretty girl,\n\nSatu tahun ini rasanya cepat banget lewat, tapi obrolan kita tiap malam selalu nempel di kepala. Dari awal Maret yang masih canggung di ruang chat, sampai sekarang kita bisa teleponan berjam-jam pas sleep call nemenin kamu tidur sambil dengerin napasmu yang teratur di telepon, saling kirim pap foto makanan pas istirahat siang, dan dengerin VN curhatmu yang panjang.\n\nMakasih ya udah jadi My pacar gweh yang selalu sabar dan dengerin ceritaku, meski ada jarak 98 km di antara kita. Denger nada suaramu yang manja pas lagi ngantuk atau ketawa lepas pas denger lelucon recehku di telepon itu beneran bikin tenang.\n\nTahun depan, semoga harimu tetap ringan, tidurmu nyenyak, dan jarak Surabaya-Malang ini segera ketemu ujungnya. Aku bakal tetap di sini, nemenin kamu di tiap obrolan malam kita.\n\nPeluk hangat dari jauh,\nNaufal.";
    }

    public initTracking(): void {
        const stage = document.getElementById('candle-stage');
        const container = document.getElementById('candle-3d-box');
        if (!stage || !container || this.trackingInitialized) return;

        this.trackingInitialized = true;

        // 1. Gyroscope-based tracking (Mobile phones: Android & iOS)
        if (window.DeviceOrientationEvent) {
            this.boundOrientation = (e: DeviceOrientationEvent) => {
                if (this.candleBlown) return;
                if (e.gamma !== null && e.beta !== null) {
                    this.hasGyroscope = true;
                    // Gamma is left/right roll (-90 to +90). ±25° provides comfortable subtle range
                    const normGamma = Math.max(-1, Math.min(1, e.gamma / 25));
                    // Beta is front/back pitch (-180 to +180). Natural holding angle is ~45°
                    const normBeta = Math.max(-1, Math.min(1, (e.beta - 45) / 25));

                    // Subtle, gentle tilt intensity (max ~8° Y, ~6° X)
                    this.targetTiltY = normGamma * 8;
                    this.targetTiltX = -normBeta * 6;
                }
            };

            window.addEventListener('deviceorientation', this.boundOrientation, { passive: true });

            // iOS 13+ permission flow if available
            const reqPerm = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
            if (typeof reqPerm === 'function') {
                const requestOnFirstTouch = () => {
                    reqPerm().then((res) => {
                        if (res === 'granted' && this.boundOrientation) {
                            window.addEventListener('deviceorientation', this.boundOrientation, { passive: true });
                        }
                    }).catch(() => {});
                    window.removeEventListener('touchstart', requestOnFirstTouch);
                };
                window.addEventListener('touchstart', requestOnFirstTouch, { once: true, passive: true });
            }
        }

        // 2. Mouse-based tracking (Desktop & Laptop browsers)
        this.boundMouseMove = (e: MouseEvent) => {
            if (this.candleBlown) return;
            const rect = stage.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
            const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

            // Subtle, gentle tilt intensity (max ~8° Y, ~6° X)
            this.targetTiltY = Math.max(-1, Math.min(1, normX)) * 8;
            this.targetTiltX = -Math.max(-1, Math.min(1, normY)) * 6;
        };
        window.addEventListener('mousemove', this.boundMouseMove, { passive: true });

        // Mouse leave reset
        stage.addEventListener('mouseleave', () => {
            if (!this.hasGyroscope) {
                this.targetTiltX = 0;
                this.targetTiltY = 0;
            }
        });

        // 3. Touch interaction handling: strictly non-intrusive tap recognition
        // We record touch coordinates on touchstart and verify distance on touchend
        // so that simple taps instantly extinguish the flame while preserving smooth tracking
        stage.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                this.touchStartX = e.touches[0].clientX;
                this.touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        stage.addEventListener('touchend', (e) => {
            if (this.candleBlown) return;
            if (e.changedTouches.length > 0) {
                const touch = e.changedTouches[0];
                const dist = Math.hypot(touch.clientX - this.touchStartX, touch.clientY - this.touchStartY);
                // Tap threshold (< 14px): user tapped the candle / screen to blow out
                if (dist < 14) {
                    const hit = document.elementFromPoint(touch.clientX, touch.clientY);
                    if (hit && (hit.closest('#candle-3d-box') || hit.closest('.flame') || hit.closest('.candle') || hit.closest('#candle-stage'))) {
                        this.extinguish();
                        return;
                    }
                }
            }
            if (!this.hasGyroscope) {
                this.targetTiltX = 0;
                this.targetTiltY = 0;
            }
        }, { passive: true });

        // Direct tap on candle container
        container.addEventListener('click', () => {
            this.extinguish();
        });

        // 4. Smooth damping animation loop (lerp factor 0.075 for jitter-free glide)
        const updateTilt = () => {
            if (this.candleBlown) {
                this.animFrameId = null;
                return;
            }

            this.currentTiltX += (this.targetTiltX - this.currentTiltX) * 0.075;
            this.currentTiltY += (this.targetTiltY - this.currentTiltY) * 0.075;

            if (container) {
                // Subtle 3D transform effect
                container.style.transform = `perspective(850px) rotateX(${this.currentTiltX.toFixed(2)}deg) rotateY(${this.currentTiltY.toFixed(2)}deg) translateZ(6px)`;
            }

            const flameGlow = document.querySelector('.candle-glow') as HTMLElement | null;
            if (flameGlow) {
                flameGlow.style.transform = `translate(${-this.currentTiltY * 1.2}px, ${this.currentTiltX * 0.9}px)`;
            }

            this.animFrameId = requestAnimationFrame(updateTilt);
        };

        this.animFrameId = requestAnimationFrame(updateTilt);
    }

    private playTypewriterTick(): void {
        try {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioContextClass) return;
            if (!this.audioCtx) {
                this.audioCtx = new AudioContextClass();
            }
            if (this.audioCtx.state === 'suspended') {
                void this.audioCtx.resume();
            }
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320 + Math.random() * 80, this.audioCtx.currentTime);
            gain.gain.setValueAtTime(0.012, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.04);
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);
            osc.start();
            osc.stop(this.audioCtx.currentTime + 0.04);
        } catch {
            // Audio policy graceful fallback
        }
    }

    public extinguish(): void {
        if (this.candleBlown) return;
        this.candleBlown = true;

        // Cleanup animation frame and event listeners
        if (this.animFrameId !== null) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        if (this.boundMouseMove) {
            window.removeEventListener('mousemove', this.boundMouseMove);
            this.boundMouseMove = null;
        }
        if (this.boundOrientation) {
            window.removeEventListener('deviceorientation', this.boundOrientation);
            this.boundOrientation = null;
        }

        const stage = document.getElementById('candle-stage');
        if (stage) stage.classList.add('extinguished');

        const flame = document.querySelector('.flame') as HTMLElement | null;
        if (flame) flame.style.display = 'none';

        const candleHint = document.querySelector('.candle-hint') as HTMLElement | null;
        if (candleHint) candleHint.style.display = 'none';

        const flash = document.getElementById('flash-overlay');
        if (flash) flash.classList.add('flash-active');

        // Play background acoustic melody
        fadeIn('birthday-song', 2000);

        setTimeout(() => {
            const candleStage = document.getElementById('candle-stage');
            if (candleStage) {
                candleStage.style.opacity = '0';
                candleStage.style.pointerEvents = 'none';
            }

            // Confetti celebration (controlled duration)
            const duration = 2.0 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 4,
                    angle: 60,
                    spread: 50,
                    origin: { x: 0 },
                    colors: ['#8b0000', '#ffffff', '#ffd700']
                });
                confetti({
                    particleCount: 4,
                    angle: 120,
                    spread: 50,
                    origin: { x: 1 },
                    colors: ['#8b0000', '#ffffff', '#ffd700']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());

            setTimeout(() => {
                if (candleStage) candleStage.style.display = 'none';
                this.type();
            }, 500);

            if (flash) flash.classList.remove('flash-active');
        }, 300);
    }

    public type(): void {
        if (this.isTyping) return;
        this.isTyping = true;

        const out = document.getElementById('typewriter-output');
        const seal = document.getElementById('wax-seal-area');
        const skipBtn = document.getElementById('typewriter-skip-btn');

        if (skipBtn) skipBtn.style.display = 'inline-flex';
        if (out) out.textContent = "";
        let i = 0;
        if (seal) seal.classList.remove('seal-active');

        if (this.typeInterval) {
            clearInterval(this.typeInterval);
            this.typeInterval = null;
        }

        this.typeInterval = window.setInterval(() => {
            if (!out) return;
            out.textContent += this.fullLetterText[i];
            
            // Auto-scroll as typing progresses
            out.scrollTop = out.scrollHeight;

            if (i % 4 === 0) {
                this.playTypewriterTick();
            }

            i++;
            if (i >= this.fullLetterText.length) {
                this.finishTyping();
            }
        }, 26);
    }

    public finishTyping(): void {
        if (this.typeInterval) {
            clearInterval(this.typeInterval);
            this.typeInterval = null;
        }
        this.isTyping = false;

        const out = document.getElementById('typewriter-output');
        const seal = document.getElementById('wax-seal-area');
        const pageMod = document.getElementById('mod-4');
        const skipBtn = document.getElementById('typewriter-skip-btn');

        if (out) {
            out.textContent = this.fullLetterText;
            out.classList.add('typing-done');
            out.scrollTop = out.scrollHeight;
        }
        if (skipBtn) skipBtn.style.display = 'none';

        setTimeout(() => {
            if (pageMod) pageMod.classList.add('victorian-bg');
            if (seal) seal.classList.add('seal-active');
        }, 400);
    }
}
