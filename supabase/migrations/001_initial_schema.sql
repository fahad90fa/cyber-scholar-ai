-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  module TEXT,
  sources JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create training_documents table
CREATE TABLE IF NOT EXISTS training_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  chunk_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create custom_prompts table
CREATE TABLE IF NOT EXISTS custom_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create learning_progress table
CREATE TABLE IF NOT EXISTS learning_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  completed_topics JSONB DEFAULT '[]',
  progress_percentage INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, module)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for chat_sessions
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can insert their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can update their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Users can delete their own chat sessions" ON chat_sessions;

CREATE POLICY "Users can view their own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
DROP POLICY IF EXISTS "Users can view their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own chat messages" ON chat_messages;

CREATE POLICY "Users can view their own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for training_documents
DROP POLICY IF EXISTS "Users can view their own training documents" ON training_documents;
DROP POLICY IF EXISTS "Users can insert their own training documents" ON training_documents;
DROP POLICY IF EXISTS "Users can delete their own training documents" ON training_documents;

CREATE POLICY "Users can view their own training documents" ON training_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training documents" ON training_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own training documents" ON training_documents
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for custom_prompts
DROP POLICY IF EXISTS "Users can view their own custom prompts" ON custom_prompts;
DROP POLICY IF EXISTS "Users can insert their own custom prompts" ON custom_prompts;
DROP POLICY IF EXISTS "Users can update their own custom prompts" ON custom_prompts;
DROP POLICY IF EXISTS "Users can delete their own custom prompts" ON custom_prompts;

CREATE POLICY "Users can view their own custom prompts" ON custom_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom prompts" ON custom_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom prompts" ON custom_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom prompts" ON custom_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for learning_progress
DROP POLICY IF EXISTS "Users can view their own learning progress" ON learning_progress;
DROP POLICY IF EXISTS "Users can insert their own learning progress" ON learning_progress;
DROP POLICY IF EXISTS "Users can update their own learning progress" ON learning_progress;

CREATE POLICY "Users can view their own learning progress" ON learning_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own learning progress" ON learning_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning progress" ON learning_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
DROP TRIGGER IF EXISTS update_learning_progress_updated_at ON learning_progress;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_progress_updated_at BEFORE UPDATE ON learning_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for training documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('training_documents', 'training_documents', false)
ON CONFLICT DO NOTHING;

-- Storage policies for training documents
DROP POLICY IF EXISTS "Users can upload their own training documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own training documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own training documents" ON storage.objects;

CREATE POLICY "Users can upload their own training documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'training_documents');

CREATE POLICY "Users can view their own training documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'training_documents');

CREATE POLICY "Users can delete their own training documents" ON storage.objects
  FOR DELETE USING (bucket_id = 'training_documents');
