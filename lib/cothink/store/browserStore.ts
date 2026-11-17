// Browser localStorage adapter for BriefStore
// Safe for SSR: Never touches window or localStorage at module evaluation/import time.

import { BriefStore, SavedBrief } from "./types";

const STORAGE_KEY = "cothink_saved_briefs_v1";
const CONSENT_KEY = "cothink_storage_consent_v1";
const MAX_SAVED_BRIEFS = 50;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function safeGetStorage(): Storage | null {
  if (!isBrowser()) return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export class BrowserBriefStore implements BriefStore {
  isEnabled(): boolean {
    const storage = safeGetStorage();
    if (!storage) return false;
    try {
      return storage.getItem(CONSENT_KEY) === "true";
    } catch {
      return false;
    }
  }

  setEnabled(enabled: boolean): boolean {
    const storage = safeGetStorage();
    if (!storage) return false;
    try {
      if (enabled) {
        storage.setItem(CONSENT_KEY, "true");
      } else {
        storage.setItem(CONSENT_KEY, "false");
      }
      return true;
    } catch {
      return false;
    }
  }

  async listBriefs(): Promise<SavedBrief[]> {
    const storage = safeGetStorage();
    if (!storage) return [];

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Validate basic shape
      return parsed.filter(
        (item): item is SavedBrief =>
          item && typeof item === "object" && typeof item.id === "string" && typeof item.goal === "string"
      );
    } catch {
      // Tolerate corrupted storage
      return [];
    }
  }

  async saveBrief(briefData: Omit<SavedBrief, "id" | "createdAt">): Promise<SavedBrief> {
    const storage = safeGetStorage();
    if (!storage) {
      throw new Error("Storage unavailable in current environment");
    }

    const currentBriefs = await this.listBriefs();
    const newBrief: SavedBrief = {
      ...briefData,
      id: `sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    // Prepend new brief
    let updated = [newBrief, ...currentBriefs];

    // Cap at 50 items (drop oldest items from the end)
    if (updated.length > MAX_SAVED_BRIEFS) {
      updated = updated.slice(0, MAX_SAVED_BRIEFS);
    }

    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return newBrief;
    } catch (err: any) {
      throw new Error(`Failed to save brief to storage: ${err?.message || "Storage error"}`);
    }
  }

  async deleteBrief(id: string): Promise<boolean> {
    const storage = safeGetStorage();
    if (!storage) return false;

    try {
      const current = await this.listBriefs();
      const filtered = current.filter((b) => b.id !== id);
      storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  async deleteAll(): Promise<boolean> {
    const storage = safeGetStorage();
    if (!storage) return false;

    try {
      storage.removeItem(STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }
}

export const browserStore = new BrowserBriefStore();

