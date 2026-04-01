-- ============================================
-- EconLogic AI — Mark Schemes Seed Data
-- Based on Pearson Edexcel IAL Economics
-- Paper 2 (Unit 2): Macroeconomic Performance and Policy
-- Run this in Supabase SQL Editor AFTER schema.sql
-- ============================================

-- Prerequisite: mark_schemes table must exist.
-- If not yet created, run the following DDL first:
-- ============================================
CREATE TABLE IF NOT EXISTS public.mark_schemes (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id           UUID        NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  question_code     TEXT        NOT NULL,
  title             TEXT        NOT NULL,
  question_text     TEXT        NOT NULL,
  question_type     TEXT        NOT NULL CHECK (question_type IN ('data_response', 'essay', 'short_answer')),
  total_marks       INTEGER     NOT NULL,
  kaa_marks         INTEGER,          -- Knowledge, Application & Analysis marks (essay only)
  eval_marks        INTEGER,          -- Evaluation marks (essay only)
  source_material   TEXT,             -- Context/extract for data response questions
  kaa_points        JSONB       NOT NULL DEFAULT '[]',
  logic_chains      JSONB       NOT NULL DEFAULT '[]',
  eval_points       JSONB       NOT NULL DEFAULT '[]',
  level_descriptors JSONB,            -- Level-based marking (essay questions)
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (unit_id, question_code)
);

ALTER TABLE public.mark_schemes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mark schemes"
  ON public.mark_schemes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage mark schemes"
  ON public.mark_schemes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.mark_schemes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- Q12(e) — Data Response (8 marks)
