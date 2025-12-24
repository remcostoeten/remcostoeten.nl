'use client';

import { motion } from 'framer-motion';
import { RefreshCw, Play, Settings2 } from 'lucide-react';
import { useState } from 'react';

export type AnimationStyle = 'standard' | 'elastic' | 'wave' | 'rain' | 'spiral';

interface TransitionDebuggerProps {
    currentStyle: AnimationStyle;
    onStyleChange: (style: AnimationStyle) => void;
    onReplay: () => void;
}

export function TransitionDebugger({ currentStyle, onStyleChange, onReplay }: TransitionDebuggerProps) {
    const [isOpen, setIsOpen] = useState(true);

    const styles: { id: AnimationStyle; label: string; icon: string }[] = [
        { id: 'standard', label: 'Standard', icon: '1' },
        { id: 'elastic', label: 'Elastic', icon: '2' },
        { id: 'wave', label: 'Wave', icon: '3' },
        { id: 'rain', label: 'Rain', icon: '4' },
        { id: 'spiral', label: 'Spiral', icon: '5' },
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-[9999] bg-black/90 text-white p-3 rounded-full shadow-lg hover:bg-black transition-colors"
            >
                <Settings2 className="w-5 h-5" />
            </button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 right-4 z-[9999] bg-black/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl w-72 text-white font-sans"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    Transition Debugger
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-white/50 hover:text-white transition-colors text-xs"
                >
                    Hide
                </button>
            </div>

            <div className="space-y-3">
                {/* Style Selection */}
                <div className="grid grid-cols-5 gap-1">
                    {styles.map((style) => (
                        <button
                            key={style.id}
                            onClick={() => onStyleChange(style.id)}
                            className={`
                h-8 rounded-md text-xs font-medium transition-all
                flex items-center justify-center relative
                ${currentStyle === style.id
                                    ? 'bg-white text-black shadow-sm'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                }
              `}
                            title={style.label}
                        >
                            {style.icon}
                            {currentStyle === style.id && (
                                <motion.div
                                    layoutId="active-style"
                                    className="absolute inset-0 border-2 border-indigo-500 rounded-md pointer-events-none"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
                <div className="text-center text-[10px] text-white/40 font-mono uppercase tracking-wider">
                    {styles.find(s => s.id === currentStyle)?.label}
                </div>

                <div className="h-px bg-white/10 my-2" />

                {/* Actions */}
                <button
                    onClick={onReplay}
                    className="w-full h-9 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replay Transition
                </button>
            </div>
        </motion.div>
    );
}
