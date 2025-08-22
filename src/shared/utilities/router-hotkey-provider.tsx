import React, { useState, useEffect, useRef, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';


type TKeyEvent = {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
  timestamp: number;
}

type THotkeyStep = {
  key?: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  maxDelay?: number; 
}

type THotkeyConfig = {
  id?: string;
  sequence: HotkeyStep[] | string; 
  route: string;
  onlyOn?: string | string[] | ((path: string) => boolean); 
  notOn?: string | string[] | ((path: string) => boolean); 
}

type OverlayPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

type TOverlaySettings = {
  enabled: boolean;
  position?: OverlayPosition;
  opacity?: number;
  itemDuration?: number; 
  maxItems?: number;
  easing?: string;
}

type TRouteHotkeysProviderProps = {
  children: ReactNode;
  hotkeys: HotkeyConfig[];
  bufferSize?: number;
  inactivityTimeout?: number; 
  overlay?: OverlaySettings;
}


function normalizeKey(key: string) {
  const keyMap: Record<string, string> = {
    'esc': 'escape',
    'cmd': 'meta',
    'command': 'meta',
    'option': 'alt',
    'space': ' ',
    'spacebar': ' ',
    'return': 'enter',
    'del': 'delete',
    'up': 'arrowup',
    'down': 'arrowdown',
    'left': 'arrowleft',
    'right': 'arrowright',
  };
  
  return keyMap[key.toLowerCase()] || key.toLowerCase();
};


function parseDSL(dsl: string) {
  const steps: HotkeyStep[] = [];
  const parts = dsl.split('>').map(s => s.trim());
  
  for (const part of parts) {
    const step: HotkeyStep = {};
    
    
    const timingMatch = part.match(/\(<=(\d+)\)/);
    if (timingMatch) {
      step.maxDelay = parseInt(timingMatch[1]);
    }
    
    
    const cleanPart = part.replace(/\(<=\d+\)/, '').trim();
    
    
    const tokens = cleanPart.split('+').map(s => s.trim().toLowerCase());
    
    for (const token of tokens) {
      switch (token) {
        case 'ctrl':
        case 'control':
          step.ctrl = true;
          break;
        case 'shift':
          step.shift = true;
          break;
        case 'alt':
          step.alt = true;
          break;
        case 'meta':
        case 'cmd':
        case 'command':
          step.meta = true;
          break;
        default:
          if (token && !step.key) {
            step.key = normalizeKey(token);
          }
      }
    }
    
    steps.push(step);
  }
  
  return steps;
};


function matchesRoute(currentRoute: string, patterns: string | string[] | ((path: string) => boolean)) {
  if (typeof patterns === 'function') {
    return patterns(currentRoute);
  }
  
  const patternArray = Array.isArray(patterns) ? patterns : [patterns];
  return patternArray.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(currentRoute);
    }
    return currentRoute === pattern;
  });
};

function shouldTriggerOnRoute(currentRoute: string, config: HotkeyConfig) {
  
  if (config.onlyOn && !matchesRoute(currentRoute, config.onlyOn)) {
    return false;
  }
  
  
  if (config.notOn && matchesRoute(currentRoute, config.notOn)) {
    return false;
  }
  
  return true;
};

function formatKeyDisplay(event: KeyEvent) {
  const parts: string[] = [];
  if (event.ctrl) parts.push('Ctrl');
  if (event.shift) parts.push('Shift');
  if (event.alt) parts.push('Alt');
  if (event.meta) parts.push('Cmd');
  if (event.key && event.key !== ' ') {
    parts.push(event.key.length === 1 ? event.key.toUpperCase() : 
               event.key.charAt(0).toUpperCase() + event.key.slice(1));
  }
  if (event.key === ' ') parts.push('Space');
  
  return parts.join('+') || 'Key';
};


