-- ============================================
-- DERS YÖNETİM SİSTEMİ - SUPABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TODOS TABLE
-- ============================================
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own todos" 
    ON todos FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todos" 
    ON todos FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todos" 
    ON todos FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todos" 
    ON todos FOR DELETE 
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_created_at ON todos(created_at DESC);

-- ============================================
-- COURSES TABLE
-- ============================================
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own courses" 
    ON courses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own courses" 
    ON courses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" 
    ON courses FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" 
    ON courses FOR DELETE 
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_courses_user_id ON courses(user_id);

-- ============================================
-- TOPICS TABLE (Course Topics)
-- ============================================
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own topics" 
    ON topics FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own topics" 
    ON topics FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topics" 
    ON topics FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own topics" 
    ON topics FOR DELETE 
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_topics_course_id ON topics(course_id);
CREATE INDEX idx_topics_user_id ON topics(user_id);

-- ============================================
-- SCHEDULE BLOCKS TABLE
-- ============================================
CREATE TABLE schedule_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    day INTEGER CHECK (day >= 1 AND day <= 7) NOT NULL,
    start_hour INTEGER CHECK (start_hour >= 0 AND start_hour <= 23) NOT NULL,
    end_hour INTEGER CHECK (end_hour >= 0 AND end_hour <= 23) NOT NULL,
    color TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own schedule blocks" 
    ON schedule_blocks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own schedule blocks" 
    ON schedule_blocks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own schedule blocks" 
    ON schedule_blocks FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own schedule blocks" 
    ON schedule_blocks FOR DELETE 
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_schedule_blocks_user_id ON schedule_blocks(user_id);
CREATE INDEX idx_schedule_blocks_day ON schedule_blocks(day);

-- ============================================
-- POST-ITS TABLE
-- ============================================
CREATE TABLE postits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT CHECK (type IN ('text', 'image')) NOT NULL,
    text TEXT,
    image_url TEXT,
    color_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE postits ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own postits" 
    ON postits FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own postits" 
    ON postits FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own postits" 
    ON postits FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own postits" 
    ON postits FOR DELETE 
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_postits_user_id ON postits(user_id);
CREATE INDEX idx_postits_created_at ON postits(created_at DESC);

-- ============================================
-- PDFS TABLE
-- ============================================
CREATE TABLE pdfs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE pdfs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own pdfs" 
    ON pdfs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pdfs" 
    ON pdfs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pdfs" 
    ON pdfs FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pdfs" 
    ON pdfs FOR DELETE 
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_pdfs_user_id ON pdfs(user_id);
CREATE INDEX idx_pdfs_created_at ON pdfs(created_at DESC);

-- ============================================
-- POMODORO SESSIONS TABLE
-- ============================================
CREATE TABLE pomodoro_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mode TEXT CHECK (mode IN ('work', 'break', 'longBreak')) NOT NULL,
    duration INTEGER NOT NULL,
    completed BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own pomodoro sessions" 
    ON pomodoro_sessions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro sessions" 
    ON pomodoro_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions" 
    ON pomodoro_sessions FOR DELETE 
    USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_pomodoro_sessions_user_id ON pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_created_at ON pomodoro_sessions(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_blocks_updated_at BEFORE UPDATE ON schedule_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_postits_updated_at BEFORE UPDATE ON postits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pdfs_updated_at BEFORE UPDATE ON pdfs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STORAGE BUCKETS (Run these in Supabase Dashboard)
-- ============================================
-- Create 'pdfs' bucket for PDF files
-- Create 'images' bucket for post-it images
-- Enable RLS on both buckets
-- Add policies:
--   - Users can upload their own files: bucket_id = 'pdfs/images' AND auth.uid() = owner
--   - Users can view their own files: bucket_id = 'pdfs/images' AND auth.uid() = owner
--   - Users can delete their own files: bucket_id = 'pdfs/images' AND auth.uid() = owner
