"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface VisitCounterContextValue {
  count: number | null;
  unavailable: boolean;
}

const VisitCounterContext = React.createContext<VisitCounterContextValue>({
  count: null,
  unavailable: false,
});

export function VisitCounterProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [count, setCount] = React.useState<number | null>(null);
  const [unavailable, setUnavailable] = React.useState(false);
  const lastCountedPath = React.useRef<string | null>(null);
  const requestSequence = React.useRef(0);

  React.useEffect(() => {
    if (!pathname || lastCountedPath.current === pathname) return;

    lastCountedPath.current = pathname;
    const sequence = ++requestSequence.current;

    async function recordVisit() {
      try {
        const response = await fetch("/api/visits", { method: "POST" });
        if (!response.ok) {
          throw new Error(`Visit counter returned HTTP ${response.status}`);
        }

        const data: unknown = await response.json();
        if (
          typeof data !== "object" ||
          data === null ||
          !("count" in data) ||
          typeof data.count !== "number" ||
          !Number.isSafeInteger(data.count) ||
          data.count < 0
        ) {
          throw new Error("Visit counter returned an invalid count");
        }

        if (sequence === requestSequence.current) {
          setCount(data.count);
          setUnavailable(false);
        }
      } catch (error) {
        console.error("Unable to record portfolio visit:", error);
        if (sequence === requestSequence.current) {
          setCount(null);
          setUnavailable(true);
        }
      }
    }

    void recordVisit();
  }, [pathname]);

  return (
    <VisitCounterContext.Provider value={{ count, unavailable }}>
      {children}
    </VisitCounterContext.Provider>
  );
}

export function useVisitCount() {
  return React.useContext(VisitCounterContext);
}
