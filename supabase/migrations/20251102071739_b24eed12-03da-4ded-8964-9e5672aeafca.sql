-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create galleries table
CREATE TABLE public.galleries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT true NOT NULL,
  view_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on galleries
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;

-- Galleries policies
CREATE POLICY "Public galleries are viewable by everyone"
  ON public.galleries FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own galleries"
  ON public.galleries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own galleries"
  ON public.galleries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own galleries"
  ON public.galleries FOR DELETE
  USING (auth.uid() = user_id);

-- Create artworks table
CREATE TABLE public.artworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid REFERENCES public.galleries(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  audio_url text,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on artworks
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Artworks policies (inherit from gallery visibility)
CREATE POLICY "Artworks are viewable if gallery is viewable"
  ON public.artworks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.galleries
      WHERE galleries.id = artworks.gallery_id
      AND (galleries.is_public = true OR galleries.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert artworks to their galleries"
  ON public.artworks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.galleries
      WHERE galleries.id = artworks.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update artworks in their galleries"
  ON public.artworks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.galleries
      WHERE galleries.id = artworks.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete artworks from their galleries"
  ON public.artworks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.galleries
      WHERE galleries.id = artworks.gallery_id
      AND galleries.user_id = auth.uid()
    )
  );

-- Create gallery_likes table
CREATE TABLE public.gallery_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid REFERENCES public.galleries(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(gallery_id, user_id)
);

-- Enable RLS on gallery_likes
ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON public.gallery_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like galleries"
  ON public.gallery_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.gallery_likes FOR DELETE
  USING (auth.uid() = user_id);

-- Create gallery_comments table
CREATE TABLE public.gallery_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id uuid REFERENCES public.galleries(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on gallery_comments
ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON public.gallery_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.gallery_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.gallery_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.gallery_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create user_follows table
CREATE TABLE public.user_follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS on user_follows
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

-- Follows policies
CREATE POLICY "Follows are viewable by everyone"
  ON public.user_follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow others"
  ON public.user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  RETURN new;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_galleries_updated_at
  BEFORE UPDATE ON public.galleries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.gallery_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_galleries_user_id ON public.galleries(user_id);
CREATE INDEX idx_galleries_created_at ON public.galleries(created_at DESC);
CREATE INDEX idx_galleries_view_count ON public.galleries(view_count DESC);
CREATE INDEX idx_artworks_gallery_id ON public.artworks(gallery_id);
CREATE INDEX idx_gallery_likes_gallery_id ON public.gallery_likes(gallery_id);
CREATE INDEX idx_gallery_likes_user_id ON public.gallery_likes(user_id);
CREATE INDEX idx_gallery_comments_gallery_id ON public.gallery_comments(gallery_id);
CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);