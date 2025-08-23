import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { TDesignTokens } from '../config/types';
import { cmsConfig, applyDesignTokens } from '../config/cms-config';

type TDesignTokensState = {
  tokens: TDesignTokens;
  isLoading: boolean;
};

type TDesignTokensAction =
  | { type: 'SET_TOKENS'; payload: TDesignTokens }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_COLOR'; payload: { path: string; value: string } }
  | { type: 'UPDATE_SPACING'; payload: { key: string; value: string } }
  | { type: 'UPDATE_TYPOGRAPHY'; payload: { category: string; key: string; value: any } }
  | { type: 'UPDATE_LAYOUT'; payload: { key: string; value: string } };

function designTokensReducer(state: TDesignTokensState, action: TDesignTokensAction): TDesignTokensState {
  switch (action.type) {
    case 'SET_TOKENS':
      return { ...state, tokens: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'UPDATE_COLOR': {
      const newTokens = { ...state.tokens };
      const pathParts = action.payload.path.split('.');
      let target: any = newTokens.colors;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        target = target[pathParts[i]];
      }
      
      target[pathParts[pathParts.length - 1]] = action.payload.value;
      return { ...state, tokens: newTokens };
    }
    case 'UPDATE_SPACING': {
      return {
        ...state,
        tokens: {
          ...state.tokens,
          spacing: {
            ...state.tokens.spacing,
            [action.payload.key]: action.payload.value,
          },
        },
      };
    }
    case 'UPDATE_TYPOGRAPHY': {
      const newTokens = { ...state.tokens };
      const category = action.payload.category as keyof typeof newTokens.typography;
      
      if (category in newTokens.typography) {
        (newTokens.typography[category] as any)[action.payload.key] = action.payload.value;
      }
      
      return { ...state, tokens: newTokens };
    }
    case 'UPDATE_LAYOUT': {
      return {
        ...state,
        tokens: {
          ...state.tokens,
          layout: {
            ...state.tokens.layout,
            [action.payload.key]: action.payload.value,
          },
        },
      };
    }
    default:
      return state;
  }
}

type TDesignTokensContextValue = {
  state: TDesignTokensState;
  dispatch: React.Dispatch<TDesignTokensAction>;
  updateColor: (path: string, value: string) => void;
  updateSpacing: (key: string, value: string) => void;
  updateTypography: (category: string, key: string, value: any) => void;
  updateLayout: (key: string, value: string) => void;
};

const DesignTokensContext = createContext<TDesignTokensContextValue | undefined>(undefined);

type TProps = {
  children: ReactNode;
};

export function DesignTokensProvider({ children }: TProps) {
  const siteConfig = useQuery(api.site.getSiteConfig);
  
  const [state, dispatch] = useReducer(designTokensReducer, {
    tokens: cmsConfig.designTokens,
    isLoading: true,
  });

  useEffect(() => {
    if (siteConfig?.designTokens) {
      dispatch({ type: 'SET_TOKENS', payload: siteConfig.designTokens });
      dispatch({ type: 'SET_LOADING', payload: false });
      applyDesignTokens(siteConfig.designTokens);
    } else if (siteConfig) {
      dispatch({ type: 'SET_LOADING', payload: false });
      applyDesignTokens(state.tokens);
    }
  }, [siteConfig]);

  function updateColor(path: string, value: string) {
    dispatch({ type: 'UPDATE_COLOR', payload: { path, value } });
    applyDesignTokens(state.tokens);
  }

  function updateSpacing(key: string, value: string) {
    dispatch({ type: 'UPDATE_SPACING', payload: { key, value } });
    applyDesignTokens(state.tokens);
  }

  function updateTypography(category: string, key: string, value: any) {
    dispatch({ type: 'UPDATE_TYPOGRAPHY', payload: { category, key, value } });
    applyDesignTokens(state.tokens);
  }

  function updateLayout(key: string, value: string) {
    dispatch({ type: 'UPDATE_LAYOUT', payload: { key, value } });
    applyDesignTokens(state.tokens);
  }

  const value: TDesignTokensContextValue = {
    state,
    dispatch,
    updateColor,
    updateSpacing,
    updateTypography,
    updateLayout,
  };

  return (
    <DesignTokensContext.Provider value={value}>
      {children}
    </DesignTokensContext.Provider>
  );
}

export function useDesignTokens() {
  const context = useContext(DesignTokensContext);
  if (context === undefined) {
    throw new Error('useDesignTokens must be used within a DesignTokensProvider');
  }
  return context;
}
