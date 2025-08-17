/* eslint-disable @typescript-eslint/no-explicit-any */
// // import { NextResponse } from 'next/server';
// // import { GoogleGenAI } from "@google/genai";

// // const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_APIKEY });


// // type FormDataShape = {
// //   productDescriptions: {
// //     self: string | null;
// //     document: string | null;
// //     website: string | null;
// //   };
// //   questionCount: number;
// //   surveyCategory: string;
// //   otherCategory: string | null;
// // };

// // export async function POST(req: Request) {
// //     try{
// //         //const { datareq } = await req.json();
// //         // 1) 檢查環境變數
// //         const apiKey = process.env.GEMINI_APIKEY;
// //         if (!apiKey) {
// //             return NextResponse.json(
// //                 { error: 'Missing GEMINI_APIKEY in environment.' },
// //                 { status: 500 }
// //             );
// //         }
// //         // 2) 解析 body：期待是 { data: FormDataShape }
// //         const body = await req.json().catch(() => null);
// //         console.log('[generate] incoming body =', body);

// //         const data2 = body?.data as FormDataShape | undefined;
// //         if (!data2) {
// //             return NextResponse.json(
// //                 { error: 'Bad Request: body.data is required.' },
// //                 { status: 400 }
// //             );
// //         }
// //         const response = await ai.models.generateContent({
// //             model: "gemini-2.5-flash",
// //             contents: "問卷規格為:**<問卷名稱>**\n<問候語和作答時長:例如:感謝您撥冗參與本次問卷調查。本問卷約需 3-5 分鐘，您的回答將僅用於市場研究分析。>\n\n--\n\n**<問卷開始>**\n**<第一區塊簡介>**\n**1.<第一題題目>**(<單選或多選(最多勾選N項)或問答題>\n   *  A. <選項一的敘述>\n   *  B. <選項二的敘述>\n   *  C. <選項三的敘述>\n   *  D. <選項四的敘述>\n\n 例題如上請自行生成相同格式之題型)\n，並使用以下資訊幫我生成一份問卷，"+JSON.stringify(data2, null, 2),
// //         });
// //         const text = response.text;
// //         console.log(response.text);
// //         return NextResponse.json({ text });
// //     } catch (err: any) {
// //         return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
// //     }
// // }

// //await main();
// import { NextResponse } from "next/server";
// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_APIKEY });

// // === 你要的制式化模板（用中文變數名 OK） ===
// const 制式化問卷 = `問卷規格為:**<問卷名稱>**
// <問候語和作答時長:例如:感謝您撥冗參與本次問卷調查。本問卷約需 3-5 分鐘，您的回答將僅用於市場研究分析。>

// --

// **<問卷開始>**
// **<第一區塊簡介>**
// **1.<第一題題目>**(<單選或多選(最多勾選N項)或問答題>
//    *  A. <選項一的敘述>
//    *  B. <選項二的敘述>
//    *  C. <選項三的敘述>
//    *  D. <選項四的敘述>

//   例題如上請自行生成相同格式之題型)
// `;

// type FormDataShape = {
//   productDescriptions: {
//     self: string | null;
//     document: string | null;
//     website: string | null;
//   };
//   questionCount: number;
//   surveyCategory: string;
//   otherCategory: string | null;
// };

// export async function POST(req: Request) {
//   try {
//     // 1) 檢查環境變數
//     const apiKey = process.env.GEMINI_APIKEY;
//     if (!apiKey) {
//       return NextResponse.json(
//         { error: "Missing GEMINI_APIKEY in environment." },
//         { status: 500 }
//       );
//     }

//     // 2) 解析 body：期待是 { data: FormDataShape }
//     const body = await req.json().catch(() => null);
//     console.log("[generate] incoming body =", body);

//     const data2 = body?.data as FormDataShape | undefined;
//     if (!data2) {
//       return NextResponse.json(
//         { error: "Bad Request: body.data is required." },
//         { status: 400 }
//       );
//     }

//     // 3) 組合最終提示詞：先給「制式化問卷」模板，再附上使用者資料
//     const prompt =
//       `${制式化問卷}\n` +
//       `請嚴格依照上述格式，用相同的標記、縮排與段落，` +
//       `根據下列使用者需求生成完整問卷（題數約 ${data2.questionCount} 題，可含多個區塊）：\n` +
//       `${JSON.stringify(data2, null, 2)}\n\n` +
//       `注意：\n` +
//       `1) 維持 **<...>** 與列表符號、粗體等 Markdown 格式；\n` +
//       `2) 單選/多選要清楚標示（多選要標明最多可勾選 N 項）；\n` +
//       `3) 若有「其他（請說明）」選項，請一併列出；\n` +
//       `4) 不要加入與問卷無關的解說文字。`;

