// Comprehensive Acceptance Test Runner for CoThink
// Tests all criteria in PLAN.md Section 11 against the running API

const BASE_URL = "http://localhost:3000/api/cothink";

async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`API error ${res.status}: ${err.error || res.statusText}`);
  }
  return await res.json();
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function run() {
  console.log("\n=======================================================");
  console.log("       COTHINK ACCEPTANCE CHECKLIST VERIFICATION       ");
  console.log("=======================================================\n");

  // 1. Start Session with vague input
  console.log("--- 1. Initial Vague Input & Adaptive Expert Selection ---");
  const s1 = await post("start", { initialIntent: "I want to build a budgeting app." });
  assert(s1.session.brief.goal === "I want to build a budgeting app.", "Brief contains user initial goal");
  assert(s1.session.brief.expert.role === "Product Strategist", `Expert is Product Strategist (got ${s1.session.brief.expert.role})`);
  assert(s1.clarity.total <= 25, `Starting score for vague idea is low: got ${s1.clarity.total}/100`);
  assert(s1.result.type === "question", "First result is an adaptive question");
  assert(s1.result.text.length > 10, "Question is substantive");
  assert(s1.result.targetDimension === "audience" || s1.result.targetDimension === "problem", `Target dimension is core (got ${s1.result.targetDimension})`);

  // 2. Next question visibly reflects user answer
  console.log("\n--- 2. Follow-Up Visibly Reflects User Answer ---");
  const answer1 = "It is specifically for university students who run out of money mid-semester.";
  const s2 = await post("answer", { session: s1.session, answer: answer1 });
  assert(s2.clarity.total > s1.clarity.total, `Clarity score visibly rose: ${s1.clarity.total} -> ${s2.clarity.total} (+${s2.clarity.delta})`);
  assert(s2.result.type === "question", "Received follow up question");
  console.log(`Follow-up Question: "${s2.result.text}"`);
  assert(
    s2.result.text.toLowerCase().includes("student") || s2.result.text.toLowerCase().includes("semester") || s2.result.text.toLowerCase().includes("money"),
    "Next question visibly reflects user's previous answer details"
  );

  // 3. Hedged answer counts as Partial
  console.log("\n--- 3. Hedged / Very Short Answer Counts as Partial ---");
  const hedgedAnswer = "Maybe they struggle with tracking expenses, I guess.";
  const s3 = await post("answer", { session: s2.session, answer: hedgedAnswer });
  const problemStatus = s3.clarity.dimensions.problem.status;
  assert(problemStatus === "partial", `Hedged answer counts as partial (got ${problemStatus})`);

  // 4. Correcting an earlier answer updates brief and lowers score if info removed
  console.log("\n--- 4. Correcting Earlier Answer & Score Recalculation ---");
  const targetTurn = s2.session.turns.find(t => t.answer === answer1);
  assert(!!targetTurn, "Found turn with original answer");
  
  // Replace with vague/short answer
  const sCorrect = await post("correct", {
    session: s3.session,
    turnId: targetTurn.id,
    newAnswer: "just people",
  });
  assert(sCorrect.clarity.total < s3.clarity.total, `Score visibly dropped after removing detail: ${s3.clarity.total} -> ${sCorrect.clarity.total} (${sCorrect.clarity.delta})`);
  const audienceStatus = sCorrect.clarity.dimensions.audience.status;
  assert(audienceStatus === "partial" || audienceStatus === "missing", `Audience status reduced from covered to ${audienceStatus}`);

  // 5. Generate Now skips questions and lists gaps under Unknowns
  console.log("\n--- 5. Generate Now & Unknowns Generation ---");
  const sGenNow = await post("generate-now", { session: sCorrect.session });
  assert(sGenNow.session.stage === "summary", "Session transitioned to summary stage");
  assert(sGenNow.result.type === "summary", "Result is summary type");
  assert(sGenNow.session.brief.unknowns.length > 0, "Unknowns list populated from gaps");
  console.log(`Generated Unknowns: ${sGenNow.session.brief.unknowns.map(u => u.text).join("; ")}`);
  assert(sGenNow.session.brief.unknowns.some(u => u.text.includes("UNKNOWN")), "Unknowns are explicitly labelled [UNKNOWN]");

  // 6. Summary Editing & User Edits Win
  console.log("\n--- 6. Summary Editing ---");
  const editedGoal = "Build a student micro-budgeting mobile tool for semester allowances.";
  const sSummaryEdit = await post("summary", {
    session: sGenNow.session,
    edits: {
      goal: editedGoal,
      context: [
        { id: "c1", text: "Targeting 1st and 2nd year undergraduates living on campus", dimension: "audience" },
        { id: "c2", text: "Students run out of funds by week 8 due to unbudgeted social spending", dimension: "problem" },
        { id: "c3", text: "Survey of 150 students showed 78% overdraft fees", dimension: "evidence" }
      ],
      constraints: [
        { id: "cons1", text: "Must launch in 6 weeks as an MVP with zero monthly fee", dimension: "constraints" }
      ]
    }
  });
  assert(sSummaryEdit.session.brief.goal === editedGoal, "User edit to goal applied");
  assert(sSummaryEdit.clarity.total >= 70, `Score recomputed from user edits: got ${sSummaryEdit.clarity.total}/100`);

  // 7. Confirm Brief
  console.log("\n--- 7. Confirm Brief & Stage Gate ---");
  const sConfirmed = await post("confirm", { session: sSummaryEdit.session });
  assert(sConfirmed.session.stage === "confirmed", "Stage is confirmed");

  // Test confirming without goal throws error
  let rejectedWithoutGoal = false;
  try {
    const invalidSession = { ...sConfirmed.session, brief: { ...sConfirmed.session.brief, goal: "" } };
    await post("confirm", { session: invalidSession });
  } catch (err) {
    rejectedWithoutGoal = true;
  }
  assert(rejectedWithoutGoal, "Confirm rejected when brief has no goal");

  // 8. Editing after confirmation returns to summary
  console.log("\n--- 8. Editing After Confirmation Clears Confirmed Stage ---");
  const sReEdit = await post("summary", {
    session: sConfirmed.session,
    edits: { goal: editedGoal + " (revised)" }
  });
  assert(sReEdit.session.stage === "summary", `Re-editing resets stage to summary (got ${sReEdit.session.stage})`);

  // Re-confirm
  const sReConfirmed = await post("confirm", { session: sReEdit.session });
  assert(sReConfirmed.session.stage === "confirmed", "Re-confirmed successfully");

  // 9. Final Prompt Generation
  console.log("\n--- 9. Final Prompt Assembly & Non-Tool Methods ---");
  const sFinal = await post("final", { session: sReConfirmed.session });
  assert(sFinal.session.stage === "final", "Session in final stage");
  assert(typeof sFinal.result.prompt === "string" && sFinal.result.prompt.length > 100, "Final prompt generated");
  assert(sFinal.result.meta.expertRole === "Product Strategist", "Expert role in meta");
  assert(sFinal.result.meta.methods.length >= 2, "Advisory methods included");
  assert(!sFinal.result.prompt.toLowerCase().includes("tool installed"), "Prompt does not claim tools are installed");
  assert(!sFinal.result.prompt.toLowerCase().includes("skill installed"), "Prompt does not claim skills are installed");
  assert(sFinal.result.prompt.includes("Pre-Mortem"), "Method included as instructions");
  assert(sFinal.result.prompt.includes("Do not invent or fabricate facts"), "Honesty rule present");

  console.log("\n=======================================================");
  console.log("   🎉 ALL ACCEPTANCE CHECKLIST ITEMS PASSED CLEANLY!   ");
  console.log("=======================================================\n");
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

