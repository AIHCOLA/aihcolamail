import { useState, useEffect } from 'react';
import { Mailbox } from './api';

const HISTORY_KEY = 'mailbox_history';

export interface HistoryMailbox {
  id: string;
  email: string;
  created_at: number;
}

export function useMailboxHistory() {
  const [history, setHistory] = useState<HistoryMailbox[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse mailbox history', e);
      }
    }
  }, []);

  const addMailbox = (mailbox: Mailbox) => {
    setHistory(prev => {
      // 避免重复
      if (prev.some(m => m.id === mailbox.id)) return prev;
      
      const newItem: HistoryMailbox = {
        id: mailbox.id,
        email: mailbox.email,
        created_at: mailbox.created_at
      };
      
      const newHistory = [newItem, ...prev].slice(0, 10); // 只保留最近10条
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return { history, addMailbox, clearHistory };
}