-- India Interest Rate Rise, June 2022
-- ============================================
INSERT INTO public.mark_schemes (
  unit_id,
  question_code,
  title,
  question_text,
  question_type,
  total_marks,
  kaa_marks,
  eval_marks,
  source_material,
  kaa_points,
  logic_chains,
  eval_points,
  level_descriptors
)
VALUES (
  (SELECT id FROM public.units WHERE code = 'U2'),
  'Q12e',
  'Effects of Interest Rate Rise on Indian Economy',
  'With reference to the information provided and your own knowledge, discuss the likely effects of the increase in the base rate of interest on the Indian economy.',
  'data_response',
  8,
  NULL,
  NULL,
  'Extract A — Indian Economy (2022): India''s annual inflation rate rose to 7.01% in June 2022, significantly above the central bank''s 2–6% target band. The country''s trade deficit reached $30 billion. The Indian rupee had been falling in value against the US dollar. In response, the Reserve Bank of India raised its base rate of interest from 4.4% to 4.9% (an increase of 0.5 percentage points) in June 2022. The Asian Development Bank (ADB) projected India''s GDP growth at 6.7% for 2022.',
  '[
    {
      "id": "kaa1",
      "point": "Interest rates are a monetary policy instrument used by central banks (e.g. Reserve Bank of India) to influence the economy."
    },
    {
      "id": "kaa2",
      "point": "India raised its base rate from 4.4% to 4.9% — an increase of 0.5 percentage points — in June 2022 (data reference required)."
    },
    {
      "id": "kaa3",
      "point": "Higher interest rates → cost of borrowing rises → households and firms less willing/able to take out loans → consumption falls."
    },
    {
      "id": "kaa4",
      "point": "Higher interest rates → return on saving increases → incentive to save rather than spend → consumption falls further."
    },
    {
      "id": "kaa5",
      "point": "Negative wealth effect: higher interest rates → house prices fall (as mortgage costs rise) → households feel less wealthy → consumer confidence falls → consumption falls."
    },
    {
      "id": "kaa6",
      "point": "Variable rate mortgage/loan holders: monthly repayments increase → disposable income falls → consumption falls."
    },
    {
      "id": "kaa7",
      "point": "Lower consumption → lower demand for imports → improvement in the trade balance / current account (partially offsetting the $30bn trade deficit)."
    },
    {
      "id": "kaa8",
      "point": "Higher interest rates → hot money inflows (international investors seeking higher returns) → demand for rupee increases → rupee appreciates → Indian exports become relatively more expensive abroad → export volumes fall → trade balance worsens."
    },
    {
      "id": "kaa9",
      "point": "Higher interest rates → cost of borrowing for business investment rises → investment (I) falls → AD falls (AD = C + I + G + X – M)."
    },
    {
      "id": "kaa10",
      "point": "AD falls → real output falls → real GDP growth falls (below the ADB projected 6.7% figure)."
    },
    {
      "id": "kaa11",
      "point": "Lower AD → lower demand-pull inflation → helps bring India''s inflation (7.01%) back towards the 2–6% target band."
    },
    {
      "id": "kaa12",
      "point": "Lower real output → firms produce less → demand for labour falls → unemployment rises."
    }
  ]',
  '[
    {
      "chainName": "Consumption Channel",
      "steps": [
        "Interest rate ↑ (4.4% → 4.9%)",
        "Cost of borrowing ↑",
        "Incentive to save ↑ / Disincentive to spend",
        "Consumer spending (C) ↓",
        "AD ↓"
      ]
    },
    {
      "chainName": "Investment Channel",
      "steps": [
        "Interest rate ↑",
        "Cost of financing investment ↑",
        "Business investment (I) ↓",
        "AD ↓"
      ]
    },
    {
      "chainName": "Exchange Rate Channel",
      "steps": [
        "Interest rate ↑",
        "Hot money inflows (higher returns attract foreign capital)",
        "Demand for Indian rupee ↑",
        "Rupee appreciates",
        "Indian exports more expensive in foreign currency",
        "Export volumes (X) ↓ / Imports cheaper (M ↑)",
        "Net exports (X–M) ↓ → AD ↓ / Trade balance worsens"
      ]
    },
    {
      "chainName": "AD to Macroeconomic Outcomes",
      "steps": [
        "AD ↓ (leftward shift of AD curve)",
        "Real output (GDP) ↓",
        "GDP growth falls below projected 6.7%",
        "Unemployment ↑",
        "Demand-pull inflation ↓ (towards 2–6% target)"
      ]
    }
  ]',
  '[
    {
      "id": "eval1",
      "point": "The size of the rate change is small (only 0.5 percentage points), so the impact on borrowing costs and consumer behaviour may be limited in the short run."
    },
    {
      "id": "eval2",
      "point": "Positive effect: helps control India''s high inflation (7.01% in June 2022), bringing it back towards the 2–6% target band — supports price stability."
    },
    {
      "id": "eval3",
      "point": "Positive effect: higher interest rates help stabilise/appreciate the rupee, preventing further depreciation and reducing the cost of imports (which may also lower imported inflation)."
    },
    {
      "id": "eval4",
      "point": "India''s exports are heavily services-based (e.g. IT, outsourcing) rather than goods — the exchange rate appreciation effect on export competitiveness may therefore be more limited than in a goods-heavy economy."
    },
    {
      "id": "eval5",
      "point": "Significant time lags: the full transmission of an interest rate change typically takes 18–24 months to work through the economy, so the effects may not be immediate."
    },
    {
      "id": "eval6",
      "point": "If global demand is already falling (e.g. due to the 2022 global slowdown), the rate rise may compound recessionary pressures and accelerate the fall in GDP growth."
    },
    {
      "id": "eval7",
      "point": "Policy conflict / trade-off: the interest rate rise helps reduce inflation and stabilise the rupee, but simultaneously risks worsening economic growth and increasing unemployment — a classic monetary policy dilemma."
    }
  ]',
  NULL
)
ON CONFLICT (unit_id, question_code) DO UPDATE SET
  title             = EXCLUDED.title,
  question_text     = EXCLUDED.question_text,
  question_type     = EXCLUDED.question_type,
  total_marks       = EXCLUDED.total_marks,
  source_material   = EXCLUDED.source_material,
  kaa_points        = EXCLUDED.kaa_points,
  logic_chains      = EXCLUDED.logic_chains,
  eval_points       = EXCLUDED.eval_points,
  level_descriptors = EXCLUDED.level_descriptors,
  updated_at        = NOW();

