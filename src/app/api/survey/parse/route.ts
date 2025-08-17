/* eslint-disable @typescript-eslint/no-explicit-any */

// 檔案：src/app/api/survey/parse/route.ts
// 說明：
// - 接收任意文字格式（Markdown、純文字）描述的問卷，嘗試解析為結構化 JSON。
// - 盡量以規則與啟發式（heuristics）完成，不依賴 LLM；
//   可選擇性開啟 LLM 修復（見最下方 TODO 區塊）。
// - 支援特徵：
//   * 標題自動偵測（第一個明顯標題或第一行）
//   * 前言 intro（標題後、第一個章節或第一題之前的段落）
//   * 章節偵測（「第一部分」「Part 1」「Sec 1」）
//   * 題目偵測（1. / 1、/ Q1. / １. / １、等）
//   * 題型推斷：單選、複選、開放式（關鍵詞：單選、可複選、開放/開放填答/問答）
//   * 選項偵測：（A）/ A) / A. / （Ａ）/ 子彈符號 - • 等
//   * 可見性規則 visibleIf：
//       - 偵測「若選擇『X』…」樣式，對當前或上一題建立條件
//   * 結束規則 terminationRules：
//       - 偵測選項標籤內含「問卷將到此結束」關鍵句，將該選項標為終止
//
// 注意：
// - 「任何文字格式」並非保證 100% 解析成功；此實作涵蓋常見格式，
//   若遇到模糊或非標準格式，輸出會盡力合理化，必要時在 warnings 內回報。

import { NextResponse } from 'next/server';

/** ======== 型別定義 ======== */
type VisibilityRule = { questionId: string; equalsOptionId: string };

type Option = {
  id: string;
  label: string;
  hasFreeText?: boolean;
};

type BaseQuestion = {
  id: string;
  title: string;
  required?: boolean;
  visibleIf?: VisibilityRule;
  notes?: string; // 題目後補充文字（如：請選 3 項）
};

type SingleChoiceQuestion = BaseQuestion & {
  type: 'single';
  options: Option[];
};

type MultiChoiceQuestion = BaseQuestion & {
  type: 'multi';
  maxSelect?: number;
  options: Option[];
};

type TextQuestion = BaseQuestion & {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
};

type Question = SingleChoiceQuestion | MultiChoiceQuestion | TextQuestion;

type Section = {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
};

type TerminationRule = {
  questionId: string;
  equalsOptionId: string; // 選到該選項即結束問卷
};

type Survey = {
  title: string;
  intro: string;
  sections: Section[];
  terminationRules?: TerminationRule[];
  warnings?: string[]; // 解析警告
};

/** ======== 工具：ID 產生 ======== */
const qid = (n: number) => `q${n}`;
const oid = (q: string, n: number) => `${q}_opt${n}`;
const otherId = (q: string) => `${q}_other`;

/** ======== 正規表達式模式 ======== */
// 章節標題：第一部分/第二部分/Part 1/Sec 1 等
const sectionHeadingRE = /^(?:第[一二三四五六七八九十百千]+[部分章節]|Part\s*\d+|Sec(?:tion)?\s*\d+|\d+\s*\.|【.*?】|\*\*.*?\*\*|#+\s+.*)/i;

// 題號偵測：1. / 1、 / Q1. / １. / １、等
const questionLineRE = /^(?:Q\s*\d+\.|[\d１２３４５６７８９０]+[\.|、)]\s*|\(Q\d+\)\s*)/i;

// 選項開頭偵測：（A）/ A) / A. / （Ａ）/ - • 等
const optionLineRE = new RegExp(
  String.raw`^\s*(?:\(([A-HＡ-Ｈ])\)|([A-HＡ-Ｈ])[\)\.|、]|[\-–—•●·]\s+)`
);

// 題型關鍵詞
const singleKW = /(單選|single\b)/i;
const multiKW = /(複選|多選|可複選|multi\b)/i;
const textKW = /(開放|問答|自由填寫|text\b|open\b)/i;

// 勾選數量限制：請選 3 項 / 最多選 2 個
const maxSelectRE = /(請選\s*(\d+)\s*項|最多選\s*(\d+)\s*(?:個|項))/;

