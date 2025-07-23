-- Création de la table user_preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cycle_length INTEGER DEFAULT 28,
    period_length INTEGER DEFAULT 5,
    last_period DATE DEFAULT CURRENT_DATE,
    notifications BOOLEAN DEFAULT true,
    reminders BOOLEAN DEFAULT true,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Politique RLS (Row Level Security)
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir/modifier leurs propres préférences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id); 

ALTER TABLE public.parametres ADD COLUMN IF NOT EXISTS infos_sante jsonb; 