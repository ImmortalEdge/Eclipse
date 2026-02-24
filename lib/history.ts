import { HistoryItem } from '@/components/ArchivePage';

const HISTORY_KEY = 'eclipse_history';

export function saveToHistory(item: Omit<HistoryItem, 'id' | 'timestamp'>) {
    if (typeof window === 'undefined') return;

    let history: HistoryItem[] = [];
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
        try {
            history = JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse history', e);
        }
    }

    const newItem: HistoryItem = {
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString()
    };

    // Remove existing item with same query (update)
    history = history.filter(h => h.query !== item.query);
    history.unshift(newItem);

    // Limit to 500 items
    if (history.length > 500) history = history.slice(0, 500);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function getHistoryItem(id: string): HistoryItem | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return null;
    const history: HistoryItem[] = JSON.parse(stored);
    return history.find(h => h.id === id) || null;
}