// 可見性/終止關鍵句
const visibleIfRE = /若(?:選擇|勾選|回答)[「『](.*?)[」』]/;
const terminateHintRE = /(問卷將到此結束|結束問卷|停止作答)/;

/** ======== 小工具 ======== */
const fullwidthToHalf = (s: string) => s.replace(/[Ａ-Ｚ０-９．，、（）]/g, (ch) => {
  const code = ch.charCodeAt(0);
  // 全形數字
  if (code >= 0xFF10 && code <= 0xFF19) return String.fromCharCode(code - 0xFF10 + 0x30);
  // 全形大寫 A-Z
  if (code >= 0xFF21 && code <= 0xFF3A) return String.fromCharCode(code - 0xFF21 + 0x41);
  // 全形標點轉半形
  const map: Record<string, string> = {
    '．': '.', '，': ',', '（': '(', '）': ')', '、': '、'
  };
  return map[ch] ?? ch;
});

const normalizeLine = (line: string) => fullwidthToHalf(line).replace(/\s+$/g, '').trim();

/** ======== 解析核心 ======== */
function parseSurveyText(input: string): Survey {
  const warnings: string[] = [];
  const rawLines = input.split(/\r?\n/).map(normalizeLine).filter(l => l.length > 0);

  // 標題：取第一行非空且不像選項/題目的行
  let title = '問卷';
  for (const l of rawLines) {
    if (!optionLineRE.test(l) && !questionLineRE.test(l)) { title = stripDecorations(l); break; }
  }

  // 尋找章節與題目
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let currentQuestion: Question | null = null;
  let qCount = 0;
  const terminationRules: TerminationRule[] = [];

  const pushSection = (title: string) => {
    const id = `sec${sections.length + 1}`;
    const sec: Section = { id, title: stripDecorations(title), questions: [] };
    sections.push(sec); return sec;
  };

  const ensureSection = () => {
    if (!currentSection) currentSection = pushSection('一般');
  };

  const flushQuestion = () => {
    if (currentQuestion && currentSection) {
      // 若沒偵測到題型但有選項，預設單選
      if ((currentQuestion as any).options && !(currentQuestion as any).type) {
        (currentQuestion as any).type = 'single';
      }
      currentSection.questions.push(currentQuestion);
      currentQuestion = null;
    }
  };

  // intro 收集：標題之後到第一個章節/第一題為止
  const introParts: string[] = [];
  let seenStart = false;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!seenStart) {
      if (sectionHeadingRE.test(line) || questionLineRE.test(line)) {
        seenStart = true;
      } else if (line !== title) {
        introParts.push(line);
      }
      continue;
    }

    // 章節標題
    if (sectionHeadingRE.test(line) && !questionLineRE.test(line)) {
      flushQuestion();
      currentSection = pushSection(line.replace(/^#+\s*/, ''));
      continue;
    }

    // 題目起始
    if (questionLineRE.test(line)) {
      flushQuestion();
      qCount += 1;
      const id = qid(qCount);
      const { qTitle, qType, required, notes, maxSelect } = analyzeQuestionHeader(line);
        // 題型預設
        if (qType === 'text') {
        currentQuestion = {
            ...createQuestionSkeleton(id, qTitle),
            type: 'text',
            required,
            notes,
        } as TextQuestion;
        } else if (qType === 'multi') {
        currentQuestion = {
            ...createQuestionSkeleton(id, qTitle),
            type: 'multi',
            required,
            notes,
            options: [],
            maxSelect,
        } as MultiChoiceQuestion;
        } else {
        currentQuestion = {
            ...createQuestionSkeleton(id, qTitle),
            type: 'single',
            required,
            notes,
            options: [],
        } as SingleChoiceQuestion;
        }
        ensureSection();
        continue;
    }

    // 選項行
    if (currentQuestion && optionLineRE.test(line)) {
      const q = currentQuestion as SingleChoiceQuestion | MultiChoiceQuestion;
      if (!('options' in q)) {
        // 先前判成 text，但現在看到選項，轉成單選
        currentQuestion = { ...currentQuestion, type: 'single', options: [] } as SingleChoiceQuestion;
      }
      const optionLabel = stripOptionMarker(line);
      const qId = currentQuestion.id;
      const idx = (q as any).options?.length ?? 0;
      const opt: Option = { id: oid(qId, idx + 1), label: optionLabel };

      // 偵測『其他』型選項
      if (/^其他/.test(optionLabel) || /\(請說明/.test(optionLabel) || /hasFreeText/i.test(optionLabel)) {
        opt.id = otherId(qId);
        opt.hasFreeText = true;
      }

      // 若此選項含終止提示，加入 terminationRules
      if (terminateHintRE.test(optionLabel)) {
        terminationRules.push({ questionId: qId, equalsOptionId: opt.id });
      }

      (currentQuestion as any).options.push(opt);
      continue;
    }

    // 題尾/附註資訊解析（例如：請選 3 項）
    if (currentQuestion) {
      const m = line.match(maxSelectRE);
      if (m && (currentQuestion as any).type === 'multi') {
        const v = parseInt(m[2] || m[3], 10);
        if (!isNaN(v)) (currentQuestion as MultiChoiceQuestion).maxSelect = v;
      }

      // 可見性：若選擇「X」…
      const m2 = line.match(visibleIfRE);
      if (m2) {
        const label = m2[1]?.trim();
        // 嘗試綁定到「上一題」的某選項；若沒有上一題則附掛在自己（較弱假設）
        const bindQ = findPrevQuestionWithOption(sections, currentQuestion.id, label) || (currentQuestion.id ? currentQuestion.id : undefined);
        const bindOpt = bindQ ? findOptionIdByLabel(sections, bindQ, label) : undefined;
        if (bindQ && bindOpt) {
          currentQuestion.visibleIf = { questionId: bindQ, equalsOptionId: bindOpt };
        } else {
          warnings.push(`無法建立 visibleIf：找不到與「${label}」對應的選項`);
        }
      }

      // 若非選項也非題目/章節，視為描述或段落附註：
      if (!sectionHeadingRE.test(line) && !questionLineRE.test(line) && !optionLineRE.test(line)) {
        // 放入目前章節描述或題目 notes
        if (!currentQuestion.notes) currentQuestion.notes = line;
        else currentQuestion.notes += `\n${line}`;
      }
    }
  }

  flushQuestion();

  const survey: Survey = {
    title: stripDecorations(title),
    intro: introParts.join('\n'),
    sections,
    terminationRules: terminationRules.length ? terminationRules : undefined,
    warnings: warnings.length ? warnings : undefined,
  };

  return survey;
}

/** ======== 輔助：建立題目骨架與解析標頭 ======== */
function createQuestionSkeleton(id: string, title: string): BaseQuestion {
  return { id, title: stripDecorations(title), required: true };
}

function analyzeQuestionHeader(line: string): { qTitle: string; qType: 'single'|'multi'|'text'; required: boolean; notes?: string; maxSelect?: number } {
  // 移除題號
  let qTitle = stripQuestionMarker(line).trim();
  let qType: 'single'|'multi'|'text' = 'single';
  let required = true;
  let notes: string | undefined;
  let maxSelect: number | undefined;

  // 題型關鍵詞
  if (textKW.test(qTitle)) qType = 'text';
  else if (multiKW.test(qTitle)) qType = 'multi';
  else if (singleKW.test(qTitle)) qType = 'single';

  // 勾選上限
  const m = qTitle.match(maxSelectRE);
  if (m) {
    const v = parseInt(m[2] || m[3], 10);
    if (!isNaN(v)) maxSelect = v;
  }

  // 必填推斷：若題幹含「必填」「請選」「請勾選」等則視為必填
  if (/(非必填|選填|可不填)/.test(qTitle)) required = false;

  // 將括號附註抽離到 notes（例如： (單選)、(可複選)、(開放填答) ）
  const bracketNotes: string[] = [];
  qTitle = qTitle.replace(/\s*[（(]([^)]*?)[)）]\s*/g, (m) => { bracketNotes.push(m.replace(/[()（）]/g, '').trim()); return ' '; });
  notes = bracketNotes.length ? bracketNotes.join('；') : undefined;

  return { qTitle: qTitle.trim(), qType, required, notes, maxSelect };
}

