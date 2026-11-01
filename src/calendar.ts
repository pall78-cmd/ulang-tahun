// Calendar and memory milestone logbook module
import { MilestoneDateItem, MONTH_NAMES } from './types';

export const MILESTONES: Record<string, MilestoneDateItem> = {
    '08-03': {
        key: '08-03',
        day: 8,
        month: 2, // Maret
        monthName: 'Maret',
        label: 'Awal Chat Kita',
        badge: '08 MARET // PERCAKAPAN PERTAMA',
        icon: '🌸',
        title: 'Pesan Pertama Kita',
        subtitle: '8 Maret 2026, awal mula kita saling menyapa',
        ref: 'CATATAN-08-MAR',
        body: [
            '<b>Hari pertama notifikasi pesanmu muncul di layar.</b>',
            'Masih ingat banget rasanya ngetik balasan yang dihapus berkali-kali saking mikirin kata yang pas. Dari sapaan formal yang agak kaku, pelan-pelan jadi obrolan panjang yang bikin bolak-balik ngecek HP.',
            'Dari tanggal 8 Maret ini, kita mulai kenal satu sama lain sampai akhirnya nggak pernah absen ngobrol tiap hari.'
        ],
        quote: '"Satu pesan singkat yang ternyata jadi awal dari cerita panjang kita."'
    },
    '24-04': {
        key: '24-04',
        day: 24,
        month: 3, // April
        monthName: 'April',
        label: 'Ultah Bubby',
        badge: '24 APRIL // ULANG TAHUN JEVA',
        icon: '🎂',
        title: 'Ulang Tahun Jeva, My Pretty girl',
        subtitle: '24 April 2026, hari lahir My pacar gweh',
        ref: 'CATATAN-24-APR',
        body: [
            '<b>Hari paling spesial buat perempuan yang paling kusayang.</b>',
            'Tanggal 24 April waktu kamu bertambah usia. Walau kita kepisah jarak 98 km dan ngerayainnya lewat teleponan malam, nada suaramu yang manja waktu dengar ucapan dari aku tetap berasa hangat banget.',
            'Makasih ya udah lahir ke dunia dan jadi sosok yang begitu manis buat aku. Semoga harimu selalu dipenuhi hal-hal baik, tidurmu nyenyak, dan impianmu tercapai satu per satu.'
        ],
        quote: '"Selamat ulang tahun, Bubby. Duniaku jauh lebih hidup sejak ada kamu."'
    },
    '13-12': {
        key: '13-12',
        day: 13,
        month: 11, // Desember
        monthName: 'Desember',
        label: 'Ultah Naufal',
        badge: '13 DESEMBER // ULANG TAHUN NAUFAL',
        icon: '🎁',
        title: 'Hari Ulang Tahun Naufal',
        subtitle: '13 Desember 2026, dilewati bareng kamu',
        ref: 'CATATAN-13-DES',
        body: [
            '<b>Ulang tahun yang terasa beda dari tahun-tahun sebelumnya.</b>',
            'Bertambahnya umur kali ini terasa jauh lebih hangat karena ada ucapan tulus dari kamu di detik pertama pergantian hari lewat teleponan larut malam.',
            'Nggak butuh perayaan yang muluk-muluk, ditemenin ngobrol sama My Pretty girl dan tahu kamu ada di balik layar telepon udah lebih dari cukup.'
        ],
        quote: '"Kehadiranmu adalah hadiah terbaik yang nggak bakal bisa diganti apapun."'
    },
    '31-12': {
        key: '31-12',
        day: 31,
        month: 11, // Desember
        monthName: 'Desember',
        label: 'Malam Tahun Baru',
        badge: '31 DESEMBER // MALAM TAHUN BARU',
        icon: '🎆',
        title: 'Malam Pergantian Tahun Baru',
        subtitle: '31 Desember 2026, menutup setahun bersama',
        ref: 'CATATAN-31-DES',
        body: [
            '<b>Malam terakhir di tahun 2026.</b>',
            'Banyak banget cerita yang kita kumpulin selama setahun ini, dari teleponan berjam-jam pas sleep call nemenin kamu tidur, curhat seharian lewat VN dan pap foto, sampai obrolan receh yang bikin kita ketawa lepas bareng di telepon.',
            'Pas kembang api dinyalain di luar, harapanku sederhana: semoga di tahun yang baru nanti, kita tetap saling jaga dan jarak 98 km ini makin dekat menuju hari kita bisa ketemu langsung.'
        ],
        quote: '"Menutup tahun ini sambil bersyukur punya kamu, dan siap buka lembaran baru bareng lagi."'
    }
};

