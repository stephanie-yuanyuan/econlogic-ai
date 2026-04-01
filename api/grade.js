import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build a rich, mark-scheme-driven prompt
// ─────────────────────────────────────────────────────────────────────────────
function buildMarkSchemePrompt(submission, markScheme) {
  const isEssay        = markScheme.question_type === 'essay';
  const isDataResponse = markScheme.question_type === 'data_response';

  // ── KAA points list ──────────────────────────────────────────────────────
  const kaaList = markScheme.kaa_points
    .map((p, i) => `  [${p.id || `kaa${i + 1}`}] ${p.point}`)
    .join('\n');

  // ── Logic chains ─────────────────────────────────────────────────────────
  const chainList = markScheme.logic_chains
    .map((c) => {
      const steps = c.steps.map((s, i) => `       Step ${i + 1}: ${s}`).join('\n');
      return `  Chain — "${c.chainName}":\n${steps}`;
    })
    .join('\n\n');

  // ── Evaluation points ────────────────────────────────────────────────────
  const evalList = markScheme.eval_points
    .map((p, i) => `  [${p.id || `eval${i + 1}`}] ${p.point}`)
    .join('\n');

  // ── Level descriptors (essays) ────────────────────────────────────────────
  let levelDescriptorSection = '';
  if (isEssay && markScheme.level_descriptors) {
    const ld = markScheme.level_descriptors;
    const kaaLevels = (ld.kaa?.levels || [])
      .map((l) => `    Level ${l.level} (${l.mark_range} marks): ${l.descriptor}`)
      .join('\n');
    const evalLevels = (ld.eval?.levels || [])
      .map((l) => `    Level ${l.level} (${l.mark_range} marks): ${l.descriptor}`)
      .join('\n');

    levelDescriptorSection = `
【KAA Level Descriptors (${ld.kaa?.total_marks ?? markScheme.kaa_marks} marks)】
${kaaLevels}

【Evaluation Level Descriptors (${ld.eval?.total_marks ?? markScheme.eval_marks} marks)】
${evalLevels}`;
  }

  // ── Source material (data response) ──────────────────────────────────────
  const sourceMaterialSection = isDataResponse && markScheme.source_material
    ? `\n【Source Material / Extract (student MUST reference specific data from this)】\n${markScheme.source_material}\n`
    : '';

  // ── Score range instructions ──────────────────────────────────────────────
  let scoreInstruction = '';
  if (isEssay) {
    scoreInstruction = `
For this essay question:
- KAA component: 0–${markScheme.kaa_marks} marks. Use the KAA level descriptors above to determine the level, then award marks within that band.
- Evaluation component: 0–${markScheme.eval_marks} marks. Use the Evaluation level descriptors above.
- Total: KAA + Evaluation (max ${markScheme.total_marks} marks).
- ao1 = knowledge sub-score, ao2 = application sub-score, ao3 = analysis sub-score, ao4 = evaluation sub-score.
  Distribute KAA marks across ao1/ao2/ao3 proportionally (e.g. ao1 ≈ 25%, ao2 ≈ 25%, ao3 ≈ 50% of KAA).
  Set ao4 = evaluation mark.`;
  } else {
    scoreInstruction = `
For this data response question:
- Total: 0–${markScheme.total_marks} marks in a single holistic band.
- Distribute marks across ao1/ao2/ao3/ao4 proportionally.
  ao1 = knowledge (≈20%), ao2 = application/data use (≈25%), ao3 = analysis (≈35%), ao4 = evaluation (≈20%).`;
  }

  // ── Grade boundaries ──────────────────────────────────────────────────────
  const maxMarks = markScheme.total_marks;
  const gradeBoundaries = `
Grade boundaries (% of ${maxMarks}):
  A* ≥ 90% | A ≥ 80% | B ≥ 70% | C ≥ 60% | D ≥ 50% | E ≥ 40% | U < 40%`;

  // ── Data reference check instruction ─────────────────────────────────────
  const dataRefInstruction = isDataResponse
    ? `
【Data Reference Check】
The student MUST cite specific figures from the extract (e.g. the 7.01% inflation rate, the $30bn trade deficit,
the 4.4%→4.9% rate change, the 6.7% GDP growth projection). Check carefully whether they do this.
Set dataReferenceCheck.cited = true/false and list which figures they used in dataReferenceCheck.figuresCited.`
    : '';

  // ─────────────────────────────────────────────────────────────────────────
  return `You are an experienced Pearson Edexcel International A Level (IAL) Economics examiner.
Your task is to mark the student's response against the official mark scheme below and produce a
detailed diagnostic report in JSON format.

════════════════════════════════════════════════════════
QUESTION DETAILS
════════════════════════════════════════════════════════
Question Code : ${markScheme.question_code}
Question Type : ${markScheme.question_type}
Total Marks   : ${markScheme.total_marks}${isEssay ? ` (KAA: ${markScheme.kaa_marks} + Evaluation: ${markScheme.eval_marks})` : ''}
Question      : ${markScheme.question_text}
${sourceMaterialSection}
════════════════════════════════════════════════════════
MARK SCHEME — KAA POINTS
(Check which of these the student has covered, even if expressed differently)
════════════════════════════════════════════════════════
${kaaList}

════════════════════════════════════════════════════════
MARK SCHEME — REQUIRED LOGIC CHAINS
(Identify exactly where each chain breaks in the student's response)
════════════════════════════════════════════════════════
${chainList}

════════════════════════════════════════════════════════
MARK SCHEME — EVALUATION POINTS
(Check which evaluative arguments the student raised)
════════════════════════════════════════════════════════
${evalList}
${levelDescriptorSection}
════════════════════════════════════════════════════════
SCORING INSTRUCTIONS
════════════════════════════════════════════════════════
${scoreInstruction}
${gradeBoundaries}
${dataRefInstruction}

════════════════════════════════════════════════════════
STUDENT RESPONSE
════════════════════════════════════════════════════════
${submission.essay_text}

════════════════════════════════════════════════════════
OUTPUT FORMAT
════════════════════════════════════════════════════════
Return ONLY a valid JSON object. No markdown, no explanation. Use the exact structure below:

{
  "scores": {
    "ao1": <integer, knowledge marks>,
    "ao2": <integer, application marks>,
    "ao3": <integer, analysis marks>,
    "ao4": <integer, evaluation marks>,
    "total": <integer, sum of ao1+ao2+ao3+ao4>
  },
  "grade": "<A*, A, B, C, D, E, or U>",
  "coveredPoints": [
    "<id of each kaa_point the student adequately covered, e.g. kaa1, kaa3>"
  ],
  "missingPoints": [
    {
      "point": "<short label of the missing kaa_point, e.g. 'Exchange rate channel'>",
      "reason": "<one sentence explaining why the student did not earn this point>"
    }
  ],
  "logicGapAnalysis": [
    {
      "chainName": "<chain name from the mark scheme>",
      "studentVersion": "<brief description of how far the student got in this chain>",
      "missingSteps": ["<step text that was skipped or missing>"],
      "suggestion": "<one sentence telling the student exactly what to add to complete this chain>"
    }
  ],${isDataResponse ? `
  "dataReferenceCheck": {
    "cited": <true if student used specific data from the extract, otherwise false>,
    "figuresCited": ["<each specific figure/statistic the student referenced>"],
    "missingFigures": ["<important figures from the extract the student failed to cite>"]
  },` : ''}
  "feedback": "<comprehensive improvement advice, max 150 characters, naming 1–3 specific improvements>",
  "strengths": "<what the student did well, max 80 characters>",
  "aoFeedback": {
    "ao1": "<specific AO1 feedback, max 50 characters>",
    "ao2": "<specific AO2 feedback, max 50 characters>",
    "ao3": "<specific AO3 feedback, max 50 characters>",
    "ao4": "<specific AO4 feedback, max 50 characters>"
  }
}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: build the legacy (rubric-only) prompt when no mark scheme is provided
// ─────────────────────────────────────────────────────────────────────────────
function buildLegacyPrompt(submission, rubric) {
  const rubricText = rubric
    ? JSON.stringify(rubric.criteria, null, 2)
    : 'Use standard Edexcel IAL Economics criteria: AO1 Knowledge (4 marks), AO2 Application (4 marks), AO3 Analysis (6 marks), AO4 Evaluation (6 marks).';

  return `You are an experienced Pearson Edexcel International A Level (IAL) Economics examiner.
Please mark the student's essay against the rubric below and return a diagnostic JSON report.

【Unit】${submission.units?.name || 'Economics'}

【Marking Criteria】
${rubricText}

【Student Essay】
${submission.essay_text}

Return ONLY valid JSON in this exact structure:
{
  "scores": {
    "ao1": <0–4>,
    "ao2": <0–4>,
    "ao3": <0–6>,
    "ao4": <0–6>,
    "total": <sum>
  },
  "grade": "<A*, A, B, C, D, E, or U>",
  "coveredPoints": [],
  "missingPoints": [],
  "logicGapAnalysis": [
    {
      "chainName": "<name>",
      "studentVersion": "<how far student got>",
      "missingSteps": ["<missing step>"],
      "suggestion": "<what to add>"
    }
  ],
  "feedback": "<max 150 characters: 1–3 specific improvements>",
  "strengths": "<max 80 characters>",
  "aoFeedback": {
    "ao1": "<max 50 chars>",
    "ao2": "<max 50 chars>",
    "ao3": "<max 50 chars>",
    "ao4": "<max 50 chars>"
  }
}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main handler
// ─────────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { submissionId, markSchemeId } = req.body;

  if (!submissionId) {
    return res.status(400).json({ error: 'submissionId is required' });
  }

  // ── 1. Fetch submission ──────────────────────────────────────────────────
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select('*, units(name, code, description)')
    .eq('id', submissionId)
    .single();

  if (subError || !submission) {
    return res.status(404).json({ error: '找不到该提交记录' });
  }

  // ── 2. Daily rate limit: max 5 completed submissions per user per day ────
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', submission.user_id)
    .eq('status', 'completed')
    .gte('created_at', `${today}T00:00:00Z`);

  if (count >= 5) {
    await supabase
      .from('submissions')
      .update({ status: 'error' })
      .eq('id', submissionId);
    return res.status(429).json({
      error: '今日提交次数已达上限（5次/天），明天再来吧 😊',
    });
  }

  // ── 3. Mark as processing ─────────────────────────────────────────────────
  await supabase
    .from('submissions')
    .update({ status: 'processing' })
    .eq('id', submissionId);

  try {
    let prompt;

    // ── 4a. Mark-scheme-driven path ──────────────────────────────────────
    if (markSchemeId) {
      const { data: markScheme, error: msError } = await supabase
        .from('mark_schemes')
        .select('*')
        .eq('id', markSchemeId)
        .eq('is_active', true)
        .single();

      if (msError || !markScheme) {
        // Fall back to legacy rubric path rather than hard-failing
        console.warn(`Mark scheme ${markSchemeId} not found — falling back to rubric.`);
        const { data: rubric } = await supabase
          .from('rubrics')
          .select('criteria, title')
          .eq('unit_id', submission.unit_id)
          .eq('is_active', true)
          .single();
        prompt = buildLegacyPrompt(submission, rubric);
      } else {
        prompt = buildMarkSchemePrompt(submission, markScheme);
      }
    } else {
      // ── 4b. Legacy rubric path (no markSchemeId supplied) ─────────────
      const { data: rubric } = await supabase
        .from('rubrics')
        .select('criteria, title')
        .eq('unit_id', submission.unit_id)
        .eq('is_active', true)
        .single();
      prompt = buildLegacyPrompt(submission, rubric);
    }

    // ── 5. Call OpenAI ────────────────────────────────────────────────────
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,          // Low temperature for consistent marking
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Ensure total is always computed correctly (guard against model errors)
    const total =
      (result.scores?.ao1 || 0) +
      (result.scores?.ao2 || 0) +
      (result.scores?.ao3 || 0) +
      (result.scores?.ao4 || 0);

    if (result.scores) result.scores.total = total;

    // ── 6. Persist results ────────────────────────────────────────────────
    await supabase
      .from('submissions')
      .update({
        status:      'completed',
        result_json: result,
        score:       total,
        grade:       result.grade,
        feedback:    result.feedback,
      })
      .eq('id', submissionId);

    return res.status(200).json({ success: true, result });

  } catch (err) {
    console.error('AI grading error:', err);
    await supabase
      .from('submissions')
      .update({ status: 'error' })
      .eq('id', submissionId);
    return res.status(500).json({ error: 'AI 评分失败：' + err.message });
  }
}
