import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { gameConfig } from "@/config";
import { getUnlockedLore } from "@/lib/lore";
import { buildOracleSystemPrompt } from "@/lib/oracle-prompt";

export async function POST(request: Request) {
  // Resolve track from cookie
  const cookieStore = await cookies();
  const deviceTokenCookie = cookieStore.get("device_token");

  if (!deviceTokenCookie?.value) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: enrollment } = await supabase
    .from("device_enrollments")
    .select("track")
    .eq("device_token", deviceTokenCookie.value)
    .eq("revoked", false)
    .single();

  if (!enrollment) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const track = enrollment.track;
  const { question, skipDelay } = await request.json();

  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return Response.json({ error: "No question provided" }, { status: 400 });
  }

  // Fetch today's conversations (for both count-based throttling and history)
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { data: todayConversations, count } = await supabase
    .from("oracle_conversations")
    .select("question, response", { count: "exact" })
    .eq("track", track)
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: true });

  const conversationCount = count ?? 0;

  // Delay logic
  if (!skipDelay) {
    if (conversationCount >= 11) {
      const waitSeconds = 180 + Math.floor(Math.random() * 420);
      return Response.json({ delayed: true, waitSeconds });
    }

    let delayMs = 0;
    if (conversationCount >= 6) {
      delayMs = 30000 + Math.floor(Math.random() * 30000); // 30-60s
    } else if (conversationCount >= 1) {
      delayMs = 5000 + Math.floor(Math.random() * 10000); // 5-15s
    }

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Get completed chapters for context
  const { data: completedProgress } = await supabase
    .from("chapter_progress")
    .select("chapter_id")
    .eq("track", track)
    .not("completed_at", "is", null);

  const completedChapters = (completedProgress ?? []).map((p) => p.chapter_id);

  // Get unlocked lore entries
  const unlockedLore = getUnlockedLore(completedChapters);

  const systemPrompt = buildOracleSystemPrompt(
    completedChapters,
    gameConfig.chapters,
    unlockedLore
  );

  // Call Perplexity API
  const perplexityKey = process.env.PERPLEXITY_API_KEY;
  if (!perplexityKey) {
    return Response.json(
      { error: "The Oracle is not yet awakened." },
      { status: 503 }
    );
  }

  // Build multi-turn messages from recent history (sliding window)
  const MAX_HISTORY_TURNS = 6;
  const MAX_HISTORY_CHARS = 3000;
  const history = todayConversations ?? [];

  // Take the most recent N exchanges, then trim by char budget
  const recentHistory = history.slice(-MAX_HISTORY_TURNS);
  let historyChars = recentHistory.reduce(
    (sum, c) => sum + c.question.length + c.response.length,
    0
  );
  while (recentHistory.length > 0 && historyChars > MAX_HISTORY_CHARS) {
    const removed = recentHistory.shift()!;
    historyChars -= removed.question.length + removed.response.length;
  }

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...recentHistory.flatMap((c) => [
      { role: "user" as const, content: c.question },
      { role: "assistant" as const, content: c.response },
    ]),
    { role: "user" as const, content: question },
  ];

  const pplxResponse = await fetch(
    "https://api.perplexity.ai/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${perplexityKey}`,
      },
      body: JSON.stringify({
        model: "sonar",
        messages,
        max_tokens: 300,
        temperature: 0.7,
        stream: true,
        disable_search: true,
      }),
    }
  );

  if (!pplxResponse.ok || !pplxResponse.body) {
    return Response.json(
      { error: "The Oracle is silent." },
      { status: 502 }
    );
  }

  // Stream the response (OpenAI-compatible SSE)
  const reader = pplxResponse.body.getReader();
  const decoder = new TextDecoder();
  let fullResponse = "";
  let tokensUsed: number | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const text =
                parsed?.choices?.[0]?.delta?.content ?? "";
              if (text) {
                fullResponse += text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
              // Capture token usage from the final chunk
              if (parsed?.usage?.total_tokens) {
                tokensUsed = parsed.usage.total_tokens;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch {
        controller.close();
      }

      // Persist conversation after streaming completes
      supabase
        .from("oracle_conversations")
        .insert({
          question: question.trim(),
          response: fullResponse,
          gemini_model: "sonar",
          tokens_used: tokensUsed,
          track,
        })
        .then(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