export class CalendarController {
    public calendarMonth = 2; // Default: Maret 2026
    public calendarYear = 2026;
    public currentDateKey = '08-03';

    public renderCalendar(): void {
        const cal = document.getElementById('calendar-grid');
        const monthLabel = document.getElementById('calendar-month-label');
        const activeTag = document.getElementById('calendar-active-tag');
        const snippetText = document.getElementById('scrapbook-snippet-text');
        const polaroidCaption = document.getElementById('polaroid-caption-text');

        if (monthLabel) {
            monthLabel.innerText = `${MONTH_NAMES[this.calendarMonth].toUpperCase()} ${this.calendarYear}`;
        }

        const milestonesThisMonth = Object.values(MILESTONES).filter(m => m.month === this.calendarMonth);

        if (activeTag) {
            if (milestonesThisMonth.length > 0) {
                activeTag.innerText = milestonesThisMonth.length === 2 ? '2 Momen Spesial' : '1 Momen Spesial';
                activeTag.className = 'text-[7px] px-1 py-0.2 bg-red-900 text-white rounded font-mono uppercase';
            } else {
                activeTag.innerText = 'Buku Harian';
                activeTag.className = 'text-[7px] px-1 py-0.2 bg-black/20 text-gray-700 rounded font-mono uppercase';
            }
        }

        if (snippetText) {
            if (this.calendarMonth === 2) {
                snippetText.innerText = 'Maret 2026: 08 Maret saat pesan pertama kita mulai berbalas.';
            } else if (this.calendarMonth === 3) {
                snippetText.innerText = 'April 2026: 24 April hari lahir Bubby, My Pretty girl.';
            } else if (this.calendarMonth === 11) {
                snippetText.innerText = 'Desember 2026: Dua momen penting, 13 Des Ultah Naufal dan 31 Des Menyambut Tahun Baru.';
            } else {
                snippetText.innerText = `${MONTH_NAMES[this.calendarMonth]} 2026: Lembaran kenangan dan cerita yang kita lalui bersama.`;
            }
        }

        const activeMilestone = MILESTONES[this.currentDateKey];
        if (polaroidCaption) {
            polaroidCaption.innerText = activeMilestone ? activeMilestone.label : `Momen ${this.currentDateKey}`;
        }

        if (!cal) return;
        cal.innerHTML = '';

        const days = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
        days.forEach(d => {
            const h = document.createElement('div');
            h.className = 'font-bold text-[8px] text-gray-500 py-0.5 border-b border-black/10';
            h.innerText = d;
            cal.appendChild(h);
        });

        const firstDayIndex = new Date(this.calendarYear, this.calendarMonth, 1).getDay();
        const totalDays = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();

        for (let x = 0; x < firstDayIndex; x++) {
            const empty = document.createElement('div');
            empty.className = 'py-1 opacity-20 text-gray-400 text-[9px]';
            empty.innerText = '';
            cal.appendChild(empty);
        }

        for (let i = 1; i <= totalDays; i++) {
            const dayEl = document.createElement('div');
            const dayKey = `${i < 10 ? '0' + i : i}-${this.calendarMonth + 1 < 10 ? '0' + (this.calendarMonth + 1) : this.calendarMonth + 1}`;
            const milestone = MILESTONES[dayKey];
            const isMilestone = Boolean(milestone);

            let classes = 'calendar-day p-1 cursor-pointer transition-all rounded relative flex flex-col items-center justify-center min-h-[30px] border border-transparent ';

            if (isMilestone) {
                classes += 'bg-red-50 border-red-900/60 font-bold text-red-950 shadow-xs hover:bg-red-100 ';
            } else {
                classes += 'hover:bg-black/5 text-gray-800 ';
            }

            if (dayKey === this.currentDateKey) {
                classes += 'ring-2 ring-red-900 ring-offset-1 ';
            }

            dayEl.className = classes;

            let inner = `<span class="text-[9.5px] leading-tight ${isMilestone ? 'font-black' : ''}">${i}</span>`;
            if (isMilestone && milestone) {
                inner += `<span class="text-[7px] leading-none mt-0.5" title="${milestone.label}">${milestone.icon}</span>`;
            }

            dayEl.innerHTML = inner;
            dayEl.onclick = () => {
                this.currentDateKey = dayKey;
                this.renderCalendar();
                this.openDateNoteModal(dayKey);
            };

            cal.appendChild(dayEl);
        }

        // Highlight ribbon buttons
        const marBtn = document.getElementById('chip-milestone-mar');
        const aprBtn = document.getElementById('chip-milestone-apr');
        const desBtn = document.getElementById('chip-milestone-des');
        const nyeBtn = document.getElementById('chip-milestone-nye');
        [marBtn, aprBtn, desBtn, nyeBtn].forEach(btn => btn?.classList.remove('ring-2', 'ring-red-900'));

        if (this.currentDateKey === '08-03' && marBtn) marBtn.classList.add('ring-2', 'ring-red-900');
        if (this.currentDateKey === '24-04' && aprBtn) aprBtn.classList.add('ring-2', 'ring-red-900');
        if (this.currentDateKey === '13-12' && desBtn) desBtn.classList.add('ring-2', 'ring-red-900');
        if (this.currentDateKey === '31-12' && nyeBtn) nyeBtn.classList.add('ring-2', 'ring-red-900');
    }

