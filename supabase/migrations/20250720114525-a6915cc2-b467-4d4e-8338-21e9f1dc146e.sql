-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT,
  age INTEGER,
  bio TEXT,
  location TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create jokes table for user humor content
CREATE TABLE public.jokes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'joke' CHECK (type IN ('joke', 'prompt', 'story')),
  is_profile_joke BOOLEAN DEFAULT false,
  ai_humor_score DECIMAL(3,2),
  ai_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create joke ratings table for user interactions
CREATE TABLE public.joke_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  joke_id UUID NOT NULL,
  rater_user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(joke_id, rater_user_id)
);

-- Create matches table for compatible users
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  match_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'mutual', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jokes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.joke_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jokes policies
CREATE POLICY "Jokes are viewable by everyone" 
ON public.jokes FOR SELECT USING (true);

CREATE POLICY "Users can create their own jokes" 
ON public.jokes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jokes" 
ON public.jokes FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jokes" 
ON public.jokes FOR DELETE USING (auth.uid() = user_id);

-- Joke ratings policies
CREATE POLICY "Ratings are viewable by everyone" 
ON public.joke_ratings FOR SELECT USING (true);

CREATE POLICY "Users can rate jokes" 
ON public.joke_ratings FOR INSERT WITH CHECK (auth.uid() = rater_user_id);

CREATE POLICY "Users can update their own ratings" 
ON public.joke_ratings FOR UPDATE USING (auth.uid() = rater_user_id);

-- Matches policies
CREATE POLICY "Users can view their own matches" 
ON public.matches FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches" 
ON public.matches FOR INSERT WITH CHECK (auth.uid() = user1_id);

CREATE POLICY "Users can update matches they're part of" 
ON public.matches FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Add foreign key constraints
ALTER TABLE public.jokes ADD CONSTRAINT fk_jokes_user_id FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);
ALTER TABLE public.joke_ratings ADD CONSTRAINT fk_ratings_joke_id FOREIGN KEY (joke_id) REFERENCES public.jokes(id);
ALTER TABLE public.joke_ratings ADD CONSTRAINT fk_ratings_user_id FOREIGN KEY (rater_user_id) REFERENCES public.profiles(user_id);
ALTER TABLE public.matches ADD CONSTRAINT fk_matches_user1 FOREIGN KEY (user1_id) REFERENCES public.profiles(user_id);
ALTER TABLE public.matches ADD CONSTRAINT fk_matches_user2 FOREIGN KEY (user2_id) REFERENCES public.profiles(user_id);

-- Create indexes for better performance
CREATE INDEX idx_jokes_user_id ON public.jokes(user_id);
CREATE INDEX idx_jokes_profile_joke ON public.jokes(is_profile_joke) WHERE is_profile_joke = true;
CREATE INDEX idx_joke_ratings_joke_id ON public.joke_ratings(joke_id);
CREATE INDEX idx_matches_users ON public.matches(user1_id, user2_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jokes_updated_at
  BEFORE UPDATE ON public.jokes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();