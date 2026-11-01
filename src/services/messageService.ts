// Service for fetching and submitting messages to Supabase public.messages with offline fallback
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { SupabaseMessage, CreateMessagePayload, MessageServiceResult } from '../types/message';

const STORAGE_KEY_V3 = 'dossier_transmissions_jeva_v3';
const STORAGE_KEY_V2 = 'dossier_transmissions_jeva_v2';

export const INITIAL_FALLBACK_MESSAGES: SupabaseMessage[] = [
    {
        id: 1,
        sender: 'Naufal',
        content: 'Satu tahun penuh cerita manis bareng kamu, Bubby. Makasih ya udah selalu ada dari awal chat Maret kemarin sampai sekarang. Senang banget bisa nemenin dan ditemenin My Pretty girl walau kita LDR.',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        is_hidden: false
    },
    {
        id: 2,
        sender: 'Jeva',
        content: 'Tahun ini banyak banget momen seru walau seringnya lewat teleponan, VN curhat, dan pap foto makanan pas istirahat siang. Makasih juga ya udah selalu sabar nemenin dan dengerin ceritaku tiap malam. Semoga tahun depan jarak 98 km kita makin dekat ya!',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        is_hidden: false
    }
];

export function getLocalStoredMessages(): SupabaseMessage[] {
    try {
        const storedV3 = localStorage.getItem(STORAGE_KEY_V3);
        if (storedV3 !== null) {
            const parsed = JSON.parse(storedV3);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter(m => m && typeof m.content === 'string' && typeof m.sender === 'string');
            }
        }

        // Check v2 as backup without overwriting
        const storedV2 = localStorage.getItem(STORAGE_KEY_V2);
        if (storedV2 !== null) {
            const parsed = JSON.parse(storedV2);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed.filter(m => m && typeof m.content === 'string' && typeof m.sender === 'string');
            }
        }

        // Initialize v3 with default fallback
        localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(INITIAL_FALLBACK_MESSAGES));
        return [...INITIAL_FALLBACK_MESSAGES];
    } catch {
        return [...INITIAL_FALLBACK_MESSAGES];
    }
}

export function saveLocalStoredMessages(msgs: SupabaseMessage[]): void {
    try {
        localStorage.setItem(STORAGE_KEY_V3, JSON.stringify(msgs));
    } catch (e) {
        console.warn('LocalStorage save warning:', e);
    }
}

export class MessageService {
    /**
     * Fetch messages from Supabase public.messages table ordered by created_at ascending.
     * If network fails or Supabase is unconfigured, seamlessly falls back to local storage.
     */
    public async fetchMessages(): Promise<MessageServiceResult<SupabaseMessage[]>> {
        const supabase = getSupabase();

        if (!supabase) {
            return {
                data: getLocalStoredMessages(),
                error: null,
                source: 'local'
            };
        }

        try {
            const { data, error } = await supabase
                .from('messages')
                .select('id, content, sender, created_at, is_hidden')
                .eq('is_hidden', false)
                .order('created_at', { ascending: true });

            if (error) {
                console.warn('[Supabase] Fetch warning, falling back to local storage:', error.message);
                return {
                    data: getLocalStoredMessages(),
                    error: error.message,
                    source: 'local'
                };
            }

            // Distinguish an empty result from network failure
            const messages = (data || []) as SupabaseMessage[];
            
            // Mirror to local cache for offline availability
            if (messages.length > 0) {
                saveLocalStoredMessages(messages);
            }

            return {
                data: messages,
                error: null,
                source: 'supabase'
            };
        } catch (err: any) {
            console.warn('[Supabase] Fetch exception, falling back to local storage:', err);
            return {
                data: getLocalStoredMessages(),
                error: err?.message || 'Network error',
                source: 'local'
            };
        }
    }

    /**
     * Submits a message to Supabase public.messages.
     * Crucially does NOT pass 'id' or 'created_at', letting PostgreSQL generate them automatically.
     */
    public async submitMessage(payload: CreateMessagePayload): Promise<MessageServiceResult<SupabaseMessage>> {
        const trimmedContent = (payload.content || '').trim();
        const trimmedSender = (payload.sender || '').trim() || 'Naufal';

        if (!trimmedContent) {
            return {
                data: null,
                error: 'Pesan tidak boleh kosong',
                source: 'local'
            };
        }

        if (trimmedContent.length > 500) {
            return {
                data: null,
                error: 'Pesan maksimal 500 karakter',
                source: 'local'
            };
        }

        const supabase = getSupabase();

        if (supabase) {
            try {
                // Insert only content and sender. Postgres generates id and default created_at.
                const { data, error } = await supabase
                    .from('messages')
                    .insert({
                        content: trimmedContent,
                        sender: trimmedSender
                    })
                    .select('id, content, sender, created_at, is_hidden')
                    .single();

                if (error) {
                    console.warn('[Supabase] Insert error, persisting to local storage:', error.message);
                    const localFallback = this.saveToLocalOnly(trimmedContent, trimmedSender);
                    return {
                        data: localFallback,
                        error: error.message,
                        source: 'local'
                    };
                }

                const savedMsg = data as SupabaseMessage;
                // Update local storage cache mirror
                const local = getLocalStoredMessages();
                saveLocalStoredMessages([...local, savedMsg]);

                return {
                    data: savedMsg,
                    error: null,
                    source: 'supabase'
                };
            } catch (err: any) {
                console.warn('[Supabase] Insert exception, persisting to local storage:', err);
                const localFallback = this.saveToLocalOnly(trimmedContent, trimmedSender);
                return {
                    data: localFallback,
                    error: err?.message || 'Connection failed',
                    source: 'local'
                };
            }
        }

        // If Supabase is unconfigured, store locally
        const localFallback = this.saveToLocalOnly(trimmedContent, trimmedSender);
        return {
            data: localFallback,
            error: null,
            source: 'local'
        };
    }

    private saveToLocalOnly(content: string, sender: string): SupabaseMessage {
        const currentMsgs = getLocalStoredMessages();
        const newMsg: SupabaseMessage = {
            id: Date.now(),
            content,
            sender,
            created_at: new Date().toISOString(),
            is_hidden: false
        };
        const updated = [...currentMsgs, newMsg];
        saveLocalStoredMessages(updated);
        return newMsg;
    }

    /**
     * Ping database to measure roundtrip latency and connectivity status
     */
    public async pingDatabase(): Promise<{ status: 'connected' | 'local_fallback'; latencyMs: number }> {
        const start = performance.now();
        const supabase = getSupabase();

        if (!supabase) {
            return { status: 'local_fallback', latencyMs: 2 };
        }

        try {
            const { error } = await supabase
                .from('messages')
                .select('id')
                .limit(1);

            const duration = Math.round(performance.now() - start);
            if (error) {
                return { status: 'local_fallback', latencyMs: duration };
            }
            return { status: 'connected', latencyMs: duration };
        } catch {
            return { status: 'local_fallback', latencyMs: Math.round(performance.now() - start) };
        }
    }
}

export const messageService = new MessageService();
