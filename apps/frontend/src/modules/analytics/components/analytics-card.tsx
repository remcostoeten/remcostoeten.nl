import { motion } from "framer-motion";
import { ANIMATION_CONFIGS } from "@/modules/shared";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  index: number;
}

export const AnalyticsCard = ({ title, value, change, icon, index }: AnalyticsCardProps) => {
  return (
    <motion.div
      className="bg-card border border-border rounded-lg p-6"
      {...ANIMATION_CONFIGS.staggered(index * 0.1)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {change && (
          <span className={`text-sm font-medium ${
            change.isPositive ? 'text-green-400' : 'text-red-400'
          }`}>
            {change.isPositive ? '+' : ''}{change.value}%
          </span>
        )}
      </div>
    </motion.div>
  );
};