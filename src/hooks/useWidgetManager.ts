"use client";

import { useState, useCallback, useRef } from 'react';

export type TWidgetPosition = {
  x: number;
  y: number;
};

export type TWidgetConfig = {
  id: string;
  type: string;
  position: TWidgetPosition;
  zIndex: number;
  isDragging: boolean;
  isHovered: boolean;
  config?: Record<string, any>;
};

export type TDropZone = {
  id: string;
  name: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  acceptedTypes: string[];
  isActive: boolean;
  widgets: string[];
};

export type TWidgetManagerState = {
  widgets: Record<string, TWidgetConfig>;
  dropZones: Record<string, TDropZone>;
  selectedWidget: string | null;
  draggedWidget: string | null;
  hoveredZone: string | null;
  isDragMode: boolean;
};

export type TWidgetManagerActions = {
  addWidget: (type: string, position?: TWidgetPosition) => string;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<TWidgetConfig>) => void;
  moveWidget: (id: string, position: TWidgetPosition) => void;
  selectWidget: (id: string | null) => void;
  startDrag: (id: string) => void;
  endDrag: () => void;
  createDropZone: (zone: Omit<TDropZone, 'widgets'>) => void;
  updateDropZone: (id: string, updates: Partial<TDropZone>) => void;
  assignWidgetToZone: (widgetId: string, zoneId: string) => void;
  setHoveredZone: (zoneId: string | null) => void;
  toggleDragMode: () => void;
  getWidgetsByZone: (zoneId: string) => TWidgetConfig[];
  getWidgetAtPosition: (position: TWidgetPosition) => TWidgetConfig | null;
  saveConfiguration: () => string;
  loadConfiguration: (config: string) => void;
};

