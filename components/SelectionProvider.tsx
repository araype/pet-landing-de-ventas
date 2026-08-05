"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

export type SelectedItem = {
  id: number;
  slug: string;
  name: string;
  colors: string;
};

const STORAGE_KEY = "bazar-aracely-selection";
const EMPTY: SelectedItem[] = [];

type Listener = () => void;

function readFromStorage(): SelectedItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

class SelectionStore {
  private items: SelectedItem[] = EMPTY;
  private initialized = false;
  private listeners = new Set<Listener>();

  private ensureInitialized() {
    if (!this.initialized && typeof window !== "undefined") {
      this.items = readFromStorage();
      this.initialized = true;
    }
  }

  getSnapshot = (): SelectedItem[] => {
    this.ensureInitialized();
    return this.items;
  };

  getServerSnapshot = (): SelectedItem[] => EMPTY;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private commit(next: SelectedItem[]) {
    this.items = next;
    this.initialized = true;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage puede fallar en modo privado; la selección solo vive en memoria.
    }
    this.listeners.forEach((listener) => listener());
  }

  toggle(item: SelectedItem) {
    this.ensureInitialized();
    const exists = this.items.some((i) => i.id === item.id);
    this.commit(
      exists ? this.items.filter((i) => i.id !== item.id) : [...this.items, item]
    );
  }

  clear() {
    this.commit([]);
  }
}

const store = new SelectionStore();

type SelectionContextValue = {
  items: SelectedItem[];
  isSelected: (id: number) => boolean;
  toggle: (item: SelectedItem) => void;
  clear: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const isSelected = useCallback(
    (id: number) => items.some((i) => i.id === id),
    [items]
  );
  const toggle = useCallback((item: SelectedItem) => store.toggle(item), []);
  const clear = useCallback(() => store.clear(), []);

  return (
    <SelectionContext.Provider value={{ items, isSelected, toggle, clear }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection(): SelectionContextValue {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error("useSelection debe usarse dentro de <SelectionProvider>.");
  }
  return ctx;
}