    public changeCalendarMonth(delta: number): void {
        this.calendarMonth += delta;
        if (this.calendarMonth < 0) {
            this.calendarMonth = 11;
            this.calendarYear -= 1;
        } else if (this.calendarMonth > 11) {
            this.calendarMonth = 0;
            this.calendarYear += 1;
        }

        if (this.calendarMonth === 2) this.currentDateKey = '08-03';
        else if (this.calendarMonth === 3) this.currentDateKey = '24-04';
        else if (this.calendarMonth === 11) this.currentDateKey = '13-12';
        else this.currentDateKey = `01-${this.calendarMonth + 1 < 10 ? '0' + (this.calendarMonth + 1) : this.calendarMonth + 1}`;

        this.renderCalendar();
    }

    public selectMilestone(key: string): void {
        const item = MILESTONES[key];
        if (!item) return;

        this.calendarMonth = item.month;
        this.calendarYear = 2026;
        this.currentDateKey = key;
        this.renderCalendar();
        this.openDateNoteModal(key);
    }

    public jumpToMilestone(key: string): void {
        this.selectMilestone(key);
    }

    public openCurrentMilestoneModal(): void {
        this.openDateNoteModal(this.currentDateKey);
    }

    public openDateNoteModal(key = this.currentDateKey): void {
        const modal = document.getElementById('date-note-modal');
        const titleEl = document.getElementById('date-note-title') || document.getElementById('modal-note-title');
        const refEl = document.getElementById('date-note-ref') || document.getElementById('modal-note-ref');
        const badgeEl = document.getElementById('date-note-badge') || document.getElementById('modal-note-badge');
        const bodyEl = document.getElementById('date-note-body') || document.getElementById('modal-note-body');
        const memoInput = (document.getElementById('date-custom-memo') || document.getElementById('modal-note-memo')) as HTMLTextAreaElement | null;
        const footerRefEl = document.getElementById('date-note-footer-ref') || document.getElementById('modal-note-footer-ref');

        if (!modal) return;
        this.currentDateKey = key;

        const milestone = MILESTONES[key];
        if (milestone) {
            if (titleEl) titleEl.innerText = milestone.title;
            if (refEl) refEl.innerText = milestone.subtitle;
            if (badgeEl) badgeEl.innerText = milestone.badge;
            if (footerRefEl) footerRefEl.innerText = `REF: ${milestone.ref}`;
            if (bodyEl) {
                bodyEl.innerHTML = `
                    ${milestone.body.map(p => `<p class="mb-2">${p}</p>`).join('')}
                    <div class="mt-3 pt-2 border-t border-amber-900/20 text-center font-serif italic text-red-950 font-bold text-[11px] bg-amber-50/80 p-2 rounded">
                        ${milestone.quote}
                    </div>
                `;
            }
        } else {
            const parts = key.split('-');
            const d = parseInt(parts[0], 10) || 1;
            const m = (parseInt(parts[1], 10) || 1) - 1;
            const mName = MONTH_NAMES[m] || 'Bulan';
            if (titleEl) titleEl.innerText = `Catatan Kalender: ${d} ${mName} 2026`;
            if (refEl) refEl.innerText = `CATATAN HARIAN // ${d} ${mName.toUpperCase()} 2026`;
            if (badgeEl) badgeEl.innerText = 'CATATAN PRIBADI // MEMORI HARIAN';
            if (footerRefEl) footerRefEl.innerText = `REF: CATATAN-${key}`;
            if (bodyEl) {
                bodyEl.innerHTML = `
                    <p class="mb-2"><b>Tanggal ${d} ${mName} 2026.</b></p>
                    <p class="mb-2">Setiap hari yang kita lalui bersama selalu punya cerita tersendiri. Hari-hari yang tampak sederhana pun terasa berharga saat dilewati dengan saling berbagi kabar dan perhatian.</p>
                    <p class="italic text-gray-700">"Tuliskan catatan atau doa untuk hari ini pada kolom di bawah. Catatan akan tersimpan otomatis di perangkat."</p>
                `;
            }
        }

        if (memoInput) {
            const saved = localStorage.getItem(`milestone_memo_${key}`);
            memoInput.value = saved || '';
        }

        modal.style.display = 'flex';
    }

