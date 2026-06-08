import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: "Reply with exactly: Toybox Claude connection successful",
          },
        ],
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Connection failed" },
      { status: 500 }
    );
  }
}