import { NextResponse } from "next/server";

type UploadedImage = {
  name: string;
  type: string;
  dataUrl: string;
};

type UploadedDocument = {
  name: string;
  type: string;
  dataUrl: string;
};

function getBase64FromDataUrl(dataUrl: string) {
  return dataUrl.split(",")[1] || "";
}

function cleanJsonText(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

async function generateShowcase(body: any) {
  const images: UploadedImage[] = body.images || [];
  const documents: UploadedDocument[] = body.documents || [];

  const assetManifest = [
    ...images.map((image) => ({
      name: image.name,
      type: image.type,
      category: "image",
    })),
    ...documents.map((doc) => ({
      name: doc.name,
      type: doc.type,
      category: "pdf",
    })),
  ];

  const prompt = `
You are Toybox AI, a senior UX strategist, visual analyst, and UX case study writer.

Analyze the uploaded images, PDFs, file names, and project context.

Your job:
1. Understand what each uploaded artifact represents.
2. Classify each artifact as one of:
   - persona
   - dashboard
   - application-screen
   - journey-map
   - service-blueprint
   - workflow
   - research
   - concept-design
   - annotation
   - supporting-visual
3. Create a polished UX showcase story.
4.For every generated section of the showcase,
choose the most relevant uploaded artifact.

Use the artifact's meaning and visual content,
not simply its order in the upload list.

Prefer:
- persona artifacts for persona sections
- journey maps for journey sections
- ecosystem maps for ecosystem sections
- dashboards and screens for feature highlights
- workflows for process explanations
- research artifacts for challenge and discovery sections
- architecture diagrams for system and governance sections

Never assign artifacts randomly.
Every asset selection must be explainable.

5. Return the exact uploaded file name in assetName.
6. Do not invent asset names.
7. Use only file names from the uploaded assets list.
8. If no perfect match exists, choose the closest relevant artifact and explain the focus in visualFocus.
9. Do not assign persona images to solution highlights unless the highlight is specifically about that persona.
10. Prefer dashboard/application screenshots for solution highlights.
11. Prefer persona cards/images for personas.

IMPORTANT:
Return ONLY valid JSON.
Do not use markdown.
Do not wrap the JSON in code fences.
Do not invent fake metrics unless clearly visible in the artifacts.

Project context:
${JSON.stringify(
    {
      projectName: body.projectName,
      domain: body.domain,
      engagementType: body.engagementType,
      projectContext: body.projectContext,
      figmaLink: body.figmaLink,
      otherUrls: body.otherUrls,
      tags: body.tags,
      uploadedAssets: assetManifest,
    },
    null,
    2
  )}

Return this EXACT JSON structure:

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
      "need": "",
      "painPoint": "",
      "solutionSupport": "",
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
  "suggestedTags": []
}
`;

  const content: any[] = [
    {
      type: "text",
      text: prompt,
    },
  ];

  images.forEach((image) => {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: image.type || "image/png",
        data: getBase64FromDataUrl(image.dataUrl),
      },
    });
  });

  documents.forEach((document) => {
    content.push({
      type: "document",
      source: {
        type: "base64",
        media_type: "application/pdf",
        data: getBase64FromDataUrl(document.dataUrl),
      },
    });
  });

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY || "",
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "pdfs-2024-09-25",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 5000,
      messages: [
        {
          role: "user",
          content,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({
      ok: false,
      status: response.status,
      error: data,
    });
  }

  const generatedText = data.content?.[0]?.text || "";
  const cleanedText = cleanJsonText(generatedText);

  let showcase;

  try {
    showcase = JSON.parse(cleanedText);
  } catch {
    showcase = {
      title: body.projectName || "Generated Showcase",
      subtitle: "AI-generated showcase draft",
      domain: body.domain || "",
      heroStatement: body.projectContext || "",
      heroAssetName: images[0]?.name || "",
      overview: cleanedText,
      challenge: "",
      challengeAssetName: images[1]?.name || images[0]?.name || "",
      mission: "",
      personas: [],
      solutionHighlights: [],
      visualSections: [],
      impact: "",
      suggestedTags: body.tags || [],
      rawText: cleanedText,
    };
  }

  return NextResponse.json({
    ok: true,
    showcase,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "generate-showcase API is ready. Use POST with images and PDFs.",
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  return generateShowcase(body);
}