    public closeDateNoteModal(): void {
        const modal = document.getElementById('date-note-modal');
        if (modal) modal.style.display = 'none';
    }

    public saveCurrentDateMemo(): void {
        const memoInput = (document.getElementById('date-custom-memo') || document.getElementById('modal-note-memo')) as HTMLTextAreaElement | null;
        if (!memoInput) return;
        const val = memoInput.value.trim();
        const key = this.currentDateKey;

        if (val) {
            localStorage.setItem(`milestone_memo_${key}`, val);
        } else {
            localStorage.removeItem(`milestone_memo_${key}`);
        }

        const statusEl = document.getElementById('memo-save-status');
        if (statusEl) {
            statusEl.innerText = '✓ Catatan tersimpan!';
            setTimeout(() => {
                statusEl.innerText = '';
            }, 1800);
        }
    }

    public getNextMilestoneData(): MilestoneDateItem | null {
        const keys = ['08-03', '24-04', '13-12', '31-12'];
        const currentIdx = keys.indexOf(this.currentDateKey);
        const nextIdx = (currentIdx + 1) % keys.length;
        return MILESTONES[keys[nextIdx]] || null;
    }

    public jumpToNextMilestone(): void {
        const next = this.getNextMilestoneData();
        if (next) {
            this.selectMilestone(next.key);
        }
    }
}
