type TSelectionAction =
  | { type: 'single'; id: string }
  | { type: 'toggle'; id: string }
  | { type: 'range'; anchorId: string; id: string; orderedIds: string[] }
  | { type: 'clear' };

function selectionReducer(selectedIds: string[], action: TSelectionAction): string[] {
  switch (action.type) {
    case 'single':
      return [action.id];
    
    case 'toggle':
      if (selectedIds.includes(action.id)) {
        return selectedIds.filter(id => id !== action.id);
      }
      return [...selectedIds, action.id];
    
    case 'range':
      const { anchorId, id, orderedIds } = action;
      const anchorIndex = orderedIds.indexOf(anchorId);
      const targetIndex = orderedIds.indexOf(id);
      
      if (anchorIndex === -1 || targetIndex === -1) {
        return [id];
      }
      
      const startIndex = Math.min(anchorIndex, targetIndex);
      const endIndex = Math.max(anchorIndex, targetIndex);
      const rangeIds = orderedIds.slice(startIndex, endIndex + 1);
      
      const newSelection = new Set(selectedIds);
      rangeIds.forEach(rangeId => newSelection.add(rangeId));
      
      return Array.from(newSelection);
    
    case 'clear':
      return [];
    
    default:
      return selectedIds;
  }
}

export { selectionReducer };
export type { TSelectionAction };