export const RouteHotkeysProvider: React.FC<RouteHotkeysProviderProps> = ({
  children,
  hotkeys,
  bufferSize = 10,
  inactivityTimeout = 2000,
  overlay = { enabled: false }
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [keyBuffer, setKeyBuffer] = useState<KeyEvent[]>([]);
  const [overlayKeys, setOverlayKeys] = useState<{ id: string; display: string; timestamp: number }[]>([]);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  
  const parsedHotkeys = useMemo(() => {
    return hotkeys.map((config, index) => ({
      ...config,
      id: config.id || `hotkey-${index}`,
      parsedSequence: typeof config.sequence === 'string' 
        ? parseDSL(config.sequence)
        : config.sequence
    }));
  }, [hotkeys]);

  
  function checkSequenceMatch(sequence: HotkeyStep[], buffer: KeyEvent[]) {
    if (sequence.length > buffer.length) return false;
    
    
    const relevantBuffer = buffer.slice(-sequence.length);
    
    for (let i = 0; i < sequence.length; i++) {
      const step = sequence[i];
      const event = relevantBuffer[i];
      
      
      if (step.key && normalizeKey(event.key) !== step.key) {
        return false;
      }
      
      
      if (step.ctrl !== undefined && event.ctrl !== step.ctrl) return false;
      if (step.shift !== undefined && event.shift !== step.shift) return false;
      if (step.alt !== undefined && event.alt !== step.alt) return false;
      if (step.meta !== undefined && event.meta !== step.meta) return false;
      
      
      if (i > 0 && step.maxDelay !== undefined) {
        const timeDiff = event.timestamp - relevantBuffer[i - 1].timestamp;
        if (timeDiff > step.maxDelay) return false;
      }
    }
    
    return true;
  };

  
  function resetInactivityTimer() {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setKeyBuffer([]);
    }, inactivityTimeout);
  };

  
  function addToOverlay(event: KeyEvent) {
    if (!overlay.enabled) return;
    
    const id = Math.random().toString(36).substr(2, 9);
    const display = formatKeyDisplay(event);
    
    setOverlayKeys(prev => {
      const newKeys = [...prev, { id, display, timestamp: Date.now() }];
      return newKeys.slice(-(overlay.maxItems || 5));
    });
    
    
    setTimeout(() => {
      setOverlayKeys(prev => prev.filter(k => k.id !== id));
    }, overlay.itemDuration || 1000);
  };

  
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || 
          target.contentEditable === 'true') {
        return;
      }

      const keyEvent: KeyEvent = {
        key: normalizeKey(e.key),
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        meta: e.metaKey,
        timestamp: Date.now()
      };

      
      addToOverlay(keyEvent);

      
      setKeyBuffer(prev => {
        const newBuffer = [...prev, keyEvent].slice(-bufferSize);
        
        
        for (const config of parsedHotkeys) {
          if (!shouldTriggerOnRoute(location.pathname, config)) continue;
          
          if (checkSequenceMatch(config.parsedSequence, newBuffer)) {
            e.preventDefault();
            navigate(config.route);
            return []; 
          }
        }
        
        return newBuffer;
      });

      resetInactivityTimer();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [parsedHotkeys, location.pathname, navigate, bufferSize, inactivityTimeout, overlay]);

  
  function getOverlayPosition(position: OverlayPosition) {
    switch (position) {
      case 'top-left': return { top: 20, left: 20 };
      case 'top-right': return { top: 20, right: 20 };
      case 'bottom-left': return { bottom: 20, left: 20 };
      case 'bottom-right': return { bottom: 20, right: 20 };
      default: return { top: 20, right: 20 };
    }
  };

  return (
    <>
      {children}
      
      {}
      {overlay.enabled && (
        <div
          style={{
            position: 'fixed',
            ...getOverlayPosition(overlay.position || 'top-right'),
            zIndex: 9999,
            pointerEvents: 'none',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        >
          <AnimatePresence>
            {overlayKeys.map((keyInfo) => (
              <motion.div
                key={keyInfo.id}
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: overlay.opacity || 0.8, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 300,
                  duration: 0.2
                }}
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {keyInfo.display}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </>
  );
};
