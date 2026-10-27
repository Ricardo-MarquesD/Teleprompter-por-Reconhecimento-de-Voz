import { useEffect, useState } from "react";
import {
  loadSlugs,
  SLUGS_UPDATED_EVENT,
} from "../lib/slugsStorage";
import type { Program } from "../service/api";

export function useSlugs(): Program[] {
  const [programs, setPrograms] = useState<Program[]>(
    () => loadSlugs()?.programs ?? [],
  );

  useEffect(() => {
    function refresh() {
      setPrograms(loadSlugs()?.programs ?? []);
    }

    window.addEventListener(SLUGS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SLUGS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return programs;
}
