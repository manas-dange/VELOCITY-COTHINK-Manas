import { useCallback, useEffect, useState } from "react";
import { browserStore, SavedBrief } from "@/lib/cothink";
import { SYNTHETIC_SEED_BRIEFS } from "@/lib/cothink/store/seedData";

export function useSavedBriefs() {
  const [consent, setConsent] = useState(false);
  const [briefs, setBriefs] = useState<SavedBrief[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state from browserStore on mount
  const refresh = useCallback(async () => {
    try {
      const enabled = browserStore.isEnabled();
      setConsent(enabled);
      if (enabled) {
        const list = await browserStore.listBriefs();
        setBriefs(list);
      } else {
        setBriefs([]);
      }
    } catch {
      setBriefs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleConsent = (enabled: boolean) => {
    browserStore.setEnabled(enabled);
    setConsent(enabled);
    if (enabled) {
      browserStore.listBriefs().then(setBriefs);
    } else {
      setBriefs([]);
    }
  };

  const saveBrief = async (briefData: Omit<SavedBrief, "id" | "createdAt">) => {
    if (!consent) return null;
    const saved = await browserStore.saveBrief(briefData);
    await refresh();
    return saved;
  };

  const deleteBrief = async (id: string) => {
    await browserStore.deleteBrief(id);
    await refresh();
  };

  const deleteAll = async () => {
    await browserStore.deleteAll();
    await refresh();
  };

  const loadDemoData = async () => {
    if (!consent) {
      toggleConsent(true);
    }
    for (const demo of SYNTHETIC_SEED_BRIEFS) {
      await browserStore.saveBrief(demo);
    }
    await refresh();
  };

  return {
    consent,
    briefs,
    loading,
    toggleConsent,
    saveBrief,
    deleteBrief,
    deleteAll,
    loadDemoData,
    refresh,
  };
}

