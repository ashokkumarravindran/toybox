import { NextResponse } from 'next/server';

function cleanJsonText(text: string) {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

// Source file metadata per candidate — shown as the uploaded artifact in the showcase
const candidateSourceFiles: Record<string, { name: string; webUrl: string }> = {
  'wex-onboarding':     { name: 'WEX Onboarding New Customers - Case Study_Santiago Caicedo.pptx', webUrl: 'https://twodegrees1.sharepoint.com/sites/Capability-CX/CX Library/Transforming Onboarding of New Customers/WEX Onboarding New Customers - Case Study_Santiago Caicedo.pptx' },
  'fs-story-collection':{ name: 'Financial Services Story Collection.pptx', webUrl: 'https://twodegrees1.sharepoint.com/teams/SalesforceGo-to-MarketContentCenter/Shared Documents/Financial Services Story Collection.pptx' },
  'nyl-cx-transform':   { name: '02 - NYL CX RFP Transform Proposal Response.pptx', webUrl: 'https://twodegrees1.sharepoint.com/teams/NewYorkLifeCXRFP/Shared Documents/New York Life CX RFP/NYL RFP July 2026/Response Materials/02 - NYL CX RFP Transform Proposal Response.pptx' },
  'frankenmuth-cx':     { name: 'Frankenmuth CX Digital Strategy Response Final.pptx', webUrl: 'https://twodegrees1.sharepoint.com/teams/NewYorkLifeCXRFP/Shared Documents/New York Life CX RFP/NYL RFP July 2026/Client Stories/Frankenmuth CX Digital Strategy Response Final.pptx' },
};

// Pre-extracted SharePoint content for each candidate (POC — read via Graph API in production)
const candidateContent: Record<string, { text: string; meta: Record<string, string> }> = {
  'wex-onboarding': {
    meta: {
      client: 'WEX Inc.',
      industry: 'Financial Technology / Payment Processing',
      engagementType: 'CX Strategy + Implementation',
      domain: 'Customer Experience',
    },
    text: `
CASE STUDY: Improving Onboarding for New WEX Customers
Improving the customer onboarding experience and overall retention of the Small Business segment for 2025.

WEX Overview:
- Industry: Financial Technology / Solutions / Payment Processing
- Public company, Portland ME, 6000+ employees, $2.35B revenue
- Competitors: Visa, American Express, Mastercard, FLEETCOR, SIX Payment Services
- Strategic Priorities: Transformation, Organic + Inorganic Growth, Customer First, Portfolio Diversification (EV), DEI
- Lines of Business: North American Fleet, Corporate Payment Solutions, Health (Benefits), International

Project Context:
Customer lifecycle: Awareness → Consider → Purchase → Onboarding → Adoption → Retention → Expansion → Loyalty
Project Scope: Leverage digital capabilities to improve engagement and drive deeper connections with customers in the first 90 days of the customer lifecycle.
Timeline: Start — Application is approved and signed. End — Shares feedback of onboarding experience.
Sample Activities: Access WEX Portal, Assess WEX's Value Proposition, Pay First 3 Billing Cycles, Distribute & Use Fuel Cards, Respond Onboarding Survey.

We engaged with WEX for 6 months, in a two-part engagement:
First Engagement: Provide CX strategic recommendations on what WEX could achieve in 2025 to improve the onboarding experience for the first 120 days.
Second Engagement: Implement strategic recommendations to improve onboarding communications and formalize onboarding activities.

Slalom Team: Molly Plaisted (Client Partner), Josh Green (Account Executive), Katrina Stropkay (Experience Strategist/Designer), Chris Patten (Data SME), Santiago Caicedo (EL & Customer Strategist).

Key Challenge: Small Business customers were not finding value quickly enough during onboarding, leading to poor retention rates. The first 90 days were critical — customers who did not use their WEX card within the first billing cycle were significantly less likely to become long-term users.

Approach:
Phase 1 — Discovery and Strategy: Conducted research across the Small Business segment to understand pain points in the current onboarding experience. Identified gaps in digital communication, portal usability, and proactive outreach. Developed a comprehensive CX strategy with prioritized recommendations for 2025.
Phase 2 — Implementation: Built and deployed improved onboarding communications (email sequences, SMS touchpoints, portal guidance). Formalized onboarding activity milestones. Created measurement framework to track activation and retention.

Personas:
- The New Fleet Manager: First-time WEX customer managing a small fleet of 5-15 vehicles. Needs: quick setup, clear billing instructions. Pain point: overwhelmed by portal complexity in first week. Solution: simplified onboarding checklist and proactive day-3 outreach.
- The Cost-Conscious Owner: Small business owner focused on controlling fuel costs. Needs: immediate proof of value, easy reporting. Pain point: didn't understand discount structures until month 2. Solution: "value unlock" email sequence with ROI calculator.

Impact: Improved first-30-day activation rates for the Small Business segment. Reduced time-to-first-transaction. Established a repeatable onboarding playbook that can scale across WEX's lines of business. Created measurement infrastructure for ongoing CX improvement.
    `,
  },
  'fs-story-collection': {
    meta: {
      client: 'Multiple Financial Services Clients',
      industry: 'Banking & Financial Services',
      engagementType: 'CX Transformation',
      domain: 'Financial Services',
    },
    text: `
Financial Services Story Collection — Slalom Salesforce Go-to-Market

A curated collection of Slalom financial services client engagements demonstrating CX transformation outcomes across banking, payments, and wealth management.

Stories included:

Story 1 — Regional Bank Digital Onboarding Transformation
Challenge: A regional bank with $45B in assets was losing digital account openings to fintech competitors. Abandonment rate at 67% during online application.
Approach: Journey mapping across 3 customer segments. Redesigned digital application flow. Integrated Salesforce Financial Services Cloud for real-time agent support.
Impact: 40% reduction in application abandonment. Digital account openings increased 28% YoY. NPS improved from 31 to 54.

Story 2 — Wealth Management Client Experience Modernization
Challenge: A leading wealth management firm needed to modernize advisor-client interactions and consolidate fragmented data across 6 systems.
Approach: Designed unified client portal. Built advisor relationship dashboard. Automated reporting and rebalancing alerts.
Impact: Advisors saved 4 hours/week on administrative tasks. Client satisfaction scores increased 22%. Assets under management retention improved.

Story 3 — Credit Union Member Journey Redesign
Challenge: Mid-size credit union struggling with member retention as digital-first competitors gained share. Branch traffic declining 18% YoY.
Approach: VoC research across 500 members. Redesigned member lifecycle touchpoints. Introduced omnichannel service model.
Impact: Member churn reduced by 31%. Digital adoption increased 45%. Branch staff repurposed to high-value advisory roles.

Personas represented:
- The Digital Native Banking Customer: Mobile-first, expects instant decisions, low tolerance for friction.
- The Relationship-Seeking Wealth Client: Values advisor access, personalized communication, transparency.
- The Community-Oriented Credit Union Member: Loyal but vulnerable to better digital experiences elsewhere.

Key themes: Digital transformation, Salesforce FSC implementation, journey mapping, omnichannel CX, member/customer retention.
    `,
  },
  'nyl-cx-transform': {
    meta: {
      client: 'New York Life Insurance Company',
      industry: 'Life Insurance & Financial Services',
      engagementType: 'CX Strategy & Brand-to-Experience Translation',
      domain: 'Insurance',
    },
    text: `
New York Life — CX Transform: Turning Brand into Experience
Impactful Mid-Term CX Transformation — August 2026
Brief 2 of 3 in Slalom's NYL CX RFP Response

Strategic Context:
A connected, whole-experience strategy that translates NYL's brand values into consistent and joyful experiences across every audience, every channel, and every interaction.

NYL Brand Promise Pillars:
- Mutuality: We succeed together
- Protection First: Purpose before products
- Personal Guidance: Advice that adapts to life
- Long Term Trust: We keep our promises

The Advisor Persona — Sarah:
"Hi, I'm Sarah. I'm a financial advisor at New York Life. I've been lucky enough to spend my career helping families through some of the biggest moments of their lives. That's what keeps me coming back every day."
Sarah recommends what's right for her clients, not what's easiest to sell. Regardless of how the conversation begins, every recommendation considers the clients' life stage, protection needs, and future goals. As her clients build for the future, Sarah proactively helps them manage their finances and wealth before it's too late.

Brand-to-Experience Framework (three-layer):
Layer 01 — Experience Principles: Define the principles that guide every advisor and customer interaction.
Layer 02 — Experience Guidance: Translate principles into practical guidance across every customer touchpoint.
Layer 03 — Moments That Matter: Design the moments that build trust when families need it most.

Key Deliverables:
- Positioning Shift: Defines the desired market position and experience differentiation.
- Strategic Direction: Aligns business priorities, principles, and experience decisions.
- Brand Positioning Pyramid: Establishes the strategic foundation for brand and experience.
- Brand & Experience Principles: Define principles that guide every customer and advisor experience.
- Experience Success Measures: Define measures used to evaluate business impact.

Context Intelligence Model:
- Customer Context: People, relationships, goals
- Behavioral Signals: Behaviors, interactions, engagement
- Operational Context: Policies, products, capabilities
- Technology Context: AI capabilities, systems & constraints

Challenge:
NYL's brand values — trust, protection, mutuality — were not consistently reflected in customer and advisor experiences across channels. The experience varied dramatically between in-person advisor interactions and digital touchpoints, creating a fragmented brand perception.

Approach:
Slalom's brand-to-experience translation methodology bridges the gap between brand promise and lived experience. Working across customer segments (policy holders, beneficiaries, prospects) and advisor touchpoints, Slalom developed a unified experience framework that gives every NYL team member practical guidance for decision-making.

Impact Vision:
Consistent brand expression across all 12,000+ NYL advisor relationships and digital channels. Measurable improvement in brand trust scores. Framework adopted as the operating model for future experience investments.
    `,
  },
  'frankenmuth-cx': {
    meta: {
      client: 'Frankenmuth Insurance (Mutual)',
      industry: 'P&C Insurance',
      engagementType: 'CX Strategy Proposal',
      domain: 'Insurance',
    },
    text: `
Frankenmuth Insurance — Customer Experience Strategy
Driving Strategic Transformation from a Customer-First Lens
Proposal for Strategic Partnership — July 2026

About Frankenmuth Insurance:
Frankenmuth Mutual Insurance Company is a regional P&C insurer headquartered in Frankenmuth, Michigan. Known for its agent-centric model and strong community roots, Frankenmuth is navigating a critical inflection point: how to modernize the customer and agent experience while preserving the trusted, relationship-driven identity that defines the brand.

The Opportunity:
Frankenmuth faces pressure from digital-first insurers (Lemonade, Root, Hippo) who are redefining customer expectations for speed, transparency, and self-service. At the same time, Frankenmuth's agent network and community reputation remain competitive advantages that digital disruptors lack.

Our Understanding:
The challenge isn't to become a digital insurer — it's to deliver a service-centric, digitally-enabled experience that honors the agent relationship while meeting modern customer expectations.

Proposed Methodology — Service-Centric CX:
Phase 1 — Discovery (Weeks 1-6): VoC research with policyholders and agents. Journey mapping across 4 key moments: quote, bind, service, claim. Competitive benchmarking against regional and national P&C peers.
Phase 2 — Strategy (Weeks 7-14): CX strategy and experience principles. Service design for priority moments. Digital experience roadmap.
Phase 3 — Mobilization (Weeks 15-20): Governance model. CX measurement framework. Implementation roadmap and quick wins.

Sample Deliverables:
- Current State Journey Map (policyholder + agent)
- Experience Principles aligned to Frankenmuth's brand values
- Future State Service Blueprint for the claims experience
- CX Measurement Dashboard (NPS, effort score, retention by segment)
- 90-day quick win roadmap

Key Personas:
- The Loyal Policyholder: Long-term customer, 15+ year relationship, values consistency and agent relationship above all. Worried about rate increases.
- The Independent Agent: Runs a book of business with 200+ Frankenmuth policies. Needs fast, accurate underwriting decisions and responsive claims support.
- The Digital-First Prospect: Comparison-shopping online, values transparency and instant quotes. Frankenmuth currently loses this segment early in the funnel.

Investment: Full engagement over 20 weeks. Team includes CX strategist, service designer, VoC researcher, and program manager.
    `,
  },
};

export async function POST(request: Request) {
  const { candidateId } = await request.json();

  const candidate = candidateContent[candidateId];
  if (!candidate) {
    return NextResponse.json({ ok: false, error: 'Unknown candidate' }, { status: 400 });
  }

  const sourceFile = candidateSourceFiles[candidateId];

  const prompt = `
You are Toybox AI, a senior UX strategist and case study writer at Slalom.

Below is the extracted content from a SharePoint document. Your job is to transform it into a polished, publish-ready Toybox showcase.

SOURCE DOCUMENT:
${candidate.text}

METADATA:
Client: ${candidate.meta.client}
Industry: ${candidate.meta.industry}
Engagement Type: ${candidate.meta.engagementType}
Domain: ${candidate.meta.domain}

Return ONLY valid JSON. No markdown. No code fences. No extra text.

Use this EXACT JSON structure:

{
  "title": "",
  "subtitle": "",
  "domain": "",
  "heroStatement": "",
  "heroAssetName": "",
  "overview": "",
  "challenge": "",
  "challengeAssetName": "",
  "mission": "",
  "personas": [
    {
      "name": "",
      "role": "",
      "archetype": "",
      "quote": "",
      "background": "",
      "goals": ["", ""],
      "frustrations": ["", ""],
      "need": "",
      "painPoint": "",
      "solutionSupport": "",
      "behaviours": ["", ""],
      "techComfort": "",
      "assetName": "",
      "visualFocus": ""
    }
  ],
  "solutionHighlights": [
    {
      "heading": "",
      "body": "",
      "assetName": "",
      "visualFocus": ""
    }
  ],
  "visualSections": [
    {
      "sectionTitle": "",
      "sectionType": "",
      "assetName": "",
      "visualFocus": "",
      "narrative": ""
    }
  ],
  "impact": "",
  "suggestedTags": [],
  "pointsOfContact": [
    {
      "name": "",
      "role": "",
      "email": ""
    }
  ]
}

Rules:
- For sectionType use ONLY: journey-map | ecosystem-map | service-blueprint | storyboard | heuristic-checklist | solution-highlight | other
- Leave assetName fields as empty string "" (no uploaded images for this import)
- For pointsOfContact: extract all Slalom team members mentioned in the document (names, roles). If an email is not stated, leave it as "". If no team is mentioned, return an empty array.
- Write in a confident, precise tone — this is a professional case study
- heroStatement should be one powerful sentence capturing the project's mission
- Create 2-3 fully fleshed-out personas. For each: use the document content as a foundation but apply your expertise as a senior UX strategist to complete any missing fields with realistic, plausible detail. Every field must be substantive — no empty strings for persona fields. quote should be a first-person statement that captures their worldview. archetype should be a 2-3 word label (e.g. "The Efficiency Seeker"). behaviours should describe observable patterns. techComfort should be one of: Low / Medium / High / Expert
- Create 3-4 solutionHighlights covering the key approach elements
- Create 2-3 visualSections describing the methodology artifacts (journey maps, blueprints, etc.)
- impact should be a concise paragraph with any measurable outcomes mentioned
- suggestedTags should be 4-6 relevant tags
`;

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

  const raw = data.content?.[0]?.text || '';
  const cleaned = cleanJsonText(raw);

  let showcase;
  try {
    showcase = JSON.parse(cleaned);
  } catch {
    return NextResponse.json({ ok: false, error: 'Failed to parse Claude response', raw: cleaned }, { status: 500 });
  }

  return NextResponse.json({ ok: true, showcase, meta: candidate.meta, sourceFile });
}
