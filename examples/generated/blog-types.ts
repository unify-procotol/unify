// Auto-generated types for blog

export interface user {
  id?: number;
  name: string;
  email: string;
  age?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface post {
  id?: number;
  title: string;
  content?: string;
  author_id: number;
  status?: string;
  published_at?: Date | string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface comment {
  id?: number;
  post_id: number;
  author_name: string;
  author_email?: string;
  content: string;
  status?: string;
  created_at?: Date | string;
}

export interface tag {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: Date | string;
}

export interface post_tag {
  id?: number;
  post_id: number;
  tag_id: number;
  created_at?: Date | string;
}