//     // 4) 呼叫 Gemini（不同版本 SDK 回傳介面略有差異，下面做了兼容）
//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: prompt,
//     });

//     // 5) 兼容取出文字（可能是 text()、response.text() 或 text 屬性）
//     let text: string = "";
//     try {
//       if (typeof (response as any).text === "function") {
//         text = await (response as any).text();
//       } else if (typeof (response as any).response?.text === "function") {
//         text = await (response as any).response.text();
//       } else if (typeof (response as any).text === "string") {
//         text = (response as any).text;
//       } else {
//         text = JSON.stringify(response);
//       }
//     } catch {
//       text = JSON.stringify(response);
//     }

//     console.log("[generate] output length =", text?.length ?? 0);
//     return NextResponse.json({ text });
//   } catch (err: any) {
//     return NextResponse.json(
//       { error: err?.message ?? "Unknown error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

// === 你原本的固定模板（制式化問卷）===
const TEMPLATE = `問卷規格為:**<問卷名稱>**
<問候語和作答時長:例如:感謝您撥冗參與本次問卷調查。本問卷約需 3-5 分鐘，您的回答將僅用於市場研究分析。>

--

**<問卷開始>**
**<第一區塊簡介>**
**1.<第一題題目>**(<單選或多選(最多勾選N項)或問答題>
   *  A. <選項一的敘述>
   *  B. <選項二的敘述>
   *  C. <選項三的敘述>
   *  D. <選項四的敘述>

  例題如上請自行生成相同格式之題型)
`;

// === 型別 ===
type QuestionType = "single" | "multi" | "text";

type Option = {
  id: string;
  label: string;
  hasFreeText?: boolean;
};

type VisibleIf = {
  questionId: string;
  equalsOptionId: string;
};

type Question = {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  required?: boolean;
  options?: Option[];
  maxSelect?: number;
  visibleIf?: VisibleIf;
};

type Section = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
};

type Survey = {
  id: string;
  title: string;
  intro: string;
  sections: Section[];
};

// === 你前端送來的資料 ===
type FormDataShape = {
  productDescriptions: {
    self: string | null;
    document: string | null;
    website: string | null;
  };
  questionCount: number;
  surveyCategory: string;
  otherCategory: string | null;
};

