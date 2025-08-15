// Types globaux pour l'application Intimity

export interface Cycle {
  id: string;
  utilisatrice_id: string;
  debut: string;
  fin?: string | null;
  duree?: number | null;
  date_ovulation?: string | null;
  notes?: string | null;
}

export interface CycleInput {
  debut: string;
  fin?: string | null;
  duree?: number | null;
  date_ovulation?: string | null;
  notes?: string | null;
}

export interface Symptom {
  id: string;
  utilisatrice_id: string | null;
  date: string;
  type: string;
  intensite: number | null;
  notes: string | null;
}

export interface SymptomInput {
  date: string;
  type: string;
  intensite: number;
  notes?: string | null;
}

export interface UserPreferences {
  cycleLength: number;
  periodLength: number;
  lastPeriod: string;
  taille?: number;
  poids?: number;
  notifications: boolean;
  reminders: boolean;
  onboardingCompleted: boolean;
  theme?: string;
  language?: string;
  goal?: string;
}

export interface AuthUser {
  id: string; // ID Auth
  email: string;
  name?: string;
  birthDate?: string;
  utilisatriceId?: string; // ID de la table utilisatrices
  taille?: number;
  poids?: number;
} 