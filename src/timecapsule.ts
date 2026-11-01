// Time capsule and real-time WIB countdown module
import confetti from 'canvas-confetti';

export class TimeCapsuleController {
    public isCapsuleSimulatedUnlocked = false;
    public capsuleInterval: number | null = null;

    public openTimeCapsule(): void {
        const modal = document.getElementById('time-capsule-modal');
        if (modal) modal.style.display = 'flex';
        this.updateTimeCapsuleCountdown();
    }

    public closeTimeCapsule(): void {
        const modal = document.getElementById('time-capsule-modal');
        if (modal) modal.style.display = 'none';
        if (this.capsuleInterval) {
            clearTimeout(this.capsuleInterval);
            this.capsuleInterval = null;
        }
    }

    public toggleCapsuleSimulation(): void {
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
    }

    public updateTimeCapsuleCountdown(): void {
        // Target: 31 Desember 2026, 23:59:59 WIB (Asia/Jakarta, UTC+7)
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
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            currentTimeDisplay.innerText = `${wibDate} - ${wibTime} WIB`;
        }

        if (distance <= 0 || this.isCapsuleSimulatedUnlocked) {
            if (lockedDiv) lockedDiv.classList.add('hidden');
            if (unlockedDiv) unlockedDiv.classList.remove('hidden');
            if (daysEl) daysEl.innerText = "00";
            if (hoursEl) hoursEl.innerText = "00";
            if (minutesEl) minutesEl.innerText = "00";
            if (secondsEl) secondsEl.innerText = "00";
        } else {
            if (lockedDiv) lockedDiv.classList.remove('hidden');
            if (unlockedDiv) unlockedDiv.classList.add('hidden');

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (daysEl) daysEl.innerText = days < 10 ? `0${days}` : days.toString();
            if (hoursEl) hoursEl.innerText = hours < 10 ? `0${hours}` : hours.toString();
            if (minutesEl) minutesEl.innerText = minutes < 10 ? `0${minutes}` : minutes.toString();
            if (secondsEl) secondsEl.innerText = seconds < 10 ? `0${seconds}` : seconds.toString();
        }

        const modal = document.getElementById('time-capsule-modal');
        if (modal && modal.style.display === 'flex') {
            if (this.capsuleInterval) clearTimeout(this.capsuleInterval);
            this.capsuleInterval = window.setTimeout(() => this.updateTimeCapsuleCountdown(), 1000);
        }
    }
}
