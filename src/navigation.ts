// Page navigation, flip animations, and 3D gestures module
import { playPageFlipSound } from './audio';

export class NavigationController {
    public index = 0;
    public direction = 'next';
    public isFlipping = false;
    public tutorialTimeout: number | null = null;
    public onPageChange?: (pageIdx: number) => void;

    public goTo(pageIdx: number): void {
        if (pageIdx === this.index || pageIdx < 0 || pageIdx > 7) return;
        this.turnPage(pageIdx, pageIdx > this.index ? 'next' : 'prev');
    }

    public next(): void {
        if (this.index < 7) {
            this.turnPage(this.index + 1, 'next');
        }
    }

    public prev(): void {
        if (this.index > 0) {
            this.turnPage(this.index - 1, 'prev');
        }
    }

    public turnPage(targetIdx: number, dir: 'next' | 'prev'): void {
        // Strict guard against invalid boundaries and double execution
        if (targetIdx === this.index || targetIdx < 0 || targetIdx > 7) return;
        if (this.isFlipping) return;

        playPageFlipSound();

        const currentIdx = this.index;
        const currentMod = document.getElementById(`mod-${currentIdx}`);
        const nextMod = document.getElementById(`mod-${targetIdx}`);

        if (!currentMod || !nextMod) {
            this.index = targetIdx;
            this.direction = dir;
            this.render();
            if (this.onPageChange) {
                this.onPageChange(this.index);
            }
            return;
        }

        this.isFlipping = true;
        this.direction = dir;

        // Reset any inline drag transforms
        currentMod.style.transform = '';
        currentMod.style.boxShadow = '';
        currentMod.style.transition = '';
        nextMod.style.transform = '';
        nextMod.style.boxShadow = '';
        nextMod.style.transition = '';

        if (dir === 'next') {
            nextMod.classList.add('page-underneath');
            currentMod.classList.add('page-flipping-out-next');
        } else {
            nextMod.classList.add('page-flipping-in-prev');
        }

        setTimeout(() => {
            currentMod.classList.remove('active', 'page-flipping-out-next');
            nextMod.classList.remove('page-underneath', 'page-flipping-in-prev');
            nextMod.classList.add('active');

            this.index = targetIdx;
            this.isFlipping = false;
            this.render();

            if (this.onPageChange) {
                this.onPageChange(this.index);
            }
        }, 580);
    }

