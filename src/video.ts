// Video handling, responsive buffering management, and immediate user-activation playback
import { playTapeClickSound, playLinkChimeSound } from './audio';

const EVIDENCE_VIDEO_URL = 'https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/VID_20261020170628490.mp4';
const DOSSIER_VIDEO_URL = 'https://urcxbufxcebfgrsfvmsj.supabase.co/storage/v1/object/public/my%20pacar/Hindia%20-%20everything%20u%20are%20edit%28720P_HD%29.mp4';

export class VideoController {
    private sparkleInterval: number | null = null;
    private evidenceListenersBound = false;
    private dossierListenersBound = false;

    /**
     * Evidence video (Halaman 2 / 32MB file)
     * Direct playback execution within user gesture event loop to prevent mobile activation loss.
     */
    public playEvidenceVideo(): void {
        playTapeClickSound();
        const decryptBtn = document.getElementById('decrypt-btn');
        const container = document.getElementById('video-container');
        const video = document.getElementById('evidence-video-h2') as HTMLVideoElement | null;
        const loadingIndicator = document.getElementById('evidence-video-loading');
        const errorIndicator = document.getElementById('evidence-video-error');

        // Immediately update visual container without arbitrary timeouts
        if (decryptBtn) {
            decryptBtn.style.display = 'none';
        }
        if (container) {
            container.classList.remove('hidden');
            container.classList.add('video-scale-up-fade');
        }

        if (errorIndicator) {
            errorIndicator.classList.add('hidden');
        }

        if (!video) return;

        // Bind media events once
        if (!this.evidenceListenersBound) {
            this.bindEvidenceEvents(video);
            this.evidenceListenersBound = true;
        }

        // Lazy-assign media source only on demand; do not reassign if already loaded
        const currentSrc = video.currentSrc || video.src;
        if (!currentSrc || !currentSrc.includes('VID_20261020170628490')) {
            if (loadingIndicator) loadingIndicator.classList.remove('hidden');
            video.src = EVIDENCE_VIDEO_URL;
            video.load();
        }

        // Trigger playback immediately within user activation chain
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.warn('[Evidence Video] Play request status:', err?.message || err);
                // If waiting for buffer, the waiting/canplay handlers will update the UI
            });
        }
    }

    private bindEvidenceEvents(video: HTMLVideoElement): void {
        const loading = document.getElementById('evidence-video-loading');
        const error = document.getElementById('evidence-video-error');

        video.addEventListener('loadstart', () => {
            if (loading && video.paused) loading.classList.remove('hidden');
            if (error) error.classList.add('hidden');
        });

        video.addEventListener('waiting', () => {
            if (loading) loading.classList.remove('hidden');
        });

        video.addEventListener('playing', () => {
            if (loading) loading.classList.add('hidden');
            if (error) error.classList.add('hidden');
        });

        video.addEventListener('canplay', () => {
            if (loading && !video.paused) loading.classList.add('hidden');
        });

        video.addEventListener('stalled', () => {
            if (loading && !video.paused) loading.classList.remove('hidden');
        });

        video.addEventListener('error', (e) => {
            console.warn('[Evidence Video] Media error encountered:', e);
            if (loading) loading.classList.add('hidden');
            if (error) error.classList.remove('hidden');
        });
    }

    public retryEvidenceVideo(): void {
        const video = document.getElementById('evidence-video-h2') as HTMLVideoElement | null;
        const loading = document.getElementById('evidence-video-loading');
        const error = document.getElementById('evidence-video-error');

        if (error) error.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');

        if (video) {
            video.src = EVIDENCE_VIDEO_URL;
            video.load();
            video.play().catch(e => console.warn('Retry play error:', e));
        }
    }

    public openShortsVideo(e?: Event): void {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        playLinkChimeSound();
        const card = document.getElementById('shorts-card-btn');
        const btnText = document.getElementById('shorts-play-btn-text');

        if (card) {
            card.classList.add('shorts-active-opening');
        }
        if (btnText) {
            btnText.innerHTML = '<span class="inline-block animate-spin mr-0.5">✦</span> Membuka...';
        }

        setTimeout(() => {
            if (card) card.classList.remove('shorts-active-opening');
            if (btnText) {
                btnText.innerHTML = '<span>Buka Shorts ↗</span>';
            }
            try {
                window.open('https://youtube.com/shorts/S95wMLXdp_M?si=eRZVr4REOjk5be0X', '_blank', 'noopener,noreferrer');
            } catch (err) {
                window.location.href = 'https://youtube.com/shorts/S95wMLXdp_M?si=eRZVr4REOjk5be0X';
            }
        }, 300);
    }

    /**
     * Main Video Modal (Carte Postale / 2.67 MB file)
     */
    public openVideoModal(): void {
        playTapeClickSound();
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('dossier-video') as HTMLVideoElement | null;
        const loading = document.getElementById('dossier-video-loading');
        const error = document.getElementById('dossier-video-error');

        if (error) error.classList.add('hidden');

        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('modal-opening');
            setTimeout(() => modal.classList.remove('modal-opening'), 450);
        }

        if (video) {
            if (!this.dossierListenersBound) {
                this.bindDossierEvents(video);
                this.dossierListenersBound = true;
            }

            // Ensure source is verified without resetting already buffered state
            if (!video.currentSrc && !video.src) {
                video.src = DOSSIER_VIDEO_URL;
                video.load();
            }

            if (video.readyState < 2 && loading) {
                loading.classList.remove('hidden');
            }

            // Direct user-activation playback
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn('[Dossier Video] Play restriction or buffering notice:', e?.message || e);
                });
            }
        }

        this.startSparkles();
    }

    private bindDossierEvents(video: HTMLVideoElement): void {
        const loading = document.getElementById('dossier-video-loading');
        const error = document.getElementById('dossier-video-error');

        video.addEventListener('loadstart', () => {
            if (loading && video.paused) loading.classList.remove('hidden');
            if (error) error.classList.add('hidden');
        });

        video.addEventListener('waiting', () => {
            if (loading) loading.classList.remove('hidden');
        });

        video.addEventListener('playing', () => {
            if (loading) loading.classList.add('hidden');
            if (error) error.classList.add('hidden');
        });

        video.addEventListener('canplay', () => {
            if (loading && !video.paused) loading.classList.add('hidden');
        });

        video.addEventListener('stalled', () => {
            if (loading && !video.paused) loading.classList.remove('hidden');
        });

        video.addEventListener('error', (e) => {
            console.warn('[Dossier Video] Media error encountered:', e);
            if (loading) loading.classList.add('hidden');
            if (error) error.classList.remove('hidden');
        });
    }

    public closeVideoModal(): void {
        const modal = document.getElementById('video-modal');
        const video = document.getElementById('dossier-video') as HTMLVideoElement | null;
        const loading = document.getElementById('dossier-video-loading');
        const error = document.getElementById('dossier-video-error');

        if (video) {
            video.pause();
        }
        if (loading) loading.classList.add('hidden');
        if (error) error.classList.add('hidden');
        if (modal) {
            modal.style.display = 'none';
        }
        this.stopSparkles();
    }

    public playDossierVideo(): void {
        playTapeClickSound();
        const video = document.getElementById('dossier-video') as HTMLVideoElement | null;
        const loading = document.getElementById('dossier-video-loading');
        const error = document.getElementById('dossier-video-error');

        if (error) error.classList.add('hidden');
        if (loading) loading.classList.remove('hidden');

        if (video) {
            video.currentTime = 0;
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    console.warn('[Dossier Video] Replay warning:', e);
                    if (video.error && error) {
                        loading?.classList.add('hidden');
                        error.classList.remove('hidden');
                    }
                });
            }
        }
    }

    public startSparkles(): void {
        if (this.sparkleInterval) return;
        const container = document.getElementById('sparkles-container');
        if (!container) return;

        this.sparkleInterval = window.setInterval(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 100}%`;
            sparkle.style.animationDuration = `${0.8 + Math.random() * 0.8}s`;
            container.appendChild(sparkle);
            setTimeout(() => {
                if (sparkle.parentNode) sparkle.remove();
            }, 1600);
        }, 180);
    }

    public stopSparkles(): void {
        if (this.sparkleInterval) {
            clearInterval(this.sparkleInterval);
            this.sparkleInterval = null;
        }
        const container = document.getElementById('sparkles-container');
        if (container) container.innerHTML = '';
    }
}
