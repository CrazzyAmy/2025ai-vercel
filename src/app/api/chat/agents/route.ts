import { NextRequest, NextResponse } from "next/server";
//import { UIMessage as VercelChatMessage, StreamingTextResponse } from "ai";
//import { StreamingTextResponse } from "ai/react";
import { google } from '@ai-sdk/google';
import { streamText, type CoreMessage } from 'ai';
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { Calculator } from "@langchain/community/tools/calculator";
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  isSystemMessage,
  isAIMessage,
  isHumanMessage,
  SystemMessage,
  MessageContent,
  MessageContentComplex,
  ToolMessage,
} from "@langchain/core/messages";

// v5 起 "ai" 不再輸出 StreamingTextResponse，這裡只保留訊息型別
import { UIMessage as VercelChatMessage } from "ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
// 假設仍然：import { UIMessage as VercelChatMessage } from "ai";
//import { isAIMessage } from "@langchain/core/messages";

//const message = new AIMessage("Hello!");
//isAIMessage(message); // true
const extractTextFromParts = (m: VercelChatMessage): string => {
  return (m.parts ?? [])
    .map((p) => {
      // 只擷取「文字型」內容；有需要也可把 reasoning 一併串上
      if (p.type === "text" || p.type === "reasoning") return p.text ?? "";
      // 若想把工具輸出也拼進歷史，可加上：
      // if (typeof p.type === "string" && p.type.startsWith("tool-")) {
      //   if (p.state === "output-available" && typeof p.output === "string") return p.output;
      if (
        typeof p.type === "string" &&
        p.type.startsWith("tool-") &&
        "state" in p &&
        (p as { state?: unknown }).state === "output-available" &&
        "output" in p &&
        typeof (p as { output?: unknown }).output === "string"
      ) {
        return (p as { output: string }).output;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
};

const convertVercelMessageToLangChainMessage = (m: VercelChatMessage) => {
  const text = extractTextFromParts(m);
  if (m.role === "user") return new HumanMessage(text);
  if (m.role === "assistant") return new AIMessage(text);
  return new ChatMessage({ content: text, role: m.role });
};

type VercelRole = "user" | "assistant" | "system" | (string & {});

// const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
//   const text = messageToPlainText(message);

//   const role: VercelRole =
//     message._getType() === "human"
//       ? "user"
//       : message._getType() === "ai"
//         ? "assistant"
//         : (message._getType() as VercelRole);

//   return {
//     id: crypto.randomUUID(),
//     role,
//     parts: [{ type: "text", text }],
//   };
// };

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  const text = messageToPlainText(message);

  let role: VercelRole;
  if (isHumanMessage(message)) role = "user";
  else if (isAIMessage(message)) role = "assistant";
  else if (isSystemMessage(message)) role = "system";
  //else role = message.getType() as VercelRole; // 其餘維持原型別字串
  else role = "assistant"

  return {
    id: crypto.randomUUID(),
    role,
    parts: [{ type: "text", text }],
  };
};

/** 判斷是否為 { type: "text" | "reasoning", text?: string } */
function isTextLike(
  part: unknown
): part is { type: "text" | "reasoning"; text?: string } {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    ( (part as { type: unknown }).type === "text" ||
      (part as { type: unknown }).type === "reasoning" ) &&
    // text 可能不存在，但若存在應為字串
    (!("text" in part) || typeof (part as { text?: unknown }).text === "string")
  );
}
/** 判斷是否為 tool_result；不假設具體型別，只要求有 content 欄位 */
function isToolResult(
  part: unknown
): part is { type: "tool_result"; content?: unknown } {
  return (
    typeof part === "object" &&
    part !== null &&
    "type" in part &&
    (part as { type: unknown }).type === "tool_result"
  );
}
function messageContentPartToText(part: MessageContentComplex): string {
  // 1) 直接是字串
  if (typeof part === "string") return part;

  // 2) text / reasoning
  if (isTextLike(part)) return part.text ?? "";

  // 3) tool_result（content 可能是 string 或陣列）
  if (isToolResult(part)) {
    const c = part.content;
    if (typeof c === "string") return c;

    if (Array.isArray(c)) {
      return c
        .map((inner) => {
          if (typeof inner === "string") return inner;
          if (isTextLike(inner)) return inner.text ?? "";
          return "";
        })
        .filter(Boolean)
        .join("\n");
    }
    return "";
  }

  // 4) 其他型別（例如 image_url / tool_use ...）目前不轉文字
  return "";
}



function messageToPlainText(message: BaseMessage): string {
  const content: MessageContent = message.content;

  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => messageContentPartToText(part))
      .filter(Boolean)
      .join("\n");
  }

  // 理論上不會到這，但保底
  return String(content ?? "");
}

const AGENT_SYSTEM_TEMPLATE = `You are a talking parrot named Polly. All final responses must be how a talking parrot would respond. Squawk often!`;

/**
 * ReAct agent（可工具呼叫）的示範，改用 Gemini 2.5 Flash
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const returnIntermediateSteps = body.show_intermediate_steps;

    // 僅保留 user/assistant 對話進入歷史
    const messages = (body.messages ?? [])
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || message.role === "assistant",
      )
      .map(convertVercelMessageToLangChainMessage);

    // 需要 SERPAPI_API_KEY
    const tools = [new Calculator(), new SerpAPI()];

    // ✅ 改用 Gemini（LangChain 官方 Google GenAI 封裝）
    // 會讀取 process.env.GOOGLE_API_KEY
    const chat = new ChatGoogleGenerativeAI({
      model: "gemini-2.5-flash",
      temperature: 0,
      // apiKey: process.env.GOOGLE_API_KEY, // （可選）手動指定
    });

    // ✅ 沿用 LangGraph 的預製 ReAct agent
    const agent = createReactAgent({
      llm: chat,
      tools,
      messageModifier: new SystemMessage(AGENT_SYSTEM_TEMPLATE),
    });

    if (!returnIntermediateSteps) {
      // 串流最終輸出：維持與原本相同的事件判斷
      const eventStream = await agent.streamEvents(
        { messages },
        { version: "v2" },
      );

      const textEncoder = new TextEncoder();
      const transformStream = new ReadableStream({
        async start(controller) {
          for await (const { event, data } of eventStream) {
            if (event === "on_chat_model_stream") {
              if (data?.chunk?.content) {
                controller.enqueue(textEncoder.encode(data.chunk.content));
              }
            }
          }
          controller.close();
        },
      });

      // ❌ 不再使用 StreamingTextResponse
      // ✅ 直接回傳標準串流回應（純文字）
      return new Response(transformStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } else {
      // 非串流：回傳整理後的訊息
      const result = await agent.invoke({ messages });
      return NextResponse.json(
        {
          messages: result.messages.map(convertLangChainMessageToVercelMessage),
        },
        { status: 200 },
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}