export type PostCategory = string;
export type PostTarget = 'writing' | 'work';

export const POST_CATEGORIES: PostCategory[] = ['Tugas', 'Hobi', 'Research cysec'];

export interface Post {
  id: string;
  target?: PostTarget;
  title: string;
  slug: string;
  short_description: string;
  category: PostCategory;
  cover_image?: string | null;
  content: string;
  status: 'draft' | 'published';
  year?: string | null;
  role?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  images?: string[] | null;
  created_at: string;
  updated_at?: string;
}

export interface PostFormData {
  target?: PostTarget;
  title: string;
  slug: string;
  short_description: string;
  category: PostCategory;
  cover_image?: string;
  content: string;
  status: 'draft' | 'published';
  year?: string;
  role?: string;
  link_url?: string;
  link_label?: string;
  images?: string[];
}
