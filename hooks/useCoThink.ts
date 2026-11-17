import { useState } from "react";

export function useCoThink() {
  const [session, setSession] = useState<any>(null);
  return { session, setSession };
}
