export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          profile: 'marianne' | 'killian';
          goal: string;
          streak: number;
          points: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          profile: 'marianne' | 'killian';
          goal: string;
          streak?: number;
          points?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          profile?: 'marianne' | 'killian';
          goal?: string;
          streak?: number;
          points?: number;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: 'duofit' | 'external';
          workout_name: string;
          duration: number;
          points_earned: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type: 'duofit' | 'external';
          workout_name: string;
          duration: number;
          points_earned?: number;
          created_at?: string;
        };
        Update: {
          workout_name?: string;
          duration?: number;
          points_earned?: number;
        };
      };
      external_activities: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          icon?: string;
        };
      };
      rewards: {
        Row: {
          id: string;
          name: string;
          description: string;
          points_required: number;
          unlocked_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          points_required: number;
          unlocked_at?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          points_required?: number;
          unlocked_at?: string | null;
        };
      };
      couple_stats: {
        Row: {
          id: string;
          total_points: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          total_points?: number;
          updated_at?: string;
        };
        Update: {
          total_points?: number;
          updated_at?: string;
        };
      };
    };
  };
}
