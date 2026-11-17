// Storage contract and types for Saved Briefs
// Independent: zero imports from UI or external libraries

export interface SavedBrief {
  id: string;
  goal: string;
  context: string[];
  constraints: string[];
  expertRole: string;
  finalPrompt: string;
  finalClarity: number;
  keywords: string[];
  createdAt: number;
  isSyntheticSeed?: boolean;
}

export interface BriefStore {
  isEnabled(): boolean;
  setEnabled(enabled: boolean): boolean;
  saveBrief(brief: Omit<SavedBrief, "id" | "createdAt">): Promise<SavedBrief>;
  listBriefs(): Promise<SavedBrief[]>;
  deleteBrief(id: string): Promise<boolean>;
  deleteAll(): Promise<boolean>;
}

