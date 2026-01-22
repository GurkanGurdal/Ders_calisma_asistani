-- Deneme Analizi Tablosu
-- Supabase SQL Editor'de çalıştırın

CREATE TABLE IF NOT EXISTS exams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('TYT', 'AYT')),
    exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- TYT Dersleri
    tyt_turkce_dogru INTEGER DEFAULT 0,
    tyt_turkce_yanlis INTEGER DEFAULT 0,
    tyt_turkce_bos INTEGER DEFAULT 0,
    
    tyt_matematik_dogru INTEGER DEFAULT 0,
    tyt_matematik_yanlis INTEGER DEFAULT 0,
    tyt_matematik_bos INTEGER DEFAULT 0,
    
    tyt_fen_dogru INTEGER DEFAULT 0,
    tyt_fen_yanlis INTEGER DEFAULT 0,
    tyt_fen_bos INTEGER DEFAULT 0,
    
    tyt_sosyal_dogru INTEGER DEFAULT 0,
    tyt_sosyal_yanlis INTEGER DEFAULT 0,
    tyt_sosyal_bos INTEGER DEFAULT 0,
    
    -- AYT Dersleri (Sayısal)
    ayt_matematik_dogru INTEGER DEFAULT 0,
    ayt_matematik_yanlis INTEGER DEFAULT 0,
    ayt_matematik_bos INTEGER DEFAULT 0,
    
    ayt_fizik_dogru INTEGER DEFAULT 0,
    ayt_fizik_yanlis INTEGER DEFAULT 0,
    ayt_fizik_bos INTEGER DEFAULT 0,
    
    ayt_kimya_dogru INTEGER DEFAULT 0,
    ayt_kimya_yanlis INTEGER DEFAULT 0,
    ayt_kimya_bos INTEGER DEFAULT 0,
    
    ayt_biyoloji_dogru INTEGER DEFAULT 0,
    ayt_biyoloji_yanlis INTEGER DEFAULT 0,
    ayt_biyoloji_bos INTEGER DEFAULT 0,
    
    -- AYT Dersleri (Eşit Ağırlık / Sözel)
    ayt_edebiyat_dogru INTEGER DEFAULT 0,
    ayt_edebiyat_yanlis INTEGER DEFAULT 0,
    ayt_edebiyat_bos INTEGER DEFAULT 0,
    
    ayt_tarih1_dogru INTEGER DEFAULT 0,
    ayt_tarih1_yanlis INTEGER DEFAULT 0,
    ayt_tarih1_bos INTEGER DEFAULT 0,
    
    ayt_cografya1_dogru INTEGER DEFAULT 0,
    ayt_cografya1_yanlis INTEGER DEFAULT 0,
    ayt_cografya1_bos INTEGER DEFAULT 0,
    
    ayt_tarih2_dogru INTEGER DEFAULT 0,
    ayt_tarih2_yanlis INTEGER DEFAULT 0,
    ayt_tarih2_bos INTEGER DEFAULT 0,
    
    ayt_cografya2_dogru INTEGER DEFAULT 0,
    ayt_cografya2_yanlis INTEGER DEFAULT 0,
    ayt_cografya2_bos INTEGER DEFAULT 0,
    
    ayt_felsefe_dogru INTEGER DEFAULT 0,
    ayt_felsefe_yanlis INTEGER DEFAULT 0,
    ayt_felsefe_bos INTEGER DEFAULT 0,
    
    ayt_din_dogru INTEGER DEFAULT 0,
    ayt_din_yanlis INTEGER DEFAULT 0,
    ayt_din_bos INTEGER DEFAULT 0
);

-- RLS Politikaları
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exams" ON exams
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exams" ON exams
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exams" ON exams
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own exams" ON exams
    FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS exams_user_id_idx ON exams(user_id);
CREATE INDEX IF NOT EXISTS exams_exam_date_idx ON exams(exam_date);
CREATE INDEX IF NOT EXISTS exams_exam_type_idx ON exams(exam_type);
