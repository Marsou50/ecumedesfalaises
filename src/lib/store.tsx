import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DrinkEvent, FoodLevel, Profile, Session } from "./bac";
import { getAbv, getDrink } from "./drinks";
import type { EngineConfig, EngineId } from "./recognition";

function getAbvName(drinkId: string) {
  return getDrink(drinkId).name;
}

const STORAGE_KEY = "fin-de-soiree.v2";

export type StoredState = {
  profile: Profile | null;
  session: Session;
  history: Session[];
  onboarded: boolean;
  engine: EngineConfig;
};

export const DEFAULT_ENGINE: EngineConfig = {
  engine: "heuristique",
  api: {
    provider: "gemini",
    apiKey: "",
    model: "gemini-2.5-flash",
    baseUrl: "",
  },
};

export const DEMO_PROFILE: Profile = {
  name: "Camille",
  sex: "homme",
  weightKg: 78,
  heightCm: 178,
  age: 32,
  licence: "confirme",
  metabolism: "moyen",
};

function newSession(): Session {
  return {
    id: `s-${Date.now()}`,
    startedAt: Date.now(),
    events: [],
    food: "repas",
    updatedAt: Date.now(),
  };
}

function load(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      if (parsed && parsed.session) {
        return {
          profile: parsed.profile ?? null,
          session: { ...parsed.session, events: parsed.session.events ?? [] },
          history: parsed.history ?? [],
          onboarded: Boolean(parsed.onboarded),
          engine: { ...DEFAULT_ENGINE, ...(parsed.engine ?? {}), api: { ...DEFAULT_ENGINE.api, ...(parsed.engine?.api ?? {}) } },
        };
      }
    }
  } catch {
    /* ignore */
  }
  return { profile: null, session: newSession(), history: [], onboarded: false, engine: DEFAULT_ENGINE };
}

type Ctx = {
  state: StoredState;
  now: number;
  lastAdded: { name: string; count: number } | null;
  learned: Record<string, number>;
  setProfile: (p: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  addEvent: (e: Omit<DrinkEvent, "id">) => void;
  removeEvent: (id: string) => void;
  shiftEvent: (id: string, deltaMs: number) => void;
  setFood: (f: FoodLevel) => void;
  resetSession: () => void;
  loadDemo: () => void;
  dismissOnboarding: () => void;
  clearAll: () => void;
  setEngine: (patch: { engine?: EngineId; api?: Partial<EngineConfig["api"]> }) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() =>
    typeof window === "undefined"
      ? { profile: null, session: newSession(), history: [], onboarded: false, engine: DEFAULT_ENGINE }
      : load()
  );
  const [now, setNow] = useState(() => Date.now());
  const [lastAdded, setLastAdded] = useState<{ name: string; count: number } | null>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tick = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 10_000);
    const onVis = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
      if (tick.current) clearInterval(tick.current);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [state]);

  const setProfile = useCallback((profile: Profile) => {
    setState((s) => ({ ...s, profile, onboarded: true }));
  }, []);

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) =>
      s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s
    );
  }, []);

  const addEvent = useCallback((e: Omit<DrinkEvent, "id">) => {
    setLastAdded((prev) => ({ name: getAbvName(e.drinkId), count: (prev?.count ?? 0) + 1 }));
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setLastAdded(null), 2600);
    setState((s) => ({
      ...s,
      session: {
        ...s.session,
        events: [...s.session.events, { ...e, id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }],
        updatedAt: Date.now(),
      },
    }));
    setNow(Date.now());
  }, []);

  const removeEvent = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      session: {
        ...s.session,
        events: s.session.events.filter((e) => e.id !== id),
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const shiftEvent = useCallback((id: string, deltaMs: number) => {
    setState((s) => ({
      ...s,
      session: {
        ...s.session,
        events: s.session.events.map((e) =>
          e.id === id ? { ...e, at: Math.min(Date.now(), e.at + deltaMs) } : e
        ),
        updatedAt: Date.now(),
      },
    }));
  }, []);

  const setFood = useCallback((food: FoodLevel) => {
    setState((s) => ({ ...s, session: { ...s.session, food, updatedAt: Date.now() } }));
  }, []);

  const resetSession = useCallback(() => {
    setState((s) => ({
      ...s,
      history: s.session.events.length
        ? [{ ...s.session, updatedAt: Date.now() }, ...s.history].slice(0, 12)
        : s.history,
      session: newSession(),
    }));
    setNow(Date.now());
  }, []);

  const loadDemo = useCallback(() => {
    const base = Date.now();
    const events: DrinkEvent[] = [
      { id: "demo-1", drinkId: "champagne", volumeCl: 12, at: base - 150 * 60_000, source: "photo", confidence: 0.87 },
      { id: "demo-2", drinkId: "vin-blanc", volumeCl: 12, at: base - 105 * 60_000, source: "photo", confidence: 0.91 },
      { id: "demo-3", drinkId: "biere-pinte", volumeCl: 50, at: base - 62 * 60_000, source: "manuel" },
      { id: "demo-4", drinkId: "vin-rouge", volumeCl: 15, at: base - 28 * 60_000, source: "photo", confidence: 0.78 },
    ];
    setState((s) => ({
      ...s,
      profile: s.profile ?? DEMO_PROFILE,
      onboarded: true,
      session: {
        id: `s-${base}`,
        startedAt: base - 160 * 60_000,
        events,
        food: "repas",
        updatedAt: base,
      },
    }));
    setNow(Date.now());
  }, []);

  const dismissOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboarded: true }));
  }, []);

  const setEngine = useCallback(
    (patch: { engine?: EngineId; api?: Partial<EngineConfig["api"]> }) => {
      setState((s) => ({
        ...s,
        engine: {
          engine: patch.engine ?? s.engine.engine,
          api: { ...s.engine.api, ...(patch.api ?? {}) },
        },
      }));
    },
    []
  );

  const clearAll = useCallback(() => {
    setState((s) => ({
      profile: null,
      session: newSession(),
      history: [],
      onboarded: false,
      engine: s.engine, // on garde la configuration du moteur (hors clé API)
    }));
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const learned = useMemo(() => {
    const acc: Record<string, number> = {};
    const all = [state.session, ...state.history];
    for (const s of all) {
      for (const e of s.events) acc[e.drinkId] = (acc[e.drinkId] ?? 0) + 1;
    }
    return acc;
  }, [state.session, state.history]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      now,
      lastAdded,
      learned,
      setProfile,
      updateProfile,
      addEvent,
      removeEvent,
      shiftEvent,
      setFood,
      resetSession,
      loadDemo,
      dismissOnboarding,
      clearAll,
      setEngine,
    }),
    [state, now, lastAdded, learned, setProfile, updateProfile, addEvent, removeEvent, shiftEvent, setFood, resetSession, loadDemo, dismissOnboarding, clearAll, setEngine]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function gramsOf(e: DrinkEvent): number {
  return e.volumeCl * 10 * (getAbv(e.drinkId) / 100) * 0.789;
}
