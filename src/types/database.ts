export interface Database {
  public: {
    Tables: {
      utilisatrices: {
        Row: {
          id: string
          nom: string
          prenom: string
          email: string
          date_naissance: string
          taille: number
          poids: number
          symptomes_suivis: string[]
          cree_le: string
          modifie_le: string
        }
        Insert: Omit<Tables['utilisatrices']['Row'], 'id' | 'cree_le' | 'modifie_le'>
        Update: Partial<Tables['utilisatrices']['Insert']>
      }
      parametres: {
        Row: {
          id: string
          utilisatrice_id: string
          theme: string
          notifications: boolean
          langue: 'fr' | 'en' | 'es' | 'de'
          duree_regles: number
          objectif: string
          infos_sante: any
        }
      }
      // ...autres tables similaires
    }
  }
}
