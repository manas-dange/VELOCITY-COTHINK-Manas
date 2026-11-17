import { useState } from "react";
import { BriefEdits, ClarityScore, Session } from "@/lib/cothink/types";

export function useCoThink() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalResult, setFinalResult] = useState<{
    prompt: string;
    meta: any;
  } | null>(null);

  const callApi = async (endpoint: string, payload: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cothink/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "An error occurred");
      }

      if (data.session) {
        setSession(data.session);
      }
      return data;
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const start = async (initialIntent?: string) => {
    setFinalResult(null);
    return await callApi("start", { initialIntent });
  };

  const answer = async (text: string) => {
    if (!session) return;
    return await callApi("answer", { session, answer: text });
  };

  const correct = async (turnId: string, newAnswer: string) => {
    if (!session) return;
    return await callApi("correct", { session, turnId, newAnswer });
  };

  const requestGenerateNow = async () => {
    if (!session) return;
    return await callApi("generate-now", { session });
  };

  const editSummary = async (edits: BriefEdits) => {
    if (!session) return;
    return await callApi("summary", { session, edits });
  };

  const confirm = async () => {
    if (!session) return;
    return await callApi("confirm", { session });
  };

  const generateFinal = async () => {
    if (!session) return;
    const data = await callApi("final", { session });
    if (data.result?.prompt) {
      setFinalResult(data.result);
    }
    return data;
  };

  const reset = () => {
    setSession(null);
    setError(null);
    setFinalResult(null);
  };

  return {
    session,
    loading,
    error,
    finalResult,
    start,
    answer,
    correct,
    generateNow: requestGenerateNow,
    editSummary,
    confirm,
    generateFinal,
    reset,
  };
}
