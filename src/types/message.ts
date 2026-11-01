// TypeScript interfaces matching Supabase public.messages table

export interface SupabaseMessage {
    id: number;
    content: string;
    sender: string;
    created_at: string;
    is_hidden?: boolean;
}

export interface CreateMessagePayload {
    content: string;
    sender: string;
}

export interface MessageServiceResult<T> {
    data: T | null;
    error: string | null;
    source: 'supabase' | 'local';
}
