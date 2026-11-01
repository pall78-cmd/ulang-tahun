// Messages and memories storage module with Supabase Sync
import { TransmissionMessage } from './types';
import { messageService, getLocalStoredMessages } from './services/messageService';
import { isSupabaseConfigured } from './lib/supabase';

export function escapeHtml(str: string): string {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

export class MessagesController {
    public currentSender = 'Naufal';
    private cachedMessages: TransmissionMessage[] = [];
    private isSending = false;

    public setSender(name: string): void {
        this.currentSender = name;
        const btnN = document.getElementById('btn-n');
        const btnJeva = document.getElementById('btn-jeva');
        const inputPrompt = document.getElementById('sender-indicator');

        if (btnN && btnJeva) {
            if (name === 'Naufal' || name === 'N' || name === 'OPR_N') {
                this.currentSender = 'Naufal';
                btnN.classList.add('active');
                btnJeva.classList.remove('active');
                if (inputPrompt) inputPrompt.innerText = 'NAUFAL:';
            } else {
                this.currentSender = 'Jeva';
                btnJeva.classList.add('active');
                btnN.classList.remove('active');
                if (inputPrompt) inputPrompt.innerText = 'JEVA:';
            }
        }
    }

    public async loadMsgs(): Promise<void> {
        // First show immediate cached/local messages so UI never flickers
        if (this.cachedMessages.length === 0) {
            this.cachedMessages = getLocalStoredMessages();
            this.renderMsgs(this.cachedMessages);
        }

        const result = await messageService.fetchMessages();
        if (result.data) {
            this.cachedMessages = result.data;
            this.renderMsgs(this.cachedMessages);
        }

        this.updateSyncBadge(result.source);
    }

    private updateSyncBadge(source: 'supabase' | 'local'): void {
        const syncBadge = document.getElementById('msg-sync-badge');
        if (syncBadge) {
            if (source === 'supabase') {
                syncBadge.className = 'text-[7.5px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40 inline-flex items-center gap-1';
                syncBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Cloud Terhubung';
            } else {
                syncBadge.className = 'text-[7.5px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/30 inline-flex items-center gap-1';
                syncBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Arsip Lokal';
            }
        }
    }

    public renderMsgs(data: TransmissionMessage[]): void {
        const box = document.getElementById('msg-display');
        if (!box) return;

        box.innerHTML = (data && data.length > 0) ? data.map(m => `
            <div class="message-bubble ${(m.sender === 'Naufal' || m.sender === 'N' || m.sender === 'OPR_N') ? 'msg-n' : 'msg-jeva'}">
                <span class="block text-[6.5px] font-bold opacity-60 mb-0.5 uppercase">${escapeHtml(m.sender)}</span>
                <div class="leading-relaxed text-[10px] sm:text-[10.5px]">${escapeHtml(m.content)}</div>
            </div>
        `).join('') : '<p class="text-center opacity-40 py-8 italic text-[9px] font-mono">Belum ada pesan tersimpan. Tuliskan pesan manismu di bawah ini.</p>';

        box.scrollTop = box.scrollHeight;
    }

    public async send(): Promise<void> {
        if (this.isSending) return;

        const f = document.getElementById('msg-field') as HTMLInputElement | null;
        const btn = document.getElementById('msg-send-btn') as HTMLButtonElement | null;
        if (!f) return;

        const content = f.value.trim();
        if (!content) {
            this.showAlert('Tuliskan pesanmu terlebih dahulu ya.');
            f.focus();
            return;
        }

        if (content.length > 500) {
            this.showAlert('Pesan maksimal 500 karakter.');
            return;
        }

        this.isSending = true;
        if (btn) {
            btn.disabled = true;
            btn.innerText = 'MENGIRIM...';
        }

        try {
            const sender = this.currentSender || 'Naufal';
            const result = await messageService.submitMessage({ content, sender });

            f.value = '';

            if (result.data) {
                // Check if already in cache
                const exists = this.cachedMessages.some(m => m.id === result.data?.id);
                if (!exists) {
                    this.cachedMessages = [...this.cachedMessages, result.data];
                }
                this.renderMsgs(this.cachedMessages);
            } else if (result.error) {
                this.showAlert(`Gagal menyimpan: ${result.error}`);
            }

            this.updateSyncBadge(result.source);
        } finally {
            this.isSending = false;
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'KIRIM';
            }
        }
    }

    public openModal(): void {
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'flex';
    }

    public closeModal(): void {
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'none';
    }

    public showAlert(msg: string): void {
        const modal = document.getElementById('alert-modal');
        const msgEl = document.getElementById('alert-message');
        if (msgEl) msgEl.textContent = msg;
        if (modal) modal.style.display = 'flex';
    }

    public closeAlert(): void {
        const modal = document.getElementById('alert-modal');
        if (modal) modal.style.display = 'none';
    }

    public async confirmPurge(): Promise<void> {
        this.closeModal();
        this.showAlert('Arsip pesan kenangan disimpan permanen demi menjaga seluruh rekaman tetap utuh. Penghapusan massal dibatasi.');
    }

    public async openDbManager(): Promise<void> {
        const modal = document.getElementById('db-manager-modal');
        if (!modal) return;

        // Fetch latest messages
        await this.loadMsgs();

        const reversedData = [...this.cachedMessages].reverse();
        this.renderDbRecords(reversedData);

        const statusEl = document.getElementById('db-status');
        const latencyEl = document.getElementById('db-latency');

        if (statusEl) {
            if (isSupabaseConfigured()) {
                statusEl.textContent = 'Supabase Cloud PostgreSQL (Sinkronisasi Aktif)';
                statusEl.className = 'text-emerald-400 font-bold';
            } else {
                statusEl.textContent = 'Penyimpanan Cadangan Lokal (Offline Ready)';
                statusEl.className = 'text-amber-400 font-bold';
            }
        }

        if (latencyEl) {
            latencyEl.innerText = 'Menguji latensi...';
        }

        modal.style.display = 'flex';
        void this.pingDatabase();
    }

    public closeDbManager(): void {
        const modal = document.getElementById('db-manager-modal');
        if (modal) modal.style.display = 'none';
    }

    public async pingDatabase(): Promise<void> {
        const pingIndicator = document.getElementById('db-ping-status');
        const latencyEl = document.getElementById('db-latency');

        if (pingIndicator) {
            pingIndicator.classList.add('bg-emerald-400');
        }

        const pingRes = await messageService.pingDatabase();

        if (latencyEl) {
            if (pingRes.status === 'connected') {
                latencyEl.innerText = `${pingRes.latencyMs}ms (Supabase Cloud)`;
            } else {
                latencyEl.innerText = `${pingRes.latencyMs}ms (Penyimpanan Lokal)`;
            }
        }

        if (pingIndicator) {
            setTimeout(() => {
                pingIndicator.classList.remove('bg-emerald-400');
            }, 600);
        }
    }

    public async deleteRecord(id: number): Promise<void> {
        console.info('Delete request for record:', id);
        this.showAlert('Pesan kenangan bersifat arsip permanen (read-only untuk publik). Moderasi memerlukan otentikasi administrator.');
    }

    public renderDbRecords(data: TransmissionMessage[]): void {
        const tbody = document.getElementById('db-records-table');
        const totalEl = document.getElementById('db-total-records');
        if (totalEl) totalEl.textContent = data.length.toString();

        if (!tbody) return;

        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center opacity-40 italic font-mono">Belum ada rekaman pesan.</td></tr>';
            return;
        }

        tbody.innerHTML = data.map(record => {
            const dateStr = record.created_at ? new Date(record.created_at).toLocaleString('id-ID', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) : '-';

            return `
                <tr class="border-b border-gray-800 hover:bg-white/5 transition-colors font-mono">
                    <td class="p-2 text-gray-400">#${escapeHtml(String(record.id).slice(-4))}</td>
                    <td class="p-2 font-bold ${(record.sender === 'Naufal' || record.sender === 'N' || record.sender === 'OPR_N') ? 'text-amber-400' : 'text-blue-400'}">${escapeHtml(record.sender)}</td>
                    <td class="p-2 truncate max-w-[130px] sm:max-w-[200px] text-gray-300" title="${escapeHtml(record.content)}">${escapeHtml(record.content)}</td>
                    <td class="p-2 text-right">
                        <span class="text-emerald-400/90 text-[8px] border border-emerald-800/60 px-1.5 py-0.5 rounded bg-emerald-950/40 inline-flex items-center gap-1 font-mono">
                            <span class="w-1 h-1 rounded-full bg-emerald-400"></span> Tersimpan
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }
}
