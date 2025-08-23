import { useReducer, useCallback, useRef, useEffect } from "react";
import { ContactPopover } from "./contact-popover";

type TProps = {
  label: string;
}

type TState = {
  hoverRoot: boolean;
  hoverPanel: boolean;
  manualOpen: boolean;
  openAbove: boolean;
}

type TAction = 
  | { type: 'rootEnter' }
  | { type: 'rootLeave' }
  | { type: 'panelEnter' }
  | { type: 'panelLeave' }
  | { type: 'close' }
  | { type: 'persist' }
  | { type: 'setOpenAbove'; payload: boolean }

function contactPopoverReducer(state: TState, action: TAction): TState {
  switch (action.type) {
    case 'rootEnter':
      return { ...state, hoverRoot: true, manualOpen: true };
    case 'rootLeave':
      return { ...state, hoverRoot: false };
    case 'panelEnter':
      return { ...state, hoverPanel: true, manualOpen: true };
    case 'panelLeave':
      return { ...state, hoverPanel: false };
    case 'persist':
      return { ...state, manualOpen: true };
    case 'close':
      return { ...state, manualOpen: false, hoverRoot: false, hoverPanel: false };
    case 'setOpenAbove':
      return { ...state, openAbove: action.payload };
    default:
      return state;
  }
}

export function ContactPopoverTrigger({ label }: TProps) {
  const [state, dispatch] = useReducer(contactPopoverReducer, {
    hoverRoot: false,
    hoverPanel: false,
    manualOpen: false,
    openAbove: false
  });
  
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);

  const isVisible = state.hoverRoot || state.hoverPanel || state.manualOpen;

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    const popoverHeight = 400;
    
    dispatch({ type: 'setOpenAbove', payload: spaceBelow < popoverHeight && spaceAbove > spaceBelow });
  }, []);

  const handleRootEnter = useCallback(() => {
    calculatePosition();
    dispatch({ type: 'rootEnter' });
  }, [calculatePosition]);

  const handleRootLeave = useCallback(() => {
    dispatch({ type: 'rootLeave' });
  }, []);

  const handlePanelEnter = useCallback(() => {
    dispatch({ type: 'panelEnter' });
  }, []);

  const handlePanelLeave = useCallback(() => {
    dispatch({ type: 'panelLeave' });
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
      dispatch({ type: 'close' });
    }
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("resize", calculatePosition);
      window.addEventListener("scroll", calculatePosition);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition);
    };
  }, [isVisible, handleClickOutside, calculatePosition]);

  return (
    <span ref={containerRef} className="relative inline-block">
      <button
        ref={triggerRef}
        onMouseEnter={handleRootEnter}
        onMouseLeave={handleRootLeave}
        className="underline text-accent hover:text-accent/80 transition-colors cursor-pointer"
        aria-label={`Open contact form for ${label}`}
        aria-expanded={isVisible}
        aria-haspopup="dialog"
      >
        {label}
      </button>
      <ContactPopover 
        isVisible={isVisible} 
        openAbove={state.openAbove}
        onPanelEnter={handlePanelEnter}
        onPanelLeave={handlePanelLeave}
      />
    </span>
  );
}
