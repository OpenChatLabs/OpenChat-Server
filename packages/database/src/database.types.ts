export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      app_profiles: {
        Row: {
          id: string;
          username: string;
          email: string;
          role: "admin" | "user";
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          role: "admin" | "user";
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          role?: "admin" | "user";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