    public render(): void {
        // Dynamic title ensuring Halaman 1 strictly addresses Bubby without mentioning Jeva
        const headerTitle = document.getElementById('dossier-header-title');
        if (headerTitle) {
            headerTitle.innerText = this.index === 0 ? 'The Ledger // Bubby' : 'The Ledger // Jeva Muafida';
        }
        // Pause Halaman 2 evidence video when leaving page 1
        if (this.index !== 1) {
            const h2Video = document.getElementById('evidence-video-h2') as HTMLVideoElement | null;
            if (h2Video && !h2Video.paused) {
                h2Video.pause();
            }
        }

        // Pause Halaman 6 modal video when leaving page 5
        if (this.index !== 5) {
            const h6Video = document.getElementById('dossier-video') as HTMLVideoElement | null;
            if (h6Video && !h6Video.paused) {
                h6Video.pause();
            }
        }

        // Reset inline transforms and transition classes
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
        if (pageNum) pageNum.innerText = `${this.index + 1} / 8`;
        if (pageNumTop) pageNumTop.innerText = `${this.index + 1} / 8`;

        // Update active page chips
        document.querySelectorAll('.page-chip').forEach((chip, idx) => {
            if (idx === this.index) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        // Manage edge zones visibility
        const navL = document.getElementById('nav-l');
        const navR = document.getElementById('nav-r');
        if (navL) navL.style.display = this.index > 0 ? 'flex' : 'none';
        if (navR) navR.style.display = this.index < 7 ? 'flex' : 'none';

        // Dynamically update tutorial card content if it's currently open
        const tutBanner = document.getElementById('tutorial-banner');
        if (tutBanner && (tutBanner.style.display === 'flex' || tutBanner.style.display === 'block')) {
            this.showTutorial(false);
        }
    }

    public initBookGestures(): void {
        const viewport = document.getElementById('module-viewport');
        const navL = document.getElementById('nav-l');
        const navR = document.getElementById('nav-r');

        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isPulling = false;
        let pullDirection: 'next' | 'prev' | null = null;
        let activeModule: HTMLElement | null = null;

        const isInteractive = (target: EventTarget | null): boolean => {
            if (!target || !(target instanceof HTMLElement)) return false;
            return Boolean(
                target.closest('button') ||
                target.closest('a') ||
                target.closest('input') ||
                target.closest('textarea') ||
                target.closest('video') ||
                target.closest('.calendar-day') ||
                target.closest('.polaroid') ||
                target.closest('.flame') ||
                target.closest('.custom-modal') ||
                target.closest('#candle-stage') ||
                target.closest('#route-3d-canvas-container') ||
                target.closest('canvas')
            );
        };

        const onPullStart = (e: MouseEvent | TouchEvent, direction: 'next' | 'prev') => {
            if (this.isFlipping) return;
            const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
            startX = point.clientX;
            startY = point.clientY;
            currentX = startX;
            isPulling = true;
            pullDirection = direction;
            activeModule = document.querySelector<HTMLElement>('.page-module.active');
        };

        const onPullMove = (e: MouseEvent | TouchEvent) => {
            if (!isPulling || !pullDirection || this.isFlipping) return;

            const point = 'touches' in e ? e.touches[0] : (e as MouseEvent);
            currentX = point.clientX;
            const deltaX = currentX - startX;
            const deltaY = point.clientY - startY;

            // If mostly scrolling vertically, do not hijack
            if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && Math.abs(deltaX) < 15) {
                return;
            }

            if (pullDirection === 'next' && activeModule && this.index < 7) {
                const pullProgress = Math.min(Math.max(-deltaX, 0) / 160, 1);
                const nextMod = document.getElementById(`mod-${this.index + 1}`);
                if (nextMod) nextMod.classList.add('page-underneath');

                const rotateDeg = -pullProgress * 55;
                activeModule.style.transformOrigin = 'left center';
                activeModule.style.transform = `perspective(1600px) rotateY(${rotateDeg}deg) translateZ(${pullProgress * 8}px)`;
                activeModule.style.boxShadow = `${-pullProgress * 22}px 0 ${pullProgress * 30}px rgba(0,0,0,${pullProgress * 0.4})`;
                activeModule.style.transition = 'none';

                if (e.cancelable && Math.abs(deltaX) > 10) e.preventDefault();
            } else if (pullDirection === 'prev' && this.index > 0) {
                const prevMod = document.getElementById(`mod-${this.index - 1}`);
                if (prevMod) {
                    prevMod.classList.add('page-flipping-in-prev');
                    const pullProgress = Math.min(Math.max(deltaX, 0) / 160, 1);
                    const rotateDeg = -90 + (pullProgress * 90);
                    prevMod.style.transformOrigin = 'left center';
                    prevMod.style.transform = `perspective(1600px) rotateY(${rotateDeg}deg) translateZ(${(1 - pullProgress) * 8}px)`;
                    prevMod.style.boxShadow = `${-(1 - pullProgress) * 22}px 0 ${(1 - pullProgress) * 30}px rgba(0,0,0,${(1 - pullProgress) * 0.4})`;
                    prevMod.style.transition = 'none';
                }

                if (e.cancelable && Math.abs(deltaX) > 10) e.preventDefault();
            }
        };

        const onPullEnd = () => {
            if (!isPulling) return;
            isPulling = false;
            const deltaX = currentX - startX;
            const dir = pullDirection;
            pullDirection = null;

            const nextMod = document.getElementById(`mod-${this.index + 1}`);
            const prevMod = document.getElementById(`mod-${this.index - 1}`);

            if (dir === 'next') {
                if (deltaX < -35 && this.index < 7) {
                    if (activeModule) {
                        activeModule.style.transform = '';
                        activeModule.style.boxShadow = '';
                        activeModule.style.transition = '';
                    }
                    this.turnPage(this.index + 1, 'next');
                } else {
                    if (activeModule) {
                        activeModule.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.25s ease';
                        activeModule.style.transform = '';
                        activeModule.style.boxShadow = '';
                    }
                    if (nextMod) nextMod.classList.remove('page-underneath');
                }
            } else if (dir === 'prev') {
                if (deltaX > 35 && this.index > 0) {
                    if (prevMod) {
                        prevMod.style.transform = '';
                        prevMod.style.boxShadow = '';
                        prevMod.style.transition = '';
                    }
                    this.turnPage(this.index - 1, 'prev');
                } else {
                    if (prevMod) {
                        prevMod.style.transition = 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.25s ease';
                        prevMod.style.transform = '';
                        prevMod.style.boxShadow = '';
                        setTimeout(() => prevMod?.classList.remove('page-flipping-in-prev'), 250);
                    }
                }
            }
        };

        if (navR) {
            navR.addEventListener('mousedown', (e) => onPullStart(e as MouseEvent, 'next'));
            navR.addEventListener('touchstart', (e) => onPullStart(e as TouchEvent, 'next'), { passive: true });
        }
        if (navL) {
            navL.addEventListener('mousedown', (e) => onPullStart(e as MouseEvent, 'prev'));
            navL.addEventListener('touchstart', (e) => onPullStart(e as TouchEvent, 'prev'), { passive: true });
        }

        if (viewport) {
            viewport.addEventListener('mousedown', (e) => {
                if (isInteractive(e.target)) return;
                const rect = viewport.getBoundingClientRect();
                const dir: 'next' | 'prev' = (e.clientX > rect.left + rect.width * 0.45) ? 'next' : 'prev';
                onPullStart(e, dir);
            });
            viewport.addEventListener('touchstart', (e) => {
                if (isInteractive(e.target)) return;
                const rect = viewport.getBoundingClientRect();
                const touch = e.touches[0];
                const dir: 'next' | 'prev' = (touch.clientX > rect.left + rect.width * 0.45) ? 'next' : 'prev';
                onPullStart(e, dir);
            }, { passive: true });
        }

        window.addEventListener('mousemove', onPullMove);
        window.addEventListener('touchmove', onPullMove, { passive: false });
        window.addEventListener('mouseup', onPullEnd);
        window.addEventListener('touchend', onPullEnd);
        window.addEventListener('touchcancel', onPullEnd);

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement)?.tagName;
            if (e.key === 'Escape') {
                const sys = (window as unknown as { DossierSystem?: Record<string, () => void> }).DossierSystem;
                if (sys) {
                    sys.hideTutorial?.();
                    sys.closeDateNoteModal?.();
                    sys.closeVideoModal?.();
                    sys.closeTimeCapsule?.();
                    sys.closeDbManager?.();
                    sys.closeModal?.();
                }
                return;
            }
            if (['INPUT', 'TEXTAREA'].includes(tag)) return;
            if (e.key === 'ArrowRight' || e.key === 'PageDown') {
                if (this.index < 7) this.next();
            } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
                if (this.index > 0) this.prev();
            }
        });
    }

    public toggleTutorial(): void {
        const tutBanner = document.getElementById('tutorial-banner');
        if (!tutBanner) return;
        const isVisible = tutBanner.style.display === 'flex' || (tutBanner.style.display !== 'none' && tutBanner.style.display !== '');
        if (isVisible) {
            this.hideTutorial();
        } else {
            this.showTutorial(false);
        }
    }

    public showTutorial(autoHide = false): void {
        const tutBanner = document.getElementById('tutorial-banner');
        const tutTitle = document.getElementById('guide-title') || document.getElementById('tut-page-title');
        const tutDesc = document.getElementById('tutorial-text') || document.getElementById('tut-page-desc');
        if (!tutBanner) return;

        // Panduan membaca lembaran buku kenangan buat Bubby
        const guides = [
            {
                title: "HALAMAN 1: SAMPUL KILAS BALIK KITA",
                text: "Ini lembar pembuka buku kenangan satu tahun perjalanan kita, <strong>Bubby</strong>.<br><br><strong>CARA BUKA HALAMAN:</strong> Tarik sisi kanan buku ke arah kiri (atau ketuk angka di bawah) buat buka lembar selanjutnya.<br><br><strong>KAPSUL WAKTU:</strong> Ketuk tombol jam pasir [⏳] di pojok kanan atas buat liat sisa waktu hitung mundur WIB menuju tahun baru."
            },
            {
                title: "HALAMAN 2: TENTANG MY PACAR GWEH & VIDEO",
                text: "Catatan kecil tentang kamu, foto polaroid favorit, dan rekaman video kenangan.<br><br><strong>PUTAR VIDEO:</strong> Ketuk tombol <strong>'▶ Putar Video Kenangan'</strong> buat nonton rekaman manisnya.<br><br><strong>LANJUT MEMBACA:</strong> Geser lembaran ke kiri buat buka lembar berikutnya."
            },
            {
                title: "HALAMAN 3: KLIPING HARIAN & TIGA PERANGKO",
                text: "Koleksi perangko vintage perjalanan dan kliping video kenangan.<br><br><strong>SHORTS KENANGAN:</strong> Ketuk kartu YouTube Shorts buat nonton video kliping kenangan manis kamu.<br><br><strong>LANJUT:</strong> Geser lembaran ke kiri buat buka kalender empat tanggal spesial kita."
            },
            {
                title: "HALAMAN 4: KALENDER EMPAT TANGGAL PENTING",
                text: "Kalender penanda hari-hari paling bermakna buat kita berdua sepanjang tahun 2026.<br><br><strong>4 HARI SPESIAL:</strong> 08 Mar (Awal Chat), 24 Apr (Ultah Bubby), 13 Des (Ultah Naufal), 31 Des (Tahun Baru).<br><br><strong>BACA CERITA:</strong> Ketuk tanggal bertanda khusus di kalender buat baca cerita lengkapnya dan nulis memo rahasiamu."
            },
            {
                title: "HALAMAN 5: LILIN 3D & SURAT BUAT BUBBY",
                text: "Lilin refleksi dengan sensor kemiringan 3D dan surat khusus dari Naufal.<br><br><strong>INTERAKSI:</strong> Tiup atau sentuh nyala api lilin buat memadamkan api dan baca surat yang diketik mesin tik khusus buat kamu. Gerakkan jarimu di layar buat ngerasain efek 3D tracking lilinnya."
            },
            {
                title: "HALAMAN 6: KARTU POS KENANGAN & VIDEO KITA",
                text: "Kartu pos manis kenangan akhir tahun untuk My Pretty girl.<br><br><strong>PUTAR VIDEO UTAMA:</strong> Ketuk foto di kartu pos buat mutar video kenangan dengan lagu Hindia."
            },
            {
                title: "HALAMAN 7: PETA 3D JARAK 98 KM NAIK MOTOR",
                text: "Diorama 3D perjalanan motor 98 km dari Kacong Ban Surabaya ke rumah Bubby di Malang lewat jalur arteri bawah & pegunungan Arjuno.<br><br><strong>FITUR 3D:</strong> Geser layar buat memutar 3D, atau tekan <strong>'🎥 Mode Sinematik'</strong> buat ngikutin laju motor. Kamu juga bisa ketuk titik singgah: Surabaya, Sidoarjo, Pandaan, Purwodadi, Lawang, dan Malang!"
            },
            {
                title: "HALAMAN 8: KOTAK PESAN KITA",
                text: "Ruang buat kita saling bertukar pesan, doa, dan harapan manis yang tersimpan rapi selamanya di cloud.<br><br><strong>KIRIM PESAN:</strong> Pilih namamu, tulis pesan manis dari hati, lalu tekan <strong>'Kirim Pesan'</strong>."
            }
        ];

        const curGuide = guides[this.index] || guides[0];
        if (tutTitle) tutTitle.innerHTML = curGuide.title;
        if (tutDesc) tutDesc.innerHTML = curGuide.text;

        // Update active chip in tutorial jump bar
        document.querySelectorAll('#page-chips-container .page-chip').forEach((chip, idx) => {
            if (idx === this.index) {
                chip.classList.add('active');
            } else {
                chip.classList.remove('active');
            }
        });

        tutBanner.style.display = 'flex';
        tutBanner.classList.add('modal-opening');
        setTimeout(() => tutBanner.classList.remove('modal-opening'), 350);

        if (this.tutorialTimeout) clearTimeout(this.tutorialTimeout);
        if (autoHide) {
            this.tutorialTimeout = window.setTimeout(() => {
                this.hideTutorial();
            }, 8000);
        }
    }

    public hideTutorial(): void {
        const tutBanner = document.getElementById('tutorial-banner');
        if (!tutBanner) return;
        tutBanner.style.display = 'none';
        if (this.tutorialTimeout) {
            clearTimeout(this.tutorialTimeout);
            this.tutorialTimeout = null;
        }
    }
}
