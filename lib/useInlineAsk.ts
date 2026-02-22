import { useState, useCallback } from 'react';

export interface InlineAskPanelState {
  id: string;
  highlightedText: string;
  resultContext: string;
  paragraphIndex: number;
}

export default function useInlineAsk() {
  const [panels, setPanels] = useState<InlineAskPanelState[]>([]);

  const openPanel = useCallback((props: Omit<InlineAskPanelState, 'id'>) => {
    setPanels(prev => {
      // Close oldest panel if we have 3 already
      if (prev.length >= 3) {
        return [
          {
            id: `panel-${Date.now()}`,
            ...props
          },
          ...prev.slice(0, 2)
        ];
      }

      return [
        {
          id: `panel-${Date.now()}`,
          ...props
        },
        ...prev
      ];
    });
  }, []);

  const closePanel = useCallback((panelId: string) => {
    setPanels(prev => prev.filter(p => p.id !== panelId));
  }, []);

  const clearPanels = useCallback(() => {
    setPanels([]);
  }, []);

  return {
    panels,
    openPanel,
    closePanel,
    clearPanels
  };
}
