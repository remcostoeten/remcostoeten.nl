import { motion } from "framer-motion";
import { TBlogCategory } from "../types";
import { ANIMATION_CONFIGS } from "@/modules/shared";

interface CategoryFilterProps {
  activeCategory: TBlogCategory;
  onCategoryChange: (category: TBlogCategory) => void;
}

const CATEGORIES: { value: TBlogCategory; label: string }[] = [
  { value: 'all', label: 'All Posts' },
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'best-practices', label: 'Best Practices' },
];

export const CategoryFilter = ({ activeCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <motion.div 
      className="flex flex-wrap gap-2"
      {...ANIMATION_CONFIGS.staggered(0.1)}
    >
      {CATEGORIES.map((category, index) => (
        <motion.button
          key={category.value}
          onClick={() => onCategoryChange(category.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === category.value
              ? 'bg-accent text-accent-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
          {...ANIMATION_CONFIGS.staggered(index * 0.05)}
        >
          {category.label}
        </motion.button>
      ))}
    </motion.div>
  );
};