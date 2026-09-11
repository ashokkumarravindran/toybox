import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { targetClient, goalContext, outputType, knowledgeBase } = body;

  const kbSummary = knowledgeBase
    .map((s: any, i: number) => `
--- Showcase ${i + 1}: ${s.title} (${s.domain}) [showcaseRef: ${i}] ---
Overview: ${s.overview}
Challenge: ${s.challenge}
Mission: ${s.mission}
Impact: ${s.impact}
Personas: ${JSON.stringify(s.personas?.slice(0, 3))}
Solution Highlights: ${JSON.stringify(s.solutionHighlights?.slice(0, 3))}
Tags: ${s.suggestedTags?.join(', ')}
`)
    .join('\n');

  const outputTypeLabel =
    outputType === 'sales-pitch'
      ? 'Sales Pitch / Capabilities Story'
      : outputType === 'design-blueprint'
      ? 'Design Blueprint / Thought Starter'
      : 'Proposal Response';

  const prompt = `You are an expert Slalom consultant and strategist. Generate a white-labeled, client-ready ${outputTypeLabel} based on the context below.

WHAT THE PRACTITIONER IS TRYING TO DO:
${goalContext}

TARGET CLIENT: ${targetClient}
OUTPUT TYPE: ${outputTypeLabel}

You have access to a PRE-FILTERED set of Slalom Toybox showcases that were selected as potentially relevant. Your job is to:
1. Read the practitioner's goal context carefully
2. For EACH showcase, honestly assess: is this actually relevant to the stated goal and client? Only include it in matchedSources if there is a clear, direct connection — same domain, similar challenge, or directly transferable approach. A showcase with only a superficial connection should be EXCLUDED.
3. It is perfectly acceptable (and preferred) to include FEWER sources if only 1-2 are truly relevant. Do NOT stretch or force relevance.
4. Strip ALL original client names — replace with neutral language ("a global financial institution", "a leading insurer", etc.)
5. Reframe everything specifically for ${targetClient} and their stated opportunity
6. Make the output feel fresh and tailored — not recycled

RELEVANCE STANDARD: A showcase is relevant only if it shares the same industry vertical, or directly addresses the same type of problem (e.g. workflow design, governance, onboarding, CX transformation). Do NOT include a showcase just because it is available — only include it if it genuinely helps serve ${targetClient}.

TOYBOX KNOWLEDGE BASE:
${kbSummary}

Return ONLY valid JSON with this exact structure:
{
  "matchedSources": [
    {
      "showcaseRef": 0,
      "title": "exact title from knowledge base",
      "domain": "domain from knowledge base",
      "relevanceScore": "High | Medium",
      "relevanceReason": "2-3 sentences explaining specifically why this showcase is relevant to the opportunity described. Be concrete — reference actual elements (personas, approach, outcomes) that map to the goal.",
      "keyTransfer": "The single most transferable insight or pattern from this showcase to the current opportunity"
    }
  ],
  "headline": "Compelling headline for ${targetClient}",
  "subheadline": "One powerful sentence framing the opportunity",
  "executiveSummary": "2-3 paragraph executive summary tailored to the practitioner's goal and ${targetClient}. Be specific. Do NOT mention any original client names.",
  "whyNow": "1-2 sentences on why this is the right moment for ${targetClient}",
  "relevantExperience": [
    {
      "title": "Experience area title",
      "description": "2-3 sentences describing a relevant prior engagement (anonymized). What was the challenge, what did we do, what was the outcome.",
      "outcome": "One crisp outcome statement",
      "tags": ["tag1", "tag2"]
    }
  ],
  "keyInsights": [
    {
      "insight": "A sharp insight relevant to the practitioner's goal and ${targetClient}'s context",
      "implication": "What this means for ${targetClient}"
    }
  ],
  "proposedApproach": {
    "phases": [
      {
        "phase": "Phase name",
        "duration": "X weeks",
        "activities": ["activity1", "activity2", "activity3"],
        "deliverable": "Key deliverable"
      }
    ]
  },
  "personas": [
    {
      "name": "Persona name (role title, not a person name)",
      "need": "Their primary need",
      "tension": "The challenge or tension they face",
      "howWeHelp": "How this engagement addresses their need"
    }
  ],
  "callToAction": "Specific, compelling next step for ${targetClient}",
  "sourceShowcases": ["list of showcase titles used as source material"],
  "pointsOfContact": [
    {
      "name": "Full name",
      "role": "Their Slalom role or title",
      "email": "email if available from source material, otherwise empty string",
      "expertise": "One line on why they are relevant to this engagement"
    }
  ]
}

For pointsOfContact: extract Slalom team members mentioned in the source showcase documents who have direct relevant expertise for ${targetClient}'s engagement. Limit to 2-3 most relevant people. If no specific people are mentioned in the source material, return an empty array — do NOT invent names.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ ok: false, error: data }, { status: 500 });
  }

  let text = data.content?.[0]?.text || '';
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    const accelerator = JSON.parse(text);
    // Enrich matchedSources with the previewId/href from the KB so the UI can link back
    if (accelerator.matchedSources && knowledgeBase) {
      accelerator.matchedSources = accelerator.matchedSources.map((ms: any) => {
        const kb = knowledgeBase[ms.showcaseRef];
        return {
          ...ms,
          previewId: kb?.previewId || null,
          showcaseHref: kb?.showcaseHref || null,
        };
      });
    }
    return NextResponse.json({ ok: true, accelerator });
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to parse AI response', raw: text }, { status: 500 });
  }
}