// === 小工具 ===
const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 9)}`;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_APIKEY });

/** 統一取出文字（不同 SDK 版面向相容） */
async function getText(resp: any): Promise<string> {
  if (typeof resp?.text === "function") return await resp.text();
  if (typeof resp?.response?.text === "function") return await resp.response.text();
  if (typeof resp?.text === "string") return resp.text;
  return JSON.stringify(resp);
}

/** 產生 Survey 的 JSON Schema（供 Gemini 結構化輸出） */
function buildSurveySchema() {
  return {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING },
      title: { type: Type.STRING },
      intro: { type: Type.STRING },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["single", "multi", "text"] },
                  required: { type: Type.BOOLEAN },
                  maxSelect: { type: Type.INTEGER },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        label: { type: Type.STRING },
                        hasFreeText: { type: Type.BOOLEAN },
                      },
                      required: ["id", "label"],
                      propertyOrdering: ["id", "label", "hasFreeText"],
                    },
                  },
                  visibleIf: {
                    type: Type.OBJECT,
                    properties: {
                      questionId: { type: Type.STRING },
                      equalsOptionId: { type: Type.STRING },
                    },
                    required: ["questionId", "equalsOptionId"],
                    propertyOrdering: ["questionId", "equalsOptionId"],
                  },
                },
                required: ["id", "title", "type"],
                propertyOrdering: [
                  "id",
                  "title",
                  "description",
                  "type",
                  "required",
                  "maxSelect",
                  "options",
                  "visibleIf",
                ],
              },
            },
          },
          required: ["id", "title", "questions"],
          propertyOrdering: ["id", "title", "description", "questions"],
        },
      },
    },
    required: ["id", "title", "intro", "sections"],
    propertyOrdering: ["id", "title", "intro", "sections"],
  } as const;
}

/** 解析「制式化文字」→ Survey 物件 */
function parseSurveyTextToSurvey(text: string): Survey {
  const lines = text.split(/\r?\n/);

  // --- 1) 標題 ---
  const titleRe = /問卷規格為:\*\*(.+?)\*\*/;
  const titleLine = lines.find((l) => titleRe.test(l)) || "";
  const title = (titleLine.match(titleRe)?.[1] || "未命名問卷").trim();

  // --- 2) 前言（介於標題與 "--" 之間）---
  const titleIdx = lines.findIndex((l) => titleRe.test(l));
  const sepIdx = lines.findIndex((l) => l.trim() === "--");
  const intro = lines
    .slice(titleIdx + 1, sepIdx === -1 ? titleIdx + 2 : sepIdx)
    .join("\n")
    .trim() || "（無前言）";

  // --- 3) 內容起點：**<問卷開始>** 之後 ---
  const startIdx = Math.max(
    lines.findIndex((l) => /\*\*<問卷開始>\*\*/.test(l)),
    sepIdx
  );
  const body = lines.slice(startIdx + 1);

  // 檔內游標狀態
  const sections: Section[] = [];
  let curSection: Section | null = null;

  // 工具：推入新章節
  const pushSection = (title: string, description?: string) => {
    const s: Section = { id: uid("sec"), title: title.trim() || "未命名章節", description, questions: [] };
    sections.push(s);
    curSection = s;
  };

  // 工具：解析一題
  const qHeadRe = /^\*\*\s*(\d+)\.\s*<([^>]+)>\s*\*\*\s*\(([^)]*)\)\s*$/;
  const optRe = /^\s*\*\s*[A-D]\.\s*(.+?)\s*$/;

  const pushQuestion = (qTitle: string, meta: string, opts: string[]) => {
    // 判斷題型與 maxSelect
    let type: QuestionType = "text";
    let maxSelect: number | undefined;

    const metaS = meta.replace(/\s+/g, "");
    if (metaS.includes("單選")) type = "single";
    else if (metaS.includes("多選")) {
      type = "multi";
      const m = meta.match(/最多勾選\s*([0-9]+)\s*項/);
      if (m) maxSelect = parseInt(m[1], 10);
    }

    const q: Question = {
      id: uid("q"),
      title: qTitle.trim(),
      type,
      required: true,
    };

    if (type !== "text") {
      q.options = opts.map((raw) => {
        const label = raw.trim();
        return {
          id: uid("opt"),
          label,
          hasFreeText: /其他|請說明/.test(label),
        };
      });
      if (type === "multi" && maxSelect) q.maxSelect = maxSelect;
    }

    if (!curSection) pushSection("未命名章節");
    curSection!.questions.push(q);
  };

  // 逐行掃描：遇到 **<...>** 當作章節簡介；遇到題頭就收集它的選項
  for (let i = 0; i < body.length; i++) {
    const line = body[i];

    // 章節（**<...>**）
    const secMatch = line.match(/^\*\*<(.+?)>\*\*\s*$/);
    if (secMatch) {
      pushSection(secMatch[1]);
      continue;
    }

    // 題目
    const qMatch = line.match(qHeadRe);
    if (qMatch) {
      const qTitle = qMatch[2];
      const meta = qMatch[3];
      const opts: string[] = [];
      let j = i + 1;
      while (j < body.length) {
        const l2 = body[j];
        if (qHeadRe.test(l2) || /^\*\*<.+?>\*\*/.test(l2) || l2.trim() === "") break;
        const o = l2.match(optRe);
        if (o) opts.push(o[1]);
        j++;
      }
      pushQuestion(qTitle, meta, opts);
      i = j - 1;
    }
  }

  // 組合 Survey
  return {
    id: uid("survey"),
    title,
    intro,
    sections: sections.length ? sections : [{ id: uid("sec"), title: "問卷", questions: [] }],
  };
}

// ===== 主處理：format=json → 直接回 JSON；format=text → 先出文字再 parse =====
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_APIKEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GEMINI_APIKEY" }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    const data = body?.data as FormDataShape | undefined;
    const format = (body?.format as "json" | "text" | undefined) ?? "json";

    if (!data) {
      return NextResponse.json({ error: "Bad Request: body.data is required." }, { status: 400 });
    }

    const prompt =
      `${TEMPLATE}\n` +
      `請嚴格依上述格式，根據以下資訊生成完整問卷（題數約 ${data.questionCount} 題，可含多個區塊）：\n` +
      `${JSON.stringify(data, null, 2)}\n` +
      `要求：保持 Markdown 標記與縮排；單選/多選需清楚標註；如有「其他（請說明）」請附輸入欄。`;

    if (format === "json") {
      // ✅ 直接請模型輸出 Survey JSON
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  "請產生一份 Survey JSON，欄位需符合下方 schema。內容依據這個使用者需求：" +
                  "\n\n" +
                  JSON.stringify(data, null, 2),
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: buildSurveySchema(),
        },
      });

      const text = await getText(response);
      // 回傳 JSON（保留字串與物件兩種，方便調試）
      let parsed: Survey | null = null;
      try {
        parsed = JSON.parse(text) as Survey;
      } catch {
        // 萬一模型多包了一層陣列或字串，可再補救解析
        parsed = null;
      }
      return NextResponse.json({ text, survey: parsed }, { status: 200 });
    } else {
      // ↪ 先生成「制式化文字」，再本地 parse 成 Survey
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const text = await getText(response);
      const survey = parseSurveyTextToSurvey(text);
      return NextResponse.json({ text, survey }, { status: 200 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

