import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { submissionId } = req.body;
  if (!submissionId) {
    return res.status(400).json({ error: 'submissionId is required' });
  }

  // 1. 获取 submission
  const { data: submission, error: subError } = await supabase
    .from('submissions')
    .select('*, units(name, code, description)')
    .eq('id', submissionId)
    .single();

  if (subError || !submission) {
    return res.status(404).json({ error: '找不到该提交记录' });
  }

  // 2. 每日限额检查（每用户每天最多 5 次）
  const today = new Date().toISOString().split('T')[0];
  const { count } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', submission.user_id)
    .eq('status', 'completed')
    .gte('created_at', `${today}T00:00:00Z`);

  if (count >= 5) {
    await supabase.from('submissions').update({ status: 'error' }).eq('id', submissionId);
    return res.status(429).json({ error: '今日提交次数已达上限（5次/天），明天再来吧 😊' });
  }

  // 2. 获取该 unit 的 rubric
  const { data: rubric } = await supabase
    .from('rubrics')
    .select('criteria, title')
    .eq('unit_id', submission.unit_id)
    .eq('is_active', true)
    .single();

  // 3. 标记为 processing
  await supabase
    .from('submissions')
    .update({ status: 'processing' })
    .eq('id', submissionId);

  try {
    // 4. 构建 prompt
    const rubricText = rubric
      ? JSON.stringify(rubric.criteria, null, 2)
      : '使用标准 Edexcel IAL 经济学评分标准：AO1(知识4分) AO2(应用4分) AO3(分析6分) AO4(评估6分)';

    const prompt = `你是一位经验丰富的 Pearson Edexcel International A Level (IAL) 经济学阅卷老师。
请根据以下评分标准，对学生的论文进行评分和诊断。

【教学单元】${submission.units?.name || '经济学'}

【评分标准】
${rubricText}

【学生论文】
${submission.essay_text}

请严格按照以下 JSON 格式输出评分结果（不要输出任何其他内容）：
{
  "scores": {
    "ao1": <0-4的整数>,
    "ao2": <0-4的整数>,
    "ao3": <0-6的整数>,
    "ao4": <0-6的整数>,
    "total": <总分>
  },
  "grade": "<等级: A*, A, B, C, D, E>",
  "logicGap": {
    "hasGap": <true或false>,
    "title": "<逻辑断层标题，如'传导机制不完整'>",
    "description": "<具体描述哪里有逻辑跳步，100字以内>",
    "chain": [
      {"text": "<步骤1>", "status": "<ok或missing>"},
      {"text": "<步骤2>", "status": "<ok或missing>"},
      {"text": "<步骤3>", "status": "<ok或missing>"},
      {"text": "<步骤4>", "status": "<ok或missing>"}
    ]
  },
  "feedback": "<综合改进建议，150字以内，具体指出1-3个可改进的地方>",
  "strengths": "<论文的优点，80字以内>",
  "aoFeedback": {
    "ao1": "<AO1具体反馈，50字以内>",
    "ao2": "<AO2具体反馈，50字以内>",
    "ao3": "<AO3具体反馈，50字以内>",
    "ao4": "<AO4具体反馈，50字以内>"
  }
}`;

    // 5. 调用 OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    const total = (result.scores?.ao1 || 0) + (result.scores?.ao2 || 0) +
                  (result.scores?.ao3 || 0) + (result.scores?.ao4 || 0);

    // 6. 保存结果到数据库
    await supabase
      .from('submissions')
      .update({
        status: 'completed',
        result_json: result,
        score: total,
        grade: result.grade,
        feedback: result.feedback,
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
