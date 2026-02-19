"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";

export interface CandidatePersona {
  type: "candidate";
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  headline: string | null;
}

export interface HiringManagerPersona {
  type: "hiring-manager";
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  title: string | null;
  activeCompanyId: string | null;
}

export type Persona = CandidatePersona | HiringManagerPersona | null;

interface PersonaContextType {
  persona: Persona;
  setPersona: (persona: Persona) => void;
  setActiveCompany: (companyId: string) => void;
  clearActiveCompany: () => void;
  clearPersona: () => void;
  isLoading: boolean;
}

const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

const STORAGE_KEY = "jobboard-persona";

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(null);
  const [isLoading, setIsLoading] = useState(true);
  const personaRef = useRef<Persona>(null);
  personaRef.current = persona;

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPersonaState(JSON.parse(stored) as Persona);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
    if (p) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const setActiveCompany = useCallback((companyId: string) => {
    const p = personaRef.current;
    if (p?.type === "hiring-manager") {
      const updated: HiringManagerPersona = {
        ...p,
        activeCompanyId: companyId,
      };
      setPersonaState(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, []);

  const clearActiveCompany = useCallback(() => {
    const p = personaRef.current;
    if (p?.type === "hiring-manager") {
      const updated: HiringManagerPersona = {
        ...p,
        activeCompanyId: null,
      };
      setPersonaState(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  }, []);

  const clearPersona = useCallback(() => {
    setPersonaState(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PersonaContext.Provider
      value={{
        persona,
        setPersona,
        setActiveCompany,
        clearActiveCompany,
        clearPersona,
        isLoading,
      }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const context = useContext(PersonaContext);
  if (context === undefined) {
    throw new Error("usePersona must be used within a PersonaProvider");
  }
  return context;
}
