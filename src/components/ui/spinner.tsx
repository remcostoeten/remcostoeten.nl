import { motion } from 'framer-motion';

type TProps = {
  size?: number;
  color?: string;
};

export function Spinner({ size = 50, color = '#000' }: TProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      style={{
        width: size,
        height: size,
        border: `4px solid ${color}`,
        borderTop: `4px solid transparent`,
        borderRadius: '50%'
      }}
    />
  );
}
