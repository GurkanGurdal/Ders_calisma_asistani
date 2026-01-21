-- Links tablosunu oluştur
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın

CREATE TABLE IF NOT EXISTS links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    logo_url TEXT,
    emoji TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) politikalarını etkinleştir
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- Kullanıcıların kendi linklerini görmesine izin ver
CREATE POLICY "Users can view own links" ON links
    FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcıların kendi linklerini eklemesine izin ver
CREATE POLICY "Users can insert own links" ON links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcıların kendi linklerini güncellemesine izin ver
CREATE POLICY "Users can update own links" ON links
    FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcıların kendi linklerini silmesine izin ver
CREATE POLICY "Users can delete own links" ON links
    FOR DELETE USING (auth.uid() = user_id);
