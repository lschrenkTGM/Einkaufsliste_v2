// Hinweis: Diese Zeilen-Typen bewusst als `type`-Aliase (nicht `interface`) definiert –
// `interface`-Referenzen als `Row`-Typ in `Database` bringen die generische
// Typauflösung von @supabase/supabase-js (`.update()`) auf `never`.
export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  pin_hash: string;
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
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string; pin_hash: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      lists: {
        Row: ShoppingList;
        Insert: Partial<ShoppingList> & { name: string; owner_id: string };
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
        Insert: Partial<Item> & { id: string; list_id: string; name: string; created_by: string };
        Update: Partial<Item>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      register_user: { Args: { _username: string; _pin: string; _display_name?: string }; Returns: Profile };
      login_user: { Args: { _username: string; _pin: string }; Returns: Profile };
      update_pin: { Args: { _user_id: string; _old_pin: string; _new_pin: string }; Returns: void };
      join_list_by_code: { Args: { _code: string; _user_id: string }; Returns: string };
      regenerate_invite_code: { Args: { _list_id: string; _user_id: string }; Returns: string };
    };
  };
};
