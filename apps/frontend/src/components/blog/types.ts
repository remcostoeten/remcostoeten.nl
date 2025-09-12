export interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface BlogHeaderProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  categories: Category[];
}

export interface BlogPostListProps {
  posts: BlogPost[];
}

export interface BlogPostCardProps {
  post: BlogPost;
}