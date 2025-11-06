-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  nucleus TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations
CREATE POLICY "Users can view their own donations" 
ON public.donations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own donations" 
ON public.donations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for donation updates
CREATE TRIGGER update_donations_updated_at
BEFORE UPDATE ON public.donations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();