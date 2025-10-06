import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";

interface TagFilterProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  allTags: string[];
}

export const TagFilter = ({ selectedTags, onTagToggle, allTags }: TagFilterProps) => {

  return (
    <motion.div 
      className="space-y-2"
      {...ANIMATION_CONFIGS.staggered(0.1)}
    >
      <h3 className="text-sm font-medium text-muted-foreground">Filter by Tags</h3>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag, index) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <motion.button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-accent text-accent-foreground border border-accent'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border'
              }`}
              {...ANIMATION_CONFIGS.staggered(index * 0.02)}
            >
              {tag}
              {isSelected && (
                <span className="ml-1 text-[10px]">×</span>
              )}
            </motion.button>
          );
        })}
      </div>
      {selectedTags.length > 0 && (
        <motion.button
          onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Clear all tags
        </motion.button>
      )}
    </motion.div>
  );
};