import { motion } from 'framer-motion';
import { RecentSpotify } from './RecentSpotify';
import type { ListeningStatusProps } from './types';

export const ListeningStatus = ({ 
  prefixText = "while listening to", 
  tracks, 
  interval = 3000,
  className = ""
}: ListeningStatusProps) => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.4, 0.0, 0.2, 1]
      }}
      className={`text-sm text-muted-foreground ${className}`}
    >
      {prefixText}{' '}
      <RecentSpotify tracks={tracks} interval={interval} />
    </motion.p>
  );
};
