'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import { ANIMATION_CONFIGS } from "@/modules/shared";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export const SearchFilter = ({ 
  searchQuery, 
  onSearchChange, 
  placeholder = "Search posts..." 
}: SearchFilterProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.div 
      className="relative w-full max-w-md"
      {...ANIMATION_CONFIGS.staggered(0.1)}
    >
      <div className={`relative transition-all duration-200 ${
        isFocused ? 'scale-105' : 'scale-100'
      }`}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-secondary border border-border rounded-lg 
                   text-foreground placeholder-muted-foreground
                   focus:ring-2 focus:ring-accent/20 focus:border-accent
                   transition-all duration-200"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 
                     text-muted-foreground hover:text-foreground
                     transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 p-2 
                   bg-secondary border border-border rounded-lg shadow-lg z-10"
        >
          <p className="text-xs text-muted-foreground">
            Press Enter to search or clear to show all posts
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};