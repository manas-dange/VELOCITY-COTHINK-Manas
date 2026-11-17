// Synthetic seed demo data for Saved Briefs
// 100% synthetic, no personal data

import { SavedBrief } from "./types";

export const SYNTHETIC_SEED_BRIEFS: Omit<SavedBrief, "id" | "createdAt">[] = [
  {
    goal: "I want to build a budgeting app for college students.",
    context: [
      "Undergraduate students running out of funds mid-semester",
      "Overdraft fees impact 70%+ of surveyed students",
    ],
    constraints: ["Zero subscription fee", "Must launch in 6 weeks"],
    expertRole: "Product Strategist",
    finalPrompt: "You are a seasoned Product Strategist. Objective: Build a student micro-budgeting mobile tool for semester allowances...",
    finalClarity: 85,
    keywords: ["budgeting", "budget", "finance", "students", "college", "money", "app"],
    isSyntheticSeed: true,
  },
  {
    goal: "I want to rewrite my resume for a Staff Software Engineer role.",
    context: [
      "Transitioning from Senior to Staff level at a high-growth tech company",
      "Focusing on cross-team technical leadership and distributed system impact",
    ],
    constraints: ["One-page resume limit", "Must highlight business revenue metrics"],
    expertRole: "Career Coach & Talent Strategist",
    finalPrompt: "You are a seasoned Career Coach & Talent Strategist. Objective: Rewrite resume targeting Staff Software Engineer positions...",
    finalClarity: 90,
    keywords: ["resume", "career", "engineer", "staff", "software", "interview", "leadership"],
    isSyntheticSeed: true,
  },
  {
    goal: "I want to draft a product launch email sequence for a developer tool.",
    context: [
      "Open-source CLI tool transitioning to a managed cloud tier",
      "Developers who prioritize speed, privacy, and local-first workflows",
    ],
    constraints: ["3-part drip email series", "Clear call to action for free beta access"],
    expertRole: "Marketing & Content Strategist",
    finalPrompt: "You are an expert Marketing & Content Strategist. Objective: Draft a 3-part product launch email sequence...",
    finalClarity: 80,
    keywords: ["marketing", "email", "launch", "product", "developer", "copy", "sequence"],
    isSyntheticSeed: true,
  },
  {
    goal: "I want to design a real-time collaborative whiteboarding architecture.",
    context: [
      "Multi-user whiteboard canvas requiring sub-50ms sync latency",
      "CRDT or Operational Transformation synchronization engine",
    ],
    constraints: ["WebSockets over Node.js", "Handle up to 100 concurrent peers per room"],
    expertRole: "Software Architect",
    finalPrompt: "You are a Software Architect. Objective: Design real-time collaborative whiteboarding architecture...",
    finalClarity: 85,
    keywords: ["architecture", "system", "realtime", "crdt", "websocket", "canvas", "backend"],
    isSyntheticSeed: true,
  },
  {
    goal: "I want to prepare an executive pitch deck for a seed round fundraise.",
    context: [
      "B2B SaaS workflow automation targeting enterprise compliance officers",
      "$2M seed round target with 3 enterprise pilot LOIs",
    ],
    constraints: ["10-slide deck format", "Strict focus on unit economics and TAM"],
    expertRole: "Product Strategist",
    finalPrompt: "You are a Product Strategist. Objective: Structure a 10-slide seed pitch deck...",
    finalClarity: 80,
    keywords: ["pitch", "seed", "fundraise", "deck", "investor", "saas", "startup"],
    isSyntheticSeed: true,
  },
  {
    goal: "I want to create an automated customer onboarding checklist.",
    context: [
      "Self-service onboarding drop-off after account creation",
      "Need proactive milestone nudges for first valuable action",
    ],
    constraints: ["In-app modal tour", "Maximum 4 required steps"],
    expertRole: "Product Strategist",
    finalPrompt: "You are a Product Strategist. Objective: Design an automated customer onboarding checklist...",
    finalClarity: 75,
    keywords: ["onboarding", "checklist", "retention", "customer", "ux", "activation"],
    isSyntheticSeed: true,
  },
];