/** ======== 輔助：查找前一題的某選項 ======== */
function findPrevQuestionWithOption(sections: Section[], currentQId: string, label: string): string | undefined {
  // 線性回溯至 currentQId 之前的題目，尋找包含該 label 的選項
  const allQs: Question[] = sections.flatMap(s => s.questions);
  const idx = allQs.findIndex(q => q.id === currentQId);
  for (let i = idx - 1; i >= 0; i--) {
    const q = allQs[i] as SingleChoiceQuestion | MultiChoiceQuestion | TextQuestion;
    if ('options' in q && Array.isArray(q.options)) {
      const match = q.options.find(o => normalizeLabel(o.label) === normalizeLabel(label));
      if (match) return q.id;
    }
  }
  return undefined;
}

function findOptionIdByLabel(sections: Section[], qId: string, label: string): string | undefined {
  for (const sec of sections) {
    for (const q of sec.questions) {
      if (q.id === qId && 'options' in q) {
        const opt = (q as any).options.find((o: Option) => normalizeLabel(o.label) === normalizeLabel(label));
        if (opt) return opt.id;
      }
    }
  }
  return undefined;
}

/** ======== 清理/標準化 ======== */
function stripDecorations(s: string) {
  return s
    .replace(/^\*+\s*/,'')
    .replace(/^#+\s*/, '')
    .replace(/^【\s*(.*?)\s*】$/, '$1')
    .replace(/^\*\*(.*?)\*\*$/, '$1')
    .trim();
}

function stripQuestionMarker(line: string) {
  return line
    .replace(questionLineRE, '')
    .replace(/^\s*[:：]\s*/, '')
    .trim();
}
// 建議新增：前置核取方塊（Markdown checklist / 全形 / 圖示）
const leadingCheckboxRE = /^\s*(?:[-*]\s*)?(?:\[\s*[xX✓✔✅]?\s*\]|［\s*[xX✓✔✅]?\s*］|☑|✅|✔|✓|☐|◻|□)\s*/;

function stripOptionMarker(line: string) {
  const m = line.match(optionLineRE);
  if (m) {
    // 去掉 (A) 或 A) 或子彈符號
    return line.replace(optionLineRE, '').trim();
  }
  return line.trim();
    // let s = line.trim();

    // // 先去掉 (A) / A) / A. / • / - 等既有的選項前綴
    // if (optionLineRE.test(s)) {
    //     s = s.replace(optionLineRE, '').trim();
    // }

    // // 再去掉前置核取方塊（- [ ]、[x]、☑ 等）
    // s = s.replace(leadingCheckboxRE, '').trim();

    // return s;
}

function normalizeLabel(s: string) {
  return s.replace(/[\s　]/g, '').replace(/[()（）]/g, '');
    // return s
    // .replace(/[\s　]/g, '')                 // 去空白（含全形空白）
    // .replace(/[()（）\[\]［］]/g, '');      // 去 ()、[]、全形［］
}

/** ======== API Route ======== */
export async function POST(req: Request) {
  try {
    const { text, title } = await req.json();
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: '請提供 text:string 於 JSON body' }, { status: 400 });
    }

    const survey = parseSurveyText(text);
    if (title && typeof title === 'string') survey.title = title;

    return NextResponse.json(survey, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}

/** ======== 使用說明（curl 範例） ======== */
// curl -X POST http://localhost:3000/api/survey/parse \
//   -H "Content-Type: application/json" \
//   -d '{"text":"你的問卷文字全文放這裡"}'

/** ======== TODO：可選 LLM 修復（若需要更寬鬆的自然語言解析） ======== */
// - 若設置 USE_LLM=1 與 OPENAI_API_KEY 或 GEMINI_APIKEY，可在 parse 後檢測
//   survey.warnings 是否存在，必要時把原文與草稿 JSON 餵給 LLM 要求校正。
// - 為了安全起見，建議仍以本檔規則為主、LLM 僅做補強或標準化（例如補型別、合併
//   重複選項、推斷 visibleIf 來源問題等）。