export function useWidgetManager(): TWidgetManagerState & TWidgetManagerActions {
  const [state, setState] = useState<TWidgetManagerState>({
    widgets: {},
    dropZones: {},
    selectedWidget: null,
    draggedWidget: null,
    hoveredZone: null,
    isDragMode: false,
  });

  const nextZIndex = useRef(1000);
  const widgetCounter = useRef(0);

  const addWidget = useCallback((type: string, position: TWidgetPosition = { x: 100, y: 100 }): string => {
    const id = `widget-${type}-${++widgetCounter.current}`;
    const newWidget: TWidgetConfig = {
      id,
      type,
      position,
      zIndex: nextZIndex.current++,
      isDragging: false,
      isHovered: false,
      config: {},
    };

    setState(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [id]: newWidget,
      },
    }));

    return id;
  }, []);

  const removeWidget = useCallback((id: string) => {
    setState(prev => {
      const { [id]: removed, ...remainingWidgets } = prev.widgets;
      
      // Remove widget from any drop zones
      const updatedDropZones = Object.fromEntries(
        Object.entries(prev.dropZones).map(([zoneId, zone]) => [
          zoneId,
          {
            ...zone,
            widgets: zone.widgets.filter(widgetId => widgetId !== id),
          },
        ])
      );

      return {
        ...prev,
        widgets: remainingWidgets,
        dropZones: updatedDropZones,
        selectedWidget: prev.selectedWidget === id ? null : prev.selectedWidget,
        draggedWidget: prev.draggedWidget === id ? null : prev.draggedWidget,
      };
    });
  }, []);

  const updateWidget = useCallback((id: string, updates: Partial<TWidgetConfig>) => {
    setState(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [id]: { ...prev.widgets[id], ...updates },
      },
    }));
  }, []);

  const moveWidget = useCallback((id: string, position: TWidgetPosition) => {
    updateWidget(id, { position });
  }, [updateWidget]);

  const selectWidget = useCallback((id: string | null) => {
    setState(prev => ({
      ...prev,
      selectedWidget: id,
    }));
  }, []);

  const startDrag = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      draggedWidget: id,
      widgets: {
        ...prev.widgets,
        [id]: { ...prev.widgets[id], isDragging: true },
      },
    }));
  }, []);

  const endDrag = useCallback(() => {
    setState(prev => {
      const updatedWidgets = { ...prev.widgets };
      if (prev.draggedWidget) {
        updatedWidgets[prev.draggedWidget] = {
          ...updatedWidgets[prev.draggedWidget],
          isDragging: false,
        };
      }

      return {
        ...prev,
        draggedWidget: null,
        widgets: updatedWidgets,
      };
    });
  }, []);

  const createDropZone = useCallback((zone: Omit<TDropZone, 'widgets'>) => {
    setState(prev => ({
      ...prev,
      dropZones: {
        ...prev.dropZones,
        [zone.id]: { ...zone, widgets: [] },
      },
    }));
  }, []);

  const updateDropZone = useCallback((id: string, updates: Partial<TDropZone>) => {
    setState(prev => ({
      ...prev,
      dropZones: {
        ...prev.dropZones,
        [id]: { ...prev.dropZones[id], ...updates },
      },
    }));
  }, []);

  const assignWidgetToZone = useCallback((widgetId: string, zoneId: string) => {
    setState(prev => {
      const zone = prev.dropZones[zoneId];
      if (!zone) return prev;

      // Remove widget from other zones
      const updatedDropZones = Object.fromEntries(
        Object.entries(prev.dropZones).map(([id, zone]) => [
          id,
          {
            ...zone,
            widgets: zone.widgets.filter(wId => wId !== widgetId),
          },
        ])
      );

      // Add widget to target zone
      updatedDropZones[zoneId] = {
        ...updatedDropZones[zoneId],
        widgets: [...updatedDropZones[zoneId].widgets, widgetId],
      };

      return {
        ...prev,
        dropZones: updatedDropZones,
      };
    });
  }, []);

  const setHoveredZone = useCallback((zoneId: string | null) => {
    setState(prev => ({
      ...prev,
      hoveredZone: zoneId,
    }));
  }, []);

  const toggleDragMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDragMode: !prev.isDragMode,
    }));
  }, []);

  const getWidgetsByZone = useCallback((zoneId: string): TWidgetConfig[] => {
    const zone = state.dropZones[zoneId];
    if (!zone) return [];

    return zone.widgets.map(widgetId => state.widgets[widgetId]).filter(Boolean);
  }, [state.dropZones, state.widgets]);

  const getWidgetAtPosition = useCallback((position: TWidgetPosition): TWidgetConfig | null => {
    const widgets = Object.values(state.widgets);
    
    // Find widget at position (simplified collision detection)
    return widgets.find(widget => {
      const distance = Math.sqrt(
        Math.pow(widget.position.x - position.x, 2) +
        Math.pow(widget.position.y - position.y, 2)
      );
      return distance < 50; // 50px tolerance
    }) || null;
  }, [state.widgets]);

  const saveConfiguration = useCallback((): string => {
    return JSON.stringify({
      widgets: state.widgets,
      dropZones: state.dropZones,
    });
  }, [state.widgets, state.dropZones]);

  const loadConfiguration = useCallback((config: string) => {
    try {
      const parsed = JSON.parse(config);
      setState(prev => ({
        ...prev,
        widgets: parsed.widgets || {},
        dropZones: parsed.dropZones || {},
        selectedWidget: null,
        draggedWidget: null,
        hoveredZone: null,
      }));
    } catch (error) {
      console.error('Failed to load widget configuration:', error);
    }
  }, []);

  return {
    ...state,
    addWidget,
    removeWidget,
    updateWidget,
    moveWidget,
    selectWidget,
    startDrag,
    endDrag,
    createDropZone,
    updateDropZone,
    assignWidgetToZone,
    setHoveredZone,
    toggleDragMode,
    getWidgetsByZone,
    getWidgetAtPosition,
    saveConfiguration,
    loadConfiguration,
  };
}