-- ============================================
-- Q13 — Essay Question (20 marks)
-- Supply-side Policies to Increase Productivity
-- KAA: 12 marks | Evaluation: 8 marks
-- ============================================
INSERT INTO public.mark_schemes (
  unit_id,
  question_code,
  title,
  question_text,
  question_type,
  total_marks,
  kaa_marks,
  eval_marks,
  source_material,
  kaa_points,
  logic_chains,
  eval_points,
  level_descriptors
)
VALUES (
  (SELECT id FROM public.units WHERE code = 'U2'),
  'Q13',
  'Evaluate Supply-side Policies to Increase Productivity',
  'Evaluate supply-side policies that a government could use to increase the country''s productivity.',
  'essay',
  20,
  12,
  8,
  NULL,
  '[
    {
      "id": "kaa1",
      "point": "Supply-side policies are government measures designed to increase the productive capacity of the economy by improving productivity, competition and incentives in factor and product markets."
    },
    {
      "id": "kaa2",
      "point": "Successful supply-side policies shift the Long Run Aggregate Supply (LRAS) curve to the right, increasing both actual and potential growth without generating inflationary pressure."
    },
    {
      "id": "kaa3",
      "point": "Investment in education and training → improves human capital quality → workers become more skilled and productive → output per worker (labour productivity) increases."
    },
    {
      "id": "kaa4",
      "point": "Government investment in infrastructure (roads, railways, broadband) → reduces firms'' transport/logistics costs → improves efficiency of production → total factor productivity rises."
    },
    {
      "id": "kaa5",
      "point": "Reducing welfare benefits / stricter eligibility criteria → incentivises unemployed individuals to seek work → increases labour force participation → output per worker can rise as skill mix improves."
    },
    {
      "id": "kaa6",
      "point": "Privatisation of state-owned enterprises → introduces profit motive and competition → firms have stronger incentive to innovate and invest in R&D → productivity improves."
    },
    {
      "id": "kaa7",
      "point": "Deregulation → reduces bureaucratic compliance costs and barriers to entry → markets become more contestable → incumbent firms must improve efficiency to remain competitive → productivity rises."
    },
    {
      "id": "kaa8",
      "point": "Reducing corporation tax → increases post-tax profits → firms have greater retained earnings to invest in new technology and capital equipment → capital per worker rises → labour productivity improves."
    },
    {
      "id": "kaa9",
      "point": "Reducing income tax rates → increases the financial reward for working → incentivises employees to work harder, take on more hours, or acquire new skills → productivity rises (supply-side incentive effect)."
    }
  ]',
  '[
    {
      "chainName": "Education & Human Capital",
      "steps": [
        "Government spending on education and vocational training ↑",
        "Quality of human capital ↑ (workers gain higher-level skills)",
        "Labour productivity ↑ (output per worker rises)",
        "LRAS shifts rightward",
        "Potential output ↑",
        "Sustainable (non-inflationary) economic growth"
      ]
    },
    {
      "chainName": "Privatisation & Competition",
      "steps": [
        "State-owned firms are privatised",
        "Competitive pressures and profit motive intensify",
        "Firms invest more in R&D and process innovation",
        "Productivity ↑",
        "Unit production costs ↓",
        "LRAS shifts rightward"
      ]
    },
    {
      "chainName": "Corporation Tax Cuts",
      "steps": [
        "Corporation tax rate ↓",
        "Post-tax profits ↑",
        "Firms increase investment in technology and capital equipment",
        "Capital per worker ↑",
        "Labour productivity ↑",
        "LRAS shifts rightward"
      ]
    }
  ]',
  '[
    {
      "id": "eval1",
      "point": "Significant government expenditure required (education, infrastructure) — there is a substantial opportunity cost: funds could be used for healthcare, housing, or direct welfare spending."
    },
    {
      "id": "eval2",
      "point": "Productivity improvements are notoriously difficult to measure accurately; it is hard to isolate the specific impact of any single policy from other macroeconomic factors."
    },
    {
      "id": "eval3",
      "point": "Very long time lags: investment in education may take 10–20 years to meaningfully improve the quality of the labour force; infrastructure projects can take many years to complete and have economic impact."
    },
    {
      "id": "eval4",
      "point": "Supply-side policies increase potential output (shift LRAS right) but do not automatically generate actual growth — if Aggregate Demand (AD) is insufficient, the additional productive capacity may go unused."
    },
    {
      "id": "eval5",
      "point": "Privatisation can create private monopolies (e.g. utilities) rather than competitive markets — a private monopolist may reduce R&D and raise prices, potentially lowering rather than raising productivity."
    },
    {
      "id": "eval6",
      "point": "Cutting welfare benefits may not increase labour supply if the unemployed lack the skills, mobility or health to fill available vacancies — structural unemployment may persist regardless."
    },
    {
      "id": "eval7",
      "point": "Reducing income tax may incentivise leisure over work for some workers (the income effect can dominate the substitution effect), particularly for higher earners who may choose to work fewer hours."
    },
    {
      "id": "eval8",
      "point": "The effectiveness of education/training investment depends heavily on the quality and relevance of programmes — poorly designed schemes may waste resources without producing productive workers."
    },
    {
      "id": "eval9",
      "point": "NB (Examiner note): A response that does not apply its analysis to a specific country context should be awarded a maximum of Level 3 for KAA."
    }
  ]',
  '{
    "kaa": {
      "total_marks": 12,
      "levels": [
        {
          "level": 1,
          "mark_range": "1–3",
          "descriptor": "Isolated, superficial knowledge of supply-side policy. Response uses generic or common-sense material not grounded in economics. No chains of reasoning — statements are made without explanation of cause and effect."
        },
        {
          "level": 2,
          "mark_range": "4–6",
          "descriptor": "Some knowledge of relevant economic terms and concepts (e.g. can name supply-side policies). Limited or imprecise application to a specific country context. Only two-stage chains of reasoning (e.g. ''education improves productivity'') without developing the full transmission mechanism."
        },
        {
          "level": 3,
          "mark_range": "7–9",
          "descriptor": "Accurate knowledge of supply-side policies with some supporting evidence or country context. Clear chains of reasoning are present, but some intermediate steps are omitted or underdeveloped. AD/AS diagram may be used but not fully integrated."
        },
        {
          "level": 4,
          "mark_range": "10–12",
          "descriptor": "Accurate and precise knowledge of a range of supply-side policies. Fully integrated use of specific country examples, data, or real-world evidence. Clear, coherent, multi-stage chains of reasoning throughout — every causal step is explained. LRAS diagram is correctly drawn and labelled, with full explanation of the shift mechanism."
        }
      ]
    },
    "eval": {
      "total_marks": 8,
      "levels": [
        {
          "level": 1,
          "mark_range": "1–3",
          "descriptor": "Generic evaluative comments (e.g. ''it depends on the country'' or ''there are advantages and disadvantages'') with no supporting evidence or economic reasoning. No logical chain underpins the evaluation. No reference to context."
        },
        {
          "level": 2,
          "mark_range": "4–6",
          "descriptor": "Some evaluation of alternative approaches or counter-arguments (e.g. time lags, opportunity cost). Some reference to country-specific context. Evaluation is partially developed — the chain of reasoning behind the evaluative judgement is present but incomplete."
        },
        {
          "level": 3,
          "mark_range": "7–8",
          "descriptor": "Recognises and weighs different viewpoints; is critical of evidence or policy assumptions. Makes appropriate and specific reference to country context. Each evaluative point is supported by a clear logical chain, and the response reaches a substantiated overall judgement."
        }
      ]
    }
  }'
)
ON CONFLICT (unit_id, question_code) DO UPDATE SET
  title             = EXCLUDED.title,
  question_text     = EXCLUDED.question_text,
  question_type     = EXCLUDED.question_type,
  total_marks       = EXCLUDED.total_marks,
  kaa_marks         = EXCLUDED.kaa_marks,
  eval_marks        = EXCLUDED.eval_marks,
  source_material   = EXCLUDED.source_material,
  kaa_points        = EXCLUDED.kaa_points,
  logic_chains      = EXCLUDED.logic_chains,
  eval_points       = EXCLUDED.eval_points,
  level_descriptors = EXCLUDED.level_descriptors,
  updated_at        = NOW();
