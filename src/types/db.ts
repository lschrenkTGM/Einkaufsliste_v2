// Hinweis: Diese Zeilen-Typen bewusst als `type`-Aliase (nicht `interface`) definiert –
// `interface`-Referenzen als `Row`-Typ in `Database` bringen die generische
// Typauflösung von @supabase/supabase-js (`.update()`) auf `never`.
export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  created_at: string;
};

export type ShoppingList = {
  id: string;
  name: string;
  emoji: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
};

export type ListRole = 'owner' | 'member';

export type ListMember = {
  list_id: string;
  user_id: string;
  role: ListRole;
  joined_at: string;
};

export type Category = {
  id: string;
  list_id: string;
  name: string;
  emoji: string | null;
  sort_order: number;
};

export type Item = {
  id: string;
  list_id: string;
  category_id: string | null;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  checked: boolean;
  checked_by: string | null;
  checked_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      lists: {
        Row: ShoppingList;
        Insert: Partial<ShoppingList> & { name: string };
        Update: Partial<ShoppingList>;
        Relationships: [];
      };
      list_members: {
        Row: ListMember;
        Insert: Partial<ListMember> & { list_id: string; user_id: string };
        Update: Partial<ListMember>;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: Partial<Category> & { list_id: string; name: string };
        Update: Partial<Category>;
        Relationships: [];
      };
      items: {
        Row: Item;
        Insert: Partial<Item> & { id: string; list_id: string; name: string };
        Update: Partial<Item>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      join_list_by_code: { Args: { _code: string }; Returns: string };
      regenerate_invite_code: { Args: { _list_id: string }; Returns: string };
      is_list_member: { Args: { _list_id: string }; Returns: boolean };
    };
  };
};
