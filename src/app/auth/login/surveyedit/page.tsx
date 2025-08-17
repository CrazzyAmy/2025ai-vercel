/* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// // app/survey-editor/page.tsx
// import React, { useEffect, useMemo, useState } from 'react';
// import { useRouter } from 'next/navigation';
// type QuestionType = 'single' | 'multi' | 'text';

// type Option = {
//   id: string;
//   label: string;
//   hasFreeText?: boolean; // 例如「其他（請說明）」選到才顯示文字框
// };

// type VisibleIf = {
//   questionId: string;
//   equalsOptionId: string;
// };

// type Question = {
//   id: string;
//   title: string;
//   description?: string;
//   type: QuestionType;
//   required?: boolean;
//   options?: Option[];      // single/multi 使用
//   maxSelect?: number;      // multi 可限制最多可選
//   visibleIf?: VisibleIf;   // 條件顯示（例如 Q1=是 才顯示後續題）
// };

// type Section = {
//   id: string;
//   title: string;
//   description?: string;
//   questions: Question[];
// };

// type Survey = {
//   id: string;
//   title: string;
//   intro: string;
//   sections: Section[];
// };
// // 從 API 取得的結果
// type GenResp = { text: string };

// const STORAGE_KEY = 'survey:editable';

// const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;
// const q1_yes = uid('opt_q1_yes');
//             const q1_no = uid('opt_q1_no');
//             const q1: Question = {
//                 id: 'q1',
//                 title: '請問您目前是否有飼養貓咪？',
//                 type: 'single',
//                 required: true,
//                 options: [
//                 { id: q1_yes, label: '是' },
//                 { id: q1_no, label: '否（若選擇「否」，問卷將到此結束）' },
//                 ],
//             };

//             const q2: Question = {
//                 id: 'q2',
//                 title: '您目前主要餵食貓咪哪種類型的飼料？',
//                 type: 'single',
//                 options: [
//                 { id: uid('q2'), label: '乾飼料' },
//                 { id: uid('q2'), label: '濕飼料（罐頭/主食餐包）' },
//                 { id: uid('q2'), label: '半濕飼料' },
//                 { id: uid('q2'), label: '生食/自製鮮食' },
//                 { id: uid('q2'), label: '乾濕混合餵食' },
//                 { id: uid('q2_other'), label: '其他', hasFreeText: true },
//                 ],
//                 required: true,
//                 visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
//             };

//             const q3: Question = {
//                 id: 'q3',
//                 title: '在選購貓飼料時，您最重視的因素有哪些？（請選 3 項）',
//                 type: 'multi',
//                 maxSelect: 3,
//                 options: [
//                 { id: uid('q3'), label: '成分品質（天然、無穀、高肉含量）' },
//                 { id: uid('q3'), label: '價格' },
//                 { id: uid('q3'), label: '品牌聲譽/口碑' },
//                 { id: uid('q3'), label: '適口性（貓咪喜歡吃的程度）' },
//                 { id: uid('q3'), label: '包裝設計/容量大小' },
//                 { id: uid('q3'), label: '獸醫推薦' },
//                 { id: uid('q3'), label: '是否有添加物（防腐劑、人工色素）' },
//                 { id: uid('q3_other'), label: '其他', hasFreeText: true },
//                 ],
//                 required: true,
//                 visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
//             };

//             const q4: Question = {
//                 id: 'q4',
//                 title: '關於此款新品的口味（鮭魚 / 牛肉），您傾向購買哪種？',
//                 type: 'single',
//                 options: [
//                 { id: uid('q4'), label: '鮭魚' },
//                 { id: uid('q4'), label: '牛肉' },
//                 { id: uid('q4'), label: '兩種都會購買，會輪替' },
//                 { id: uid('q4'), label: '無特別偏好' },
//                 ],
//                 required: true,
//                 visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
//             };

//             const q5: Question = {
//                 id: 'q5',
//                 title: '關於此款新品的包裝容量（12 / 20 罐頭），您傾向購買哪種？',
//                 type: 'single',
//                 options: [
//                 { id: uid('q5'), label: '12 罐頭包裝（適合初次嘗試或單貓）' },
//                 { id: uid('q5'), label: '20 罐頭包裝（適合多貓或囤貨）' },
//                 { id: uid('q5'), label: '兩種都會購買，視情況調整' },
//                 { id: uid('q5'), label: '無特別偏好' },
//                 ],
//                 required: true,
//                 visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
//             };

//             const q6: Question = {
//                 id: 'q6',
//                 title: '您考慮購買此款新品的意願？',
//                 type: 'single',
//                 options: [
//                 { id: uid('q6'), label: '非常低（完全不考慮）' },
//                 { id: uid('q6'), label: '低（不太考慮）' },
//                 { id: uid('q6'), label: '中等（可能會考慮）' },
//                 { id: uid('q6'), label: '高（很有可能會考慮）' },
//                 { id: uid('q6'), label: '非常高（一定會購買）' },
//                 ],
//                 required: true,
//                 visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
//             };

//             const q7: Question = {
//                 id: 'q7',
//                 title: '「12 罐頭包裝」的合理價格區間？',
//                 type: 'single',
//                 options: [
//                 { id: uid('q7'), label: '低於 NT$200' },
//                 { id: uid('q7'), label: 'NT$201 - NT$300' },
//                 { id: uid('q7'), label: 'NT$301 - NT$400' },
//                 { id: uid('q7'), label: 'NT$401 - NT$500' },
//                 { id: uid('q7'), label: '高於 NT$500' },
//                 ],
//                 required: true,
//                 visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
//             };

//             const q8: Question = {
//                 id: 'q8',
//                 title: '您通常透過哪些管道得知新的貓飼料資訊？（可複選）',
//                 type: 'multi',
//                 options: [
//                 { id: uid('q8'), label: '寵物用品實體店面' },
//                 { id: uid('q8'), label: '獸醫院推薦' },
//                 { id: uid('q8'), label: '社群媒體（FB/IG/YouTube）' },
//                 { id: uid('q8'), label: '網路論壇/部落格（Dcard/PTT/貓社團）' },
//                 { id: uid('q8'), label: '朋友/飼主社群推薦' },
//                 { id: uid('q8'), label: '線上購物平台（蝦皮/Momo/PChome）' },
//                 { id: uid('q8'), label: '雜誌/報紙廣告' },
//                 { id: uid('q8'), label: '電視廣告' },
//                 { id: uid('q8_other'), label: '其他', hasFreeText: true },
//                 ],
//                 required: true,
//                 visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
//             };

//             const q9: Question = {
//                 id: 'q9',
//                 title: '對於這款新品（鮭魚/牛肉，12/20 罐頭包裝），您的建議或想法？',
//                 type: 'text',
//                 required: false,
//                 visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
//             };

//             const q10: Question = {
//                 id: 'q10',
//                 title: '請問您的年齡層是？',
//                 type: 'single',
//                 options: [
//                 { id: uid('q10'), label: '20 歲以下' },
//                 { id: uid('q10'), label: '20-29 歲' },
//                 { id: uid('q10'), label: '30-39 歲' },
//                 { id: uid('q10'), label: '40-49 歲' },
//                 { id: uid('q10'), label: '50 歲以上' },
//                 ],
//                 required: true,
//             };
//             const svey: Survey={
//                     id: 'cat-canned-food-survey',
//                     title: '貓咪新品罐頭飼料市調問卷',
//                     intro:
//                     '感謝您撥冗參與本次問卷調查。本問卷約需 3-5 分鐘，您的回答將僅用於市場研究分析。',
//                     sections: [
//                     {
//                         id: 'sec1',
//                         title: '<第一部分：基本資料與養貓習慣（篩選）>',
//                         questions: [q1, q2],
//                     },
//                     {
//                         id: 'sec2',
//                         title: '<第二部分：新品需求與偏好>',
//                         description:
//                         '新品提供鮭魚與牛肉兩種口味，以及 12/20 罐頭兩種尺寸選擇。',
//                         questions: [q3, q4, q5, q6, q7, q8],
//                     },
//                     {
//                         id: 'sec3',
//                         title: '<第三部分：開放意見與基本資料>',
//                         questions: [q9, q10],
//                     },
//                     ],
//                 };


// // --- 以你的問卷建立初始模板 ---
// function useBuildInitialSurvey() {
//     const [data, setData] = useState<Survey | null>(null);
//     const [resultText, setResultText] = useState('');
//     const [loading, setLoading] = useState(false);
//     const [err, setErr] = useState<string | null>(null);
//     const [survey, setSurvey]   = useState<Survey | null>(null);

//     useEffect(() => {
//         let cancelled = false;

//         (async () => {
//             try {
//                 const raw = sessionStorage.getItem('survey:settings2');
//                 if (!raw) throw new Error('找不到 survey:settings2');

//                 // raw 可能是「純文字問卷」，也可能本來就已是 JSON。
//                 // 嘗試解析；若已是結構化問卷就直接使用；否則丟給 /api/survey/parse。
//                 try {
//                     const maybe = JSON.parse(raw);
//                     if (maybe.title && Array.isArray(maybe.sections)) {
//                         if (!cancelled) setSurvey(maybe as Survey);
//                         console.log("maybe is json");
//                         return;
//                     }
//                 } catch { /* raw 不是 JSON，當作純文字 */ }

//                 // 呼叫你的「任意文字→JSON」API（注意：body 鍵名是 text，不是 data）
//                 // const res = await fetch('/api/survey/parse', {
//                 //     method: 'POST',
//                 //     headers: { 'Content-Type': 'application/json' },
//                 //     body: JSON.stringify({ text: raw })
//                 // });
//                 //版本二:
//                 // const res = await fetch("/api/survey/generate", {
//                 //   method: "POST",
//                 //   headers: { "Content-Type": "application/json" },
//                 //   body: JSON.stringify({ format: "json", survey }),
//                 // });

//                 // if (!res.ok) {
//                 //     const e = await res.json().catch(() => ({}));
//                 //     throw new Error(e?.error ?? `HTTP ${res.status}`);
//                 // }

//                 // const parsed = (await res.json()) as Survey; // 直接拿回 JSON 物件
//                 if (!cancelled) setSurvey(survey);
//                 console.log("line265 survey="+survey);
//             } catch (e: any) {
//                 if (!cancelled) setErr(e?.message ?? String(e));
//             } finally {
//                 if (!cancelled) setLoading(false);
//             }
//         })();

//         // return a cleanup function if needed
//         return () => { cancelled = true; };
//     }, []);
            
//             return {survey, setSurvey, loading, err};
//         }
    
//     //const q1: Question;

//   // 問題 1：是否養貓（是/否），否則結束（後續題目僅在 Q1=是 時顯示）

        
        

//   //return survey;
// //   {
// //     id: 'cat-canned-food-survey',
// //     title: '貓咪新品罐頭飼料市調問卷',
// //     intro:
// //       '感謝您撥冗參與本次問卷調查。本問卷約需 3-5 分鐘，您的回答將僅用於市場研究分析。',
// //     sections: [
// //       {
// //         id: 'sec1',
// //         title: '第一部分：基本資料與養貓習慣（篩選）',
// //         questions: [q1, q2],
// //       },
// //       {
// //         id: 'sec2',
// //         title: '第二部分：新品需求與偏好',
// //         description:
// //           '新品提供鮭魚與牛肉兩種口味，以及 12/20 罐頭兩種尺寸選擇。',
// //         questions: [q3, q4, q5, q6, q7, q8],
// //       },
// //       {
// //         id: 'sec3',
// //         title: '第三部分：開放意見與基本資料',
// //         questions: [q9, q10],
// //       },
// //     ],
// //   };
// //}

// // ---- 小工具：移動陣列元素 ----
// function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
//   const next = [...arr];
//   const newIdx = index + dir;
//   if (newIdx < 0 || newIdx >= arr.length) return next;
//   [next[index], next[newIdx]] = [next[newIdx], next[index]];
//   return next;
// }

// // ---- 問卷預覽狀態（受測者填答用）----
// type Answers = Record<
//   string,
//   { // key: questionId
//     single?: string;        // 選到的 optionId（single）
//     multi?: string[];       // 勾選的 optionId（multi）
//     text?: string;          // 開放文字
//     freeText?: Record<string, string>; // 針對 hasFreeText 的各選項補充
//   }
// >;

// export default function SurveyEditorPage() {
//     const router = useRouter();
//     const handleGoBack = () => router.push('/auth/login/gensurvey');
//     const { survey, setSurvey, loading, err } = useBuildInitialSurvey(); 
//     // const [survey, setSurvey] = useState<Survey>(() => {
//     //     if (typeof localStorage === 'undefined') return useBuildInitialSurvey();
//     //     try {
//     //     const raw = localStorage.getItem(STORAGE_KEY);
//     //     return raw ? (JSON.parse(raw) as Survey) : useBuildInitialSurvey();
//     //     } catch {
//     //     return useBuildInitialSurvey();
//     //     }
//     // });

//     const [preview, setPreview] = useState(false);
//     const [answers, setAnswers] = useState<Answers>({});

//     useEffect(() => {
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
//         console.log("line354 survey="+JSON.stringify(survey));
//     }, [survey]);

//   // 用於 visibleIf：檢查問題是否顯示（依目前 answers）
//   const isQuestionVisible = (q: Question): boolean => {
//     if (!q.visibleIf) return true;
//     const a = answers[q.visibleIf.questionId];
//     const selected = a?.single ?? a?.multi?.[0]; // 只支援與「某選項相等」的條件
//     return selected === q.visibleIf.equalsOptionId;
//   };

//   // --- 編輯器操作 ---
//   const addQuestion = (secIdx: number) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       if(!ns){
//         console.log("line369 ns is null");return svey;
//       }else{
//         ns.sections[secIdx].questions.push({
//           id: uid('q'),
//           title: '未命名題目',
//           type: 'single',
//           options: [
//             { id: uid('opt'), label: '選項 1' },
//             { id: uid('opt'), label: '選項 2' },
//           ],
//         });
//       }
//       return ns;
//     });
//   };

//   const removeQuestion = (secIdx: number, qIdx: number) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       // if(!ns)
//       // {
//       //     console.log("line391 ns is null");return svey;
//       // }else{
//       //      ns.sections[secIdx].questions.splice(qIdx, 1);
//       // }
//       try{
//         if (!ns) {
//           console.log("line397 ns is null");return svey;
//         }
//         ns.sections[secIdx].questions.splice(qIdx, 1);
//       }catch{
//         console.log("line397 ns is null");return svey;
//       }
//       return ns;
//     });
//   };

//   const moveQuestion = (secIdx: number, qIdx: number, dir: -1 | 1) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       if(!ns){
//         console.log("line410 ns is null");return svey;
//       }
//       ns.sections[secIdx].questions = move(ns.sections[secIdx].questions, qIdx, dir);
//       return ns;
//     });
//   };

//   const duplicateQuestion = (secIdx: number, qIdx: number) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       if(!ns){
//         console.log("line422 ns is null");return svey;
//       }
//       const q = ns.sections[secIdx].questions[qIdx];
//       const copy = structuredClone(q);
//       copy.id = uid('q');
//       copy.options = copy.options?.map((o) => ({ ...o, id: uid('opt') }));
//       ns.sections[secIdx].questions.splice(qIdx + 1, 0, copy);
//       return ns;
//     });
//   };

//   const updateQuestion = (
//     secIdx: number,
//     qIdx: number,
//     patch: Partial<Question>
//   ) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       if(!ns){
//         console.log("line441 ns is null");return ns;
//       }
//       ns.sections[secIdx].questions[qIdx] = {
//         ...ns.sections[secIdx].questions[qIdx],
//         ...patch,
//       };
//       return ns;
//     });
//   };

//   const addOption = (secIdx: number, qIdx: number) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       if(!ns){
//         console.log("line455 ns is null");return ns;
//       }
//       const q = ns.sections[secIdx].questions[qIdx];
//       q.options = q.options ?? [];
//       q.options.push({ id: uid('opt'), label: `選項 ${q.options.length + 1}` });
//       return ns;
//     });
//   };

//   const updateOption = (
//     secIdx: number,
//     qIdx: number,
//     optIdx: number,
//     patch: Partial<Option>
//   ) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       if(!ns){
//         console.log("line473 ns is null");return ns;
//       }
//       const q = ns.sections[secIdx].questions[qIdx];
//       if (!q.options) q.options = [];
//       q.options[optIdx] = { ...q.options[optIdx], ...patch };
//       return ns;
//     });
//   };

//   const removeOption = (secIdx: number, qIdx: number, optIdx: number) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       if(!ns){
//         console.log("line486 ns is null");return ns;
//       }
//       const q = ns.sections[secIdx].questions[qIdx];
//       q.options = (q.options ?? []).filter((_, i) => i !== optIdx);
//       return ns;
//     });
//   };

//   const moveOption = (secIdx: number, qIdx: number, optIdx: number, dir: -1 | 1) => {
//     setSurvey((s) => {
//       const ns = structuredClone(s);
//       if(!ns){
//         console.log("line498 ns is null");return ns;
//       }
//       const q = ns.sections[secIdx].questions[qIdx];
//       if (!q.options) return ns;
//       q.options = move(q.options, optIdx, dir);
//       return ns;
//     });
//   };

//   // --- 匯出/匯入 ---
//   const exportJson = () => {
//     const blob = new Blob([JSON.stringify(survey, null, 2)], { type: 'application/json' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     if(!survey){
//       console.log("line511 survey is null");return svey;
//     }
//     a.download = `${survey.title || 'survey'}.json`;
//     a.href = url;
//     a.click();
//     URL.revokeObjectURL(url);
//   };
//   const importJson: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
//     const f = e.target.files?.[0];
//     if (!f) return;
//     try {
//       const text = await f.text();
//       const obj = JSON.parse(text) as Survey;
//       setSurvey(obj);
//     } catch {
//       alert('匯入失敗：不是合法的 Survey JSON');
//     } finally {
//       e.currentTarget.value = '';
//     }
//   };

//   // --- 受測者預覽填答 ---
//   const toggleSingle = (qid: string, optionId: string) => {
//     setAnswers((a) => ({
//       ...a,
//       [qid]: { ...(a[qid] ?? {}), single: optionId, multi: undefined },
//     }));
//   };
//   const toggleMulti = (qid: string, optionId: string, max?: number) => {
//     setAnswers((a) => {
//       const cur = new Set(a[qid]?.multi ?? []);
//       if (cur.has(optionId)) cur.delete(optionId);
//       else {
//         if (!max || cur.size < max) cur.add(optionId);
//       }
//       return {
//         ...a,
//         [qid]: { ...(a[qid] ?? {}), multi: Array.from(cur), single: undefined },
//       };
//     });
//   };
//   const setText = (qid: string, text: string) => {
//     setAnswers((a) => ({ ...a, [qid]: { ...(a[qid] ?? {}), text } }));
//   };
//   const setFreeText = (qid: string, optId: string, text: string) => {
//     setAnswers((a) => {
//       const ft = { ...(a[qid]?.freeText ?? {}) };
//       ft[optId] = text;
//       return { ...a, [qid]: { ...(a[qid] ?? {}), freeText: ft } };
//     });
//   };

//   const resetToTemplate = () => {
//     if (!confirm('將問卷重設為模板？目前編輯內容將遺失。')) return;
//     const tmpl = useBuildInitialSurvey();
//     if (!tmpl || !tmpl.survey) {
//         setSurvey(survey);
//     } else {
//         setSurvey(tmpl.survey);
//         setAnswers({});
//         localStorage.setItem(STORAGE_KEY, JSON.stringify(tmpl.survey));
//     }
//   };
//   type QuestionType = 'single' | 'multi' | 'text';

//     type Option = { id: string; label: string; hasFreeText?: boolean };

//     type AnswerUnit = {
//     single?: string;          // 單選：被選的 optionId
//     multi?: string[];         // 複選：被選的 optionId 陣列
//     text?: string;            // 開放填答（type === 'text'）
//     freeText?: Record<string, string>; // 針對「需補充文字」的選項，key = optionId
//     };

//     type Answers = Record<string, AnswerUnit>; // key = questionId

    
//   // 驗證：簡單檢查必填題是否有答（僅預覽用）
//   const missingRequired = useMemo(() => {
//     const list: string[] = [];
//     if (!survey || !survey.sections) return list;
//     for (const sec of survey.sections) {
//       for (const q of sec.questions) {
//         if (!q.required || !isQuestionVisible(q)) continue;
//         const a = answers[q.id];
//         if (q.type === 'single' && !a?.single) list.push(q.id);
//         if (q.type === 'multi' && !(a?.multi && a.multi.length > 0)) list.push(q.id);
//         if (q.type === 'text' && !(a?.text && a.text.trim())) list.push(q.id);
//       }
//     }
//     return list;
//   }, [survey, answers]);

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       {/* 工具列 */}
//       <div className="flex flex-wrap items-center gap-3">
//         <button
//           className="px-3 py-2 rounded bg-blue-600 text-white"
//           onClick={() => setPreview((p) => !p)}
//         >
//           {preview ? '返回編輯' : '預覽模式'}
//         </button>
//         <button
//           className="px-3 py-2 rounded bg-gray-200"
//           onClick={exportJson}
//           title="匯出 JSON"
//         >
//           匯出
//         </button>
//         <label className="px-3 py-2 rounded bg-gray-200 cursor-pointer">
//           匯入
//           <input type="file" accept="application/json" className="hidden" onChange={importJson} />
//         </label>
//         <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={resetToTemplate}>
//           重設模板
//         </button>
//       </div>

//       {/* 標題與前言 */}
//       {!preview ? (
//         <div className="space-y-3">
//           <input
//             className="w-full border rounded px-3 py-2 text-xl font-semibold"
//             value={(survey?.title) ?? svey.title}
//             onChange={(e) => setSurvey({ ...survey??svey, title: e.target.value })}
//             placeholder="問卷標題"
//           />
//           <textarea
//             className="w-full border rounded px-3 py-2"
//             rows={3}
//             value={survey?.intro ?? svey.intro}
//             onChange={(e) => setSurvey({ ...survey??svey, intro: e.target.value })}
//             placeholder="問卷說明/前言"
//           />
//         </div>
//       ) : (
//         <header className="space-y-2">
//           <h1 className="text-2xl font-bold">{survey?.title ?? svey.title}</h1>
//           <p className="text-gray-600">{survey?.intro ?? svey.intro}</p>
//         </header>
//       )}

//       {/* 章節與題目 */}
//       {(survey ? survey.sections : svey.sections).map((sec, secIdx) => (
//         <section key={sec.id} className="border rounded-xl p-4 space-y-4">
//           {!preview ? (
//             <div className="space-y-2">
//               <input
//                 className="w-full border rounded px-3 py-2 font-semibold"
//                 value={sec.title}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setSurvey((s) => {
//                     const ns = structuredClone(s);
//                     if(!ns)return svey;
//                     ns.sections[secIdx].title = v;
//                     return ns;
//                   });
//                 }}
//                 placeholder="章節標題"
//               />
//               <textarea
//                 className="w-full border rounded px-3 py-2"
//                 rows={2}
//                 value={sec.description ?? ''}
//                 onChange={(e) => {
//                   const v = e.target.value;
//                   setSurvey((s) => {
//                     const ns = structuredClone(s);
//                     if(!ns)return svey;
//                     ns.sections[secIdx].description = v;
//                     return ns;
//                   });
//                 }}
//                 placeholder="章節描述（可省略）"
//               />
//             </div>
//           ) : (
//             <>
//               <h2 className="text-xl font-semibold">{sec.title}</h2>
//               {sec.description && <p className="text-gray-600">{sec.description}</p>}
//             </>
//           )}

//           {/* 題目列表 */}
//           <div className="space-y-4">
//             {sec.questions.map((q, qIdx) => {
//               const visible = preview ? isQuestionVisible(q) : true;
//               if (!visible) return null;
//               return (
//                 <div key={q.id} className="rounded-lg border p-4 space-y-3">
//                   {!preview ? (
//                     <>
//                       <div className="flex flex-wrap gap-2 items-center">
//                         <input
//                           className="flex-1 border rounded px-3 py-2 font-medium"
//                           value={q.title}
//                           onChange={(e) =>
//                             updateQuestion(secIdx, qIdx, { title: e.target.value })
//                           }
//                           placeholder="題目標題"
//                         />
//                         <select
//                           className="border rounded px-2 py-2"
//                           value={q.type}
//                           onChange={(e) =>
//                             updateQuestion(secIdx, qIdx, {
//                               type: e.target.value as QuestionType,
//                               // 切換到 text 題型時清掉選項
//                               options:
//                                 e.target.value === 'text'
//                                   ? undefined
//                                   : q.options ?? [
//                                       { id: uid('opt'), label: '選項 1' },
//                                       { id: uid('opt'), label: '選項 2' },
//                                     ],
//                             })
//                           }
//                         >
//                           <option value="single">單選</option>
//                           <option value="multi">複選</option>
//                           <option value="text">文字</option>
//                         </select>
//                         <label className="inline-flex items-center gap-2 text-sm">
//                           <input
//                             type="checkbox"
//                             checked={!!q.required}
//                             onChange={(e) => updateQuestion(secIdx, qIdx, { required: e.target.checked })}
//                           />
//                           必填
//                         </label>
//                       </div>

//                       <input
//                         className="w-full border rounded px-3 py-2"
//                         value={q.description ?? ''}
//                         onChange={(e) => updateQuestion(secIdx, qIdx, { description: e.target.value })}
//                         placeholder="題目描述（可省略）"
//                       />

//                       {(q.type === 'single' || q.type === 'multi') && (
//                         <div className="space-y-2">
//                           <div className="flex items-center justify-between">
//                             <div className="text-sm text-gray-600">
//                               {q.type === 'multi' && (
//                                 <label className="inline-flex items-center gap-2">
//                                   最多可選
//                                   <input
//                                     type="number"
//                                     min={1}
//                                     className="w-20 border rounded px-2 py-1"
//                                     value={q.maxSelect ?? ''}
//                                     onChange={(e) =>
//                                       updateQuestion(secIdx, qIdx, {
//                                         maxSelect: e.target.value ? Number(e.target.value) : undefined,
//                                       })
//                                     }
//                                   />
//                                   項
//                                 </label>
//                               )}
//                             </div>
//                             <button
//                               className="px-2 py-1 rounded bg-gray-200"
//                               onClick={() => addOption(secIdx, qIdx)}
//                             >
//                               新增選項
//                             </button>
//                           </div>

//                           {(q.options ?? []).map((opt, optIdx) => (
//                             <div key={opt.id} className="flex flex-wrap items-center gap-2">
//                               <span className="text-gray-400 text-sm">{optIdx + 1}.</span>
//                               <input
//                                 className="flex-1 min-w-[240px] border rounded px-3 py-1"
//                                 value={opt.label}
//                                 onChange={(e) =>
//                                   updateOption(secIdx, qIdx, optIdx, { label: e.target.value })
//                                 }
//                                 placeholder="選項文字"
//                               />
//                               <label className="text-sm inline-flex items-center gap-1">
//                                 <input
//                                   type="checkbox"
//                                   checked={!!opt.hasFreeText}
//                                   onChange={(e) =>
//                                     updateOption(secIdx, qIdx, optIdx, { hasFreeText: e.target.checked })
//                                   }
//                                 />
//                                 需補充文字（如「其他」）
//                               </label>
//                               <div className="ml-auto flex gap-1">
//                                 <button
//                                   className="px-2 py-1 rounded bg-gray-200"
//                                   onClick={() => moveOption(secIdx, qIdx, optIdx, -1)}
//                                 >
//                                   ↑
//                                 </button>
//                                 <button
//                                   className="px-2 py-1 rounded bg-gray-200"
//                                   onClick={() => moveOption(secIdx, qIdx, optIdx, 1)}
//                                 >
//                                   ↓
//                                 </button>
//                                 <button
//                                   className="px-2 py-1 rounded bg-red-100 text-red-700"
//                                   onClick={() => removeOption(secIdx, qIdx, optIdx)}
//                                 >
//                                   刪除
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}

//                       {/* 條件顯示 */}
//                       <div className="border-t pt-3 space-y-2">
//                         <div className="text-sm text-gray-600">條件顯示（可選）</div>
//                         <div className="flex flex-wrap gap-2">
//                           <select
//                             className="border rounded px-2 py-1"
//                             value={q.visibleIf?.questionId ?? ''}
//                             onChange={(e) => {
//                               const v = e.target.value || undefined;
//                               updateQuestion(secIdx, qIdx, {
//                                 visibleIf: v
//                                   ? { questionId: v, equalsOptionId: '' }
//                                   : undefined,
//                               });
//                             }}
//                           >
//                             <option value="">— 不設定 —</option>
//                             {(survey ? survey.sections : svey.sections).flatMap((s) => s.questions).map((qq) => (
//                               <option key={qq.id} value={qq.id}>
//                                 {qq.id}．{qq.title.slice(0, 30)}
//                               </option>
//                             ))}
//                           </select>

//                           <select
//                             className="border rounded px-2 py-1"
//                             value={q.visibleIf?.equalsOptionId ?? ''}
//                             onChange={(e) => {
//                               const equalsOptionId = e.target.value || '';
//                               updateQuestion(secIdx, qIdx, {
//                                 visibleIf: q.visibleIf
//                                   ? { ...q.visibleIf, equalsOptionId }
//                                   : undefined,
//                               });
//                             }}
//                             disabled={!q.visibleIf?.questionId}
//                           >
//                             <option value="">（選擇上方題目的某選項）</option>
//                             {(() => {
//                               const dep = survey?survey:svey.sections
//                                 .flatMap((s) => s.questions)
//                                 .find((qq) => qq.id === q.visibleIf?.questionId);
//                               return (dep && 'options' in dep && Array.isArray(dep.options) ? dep.options : []).map((oo) => (
//                                 <option key={oo.id} value={oo.id}>
//                                   {oo.label.slice(0, 30)}
//                                 </option>
//                               ));
//                             })()}
//                           </select>

//                           {q.visibleIf && (
//                             <button
//                               className="px-2 py-1 rounded bg-gray-200"
//                               onClick={() => updateQuestion(secIdx, qIdx, { visibleIf: undefined })}
//                             >
//                               清除條件
//                             </button>
//                           )}
//                         </div>
//                       </div>

//                       {/* 題目操作 */}
//                       <div className="flex gap-2">
//                         <button
//                           className="px-2 py-1 rounded bg-gray-200"
//                           onClick={() => moveQuestion(secIdx, qIdx, -1)}
//                         >
//                           上移
//                         </button>
//                         <button
//                           className="px-2 py-1 rounded bg-gray-200"
//                           onClick={() => moveQuestion(secIdx, qIdx, 1)}
//                         >
//                           下移
//                         </button>
//                         <button
//                           className="px-2 py-1 rounded bg-yellow-100"
//                           onClick={() => duplicateQuestion(secIdx, qIdx)}
//                         >
//                           複製
//                         </button>
//                         <button
//                           className="px-2 py-1 rounded bg-red-100 text-red-700"
//                           onClick={() => removeQuestion(secIdx, qIdx)}
//                         >
//                           刪除
//                         </button>
//                       </div>
//                     </>
//                   ) : (
//                     // ---------------- 預覽模式（受測者） ----------------
//                     <div className="space-y-2">
//                       <div className="flex items-start gap-2">
//                         <div className="font-medium">
//                           {q.title} {q.required && <span className="text-red-500">*</span>}
//                         </div>
//                       </div>
//                       {q.description && <div className="text-sm text-gray-600">{q.description}</div>}
//                       {q.type === 'single' && (
//                         <div className="space-y-2">
//                           {(q.options ?? []).map((opt) => (
//                             <label key={opt.id} className="flex items-center gap-2">
//                               <input
//                                 type="radio"
//                                 name={q.id}
//                                 checked={answers[q.id]?.single === opt.id}
//                                 onChange={() => toggleSingle(q.id, opt.id)}
//                               />
//                               <span>{opt.label}</span>
//                               {opt.hasFreeText && answers[q.id]?.single === opt.id && (
//                                 <input
//                                   className="ml-2 border rounded px-2 py-1"
//                                   placeholder="請說明"
//                                   value={answers[q.id]?.freeText?.[opt.id] ?? ''}
//                                   onChange={(e) => setFreeText(q.id, opt.id, e.target.value)}
//                                 />
//                               )}
//                             </label>
//                           ))}
//                         </div>
//                       )}
//                       {q.type === 'multi' && (
//                         <div className="space-y-2">
//                           {(q.options ?? []).map((opt) => {
//                             const picked = new Set(answers[q.id]?.multi ?? []);
//                             const reached = q.maxSelect ? picked.size >= q.maxSelect : false;
//                             const checked = picked.has(opt.id);
//                             return (
//                               <label key={opt.id} className="flex items-center gap-2">
//                                 <input
//                                   type="checkbox"
//                                   checked={checked}
//                                   onChange={() => toggleMulti(q.id, opt.id, q.maxSelect)}
//                                   disabled={!checked && reached}
//                                 />
//                                 <span>{opt.label}</span>
//                                 {opt.hasFreeText && checked && (
//                                   <input
//                                     className="ml-2 border rounded px-2 py-1"
//                                     placeholder="請說明"
//                                     value={answers[q.id]?.freeText?.[opt.id] ?? ''}
//                                     onChange={(e) => setFreeText(q.id, opt.id, e.target.value)}
//                                   />
//                                 )}
//                               </label>
//                             );
//                           })}
//                           {q.maxSelect && (
//                             <div className="text-xs text-gray-500">
//                               最多可選 {q.maxSelect} 項（已選 {answers[q.id]?.multi?.length ?? 0}）
//                             </div>
//                           )}
//                         </div>
//                       )}
//                       {q.type === 'text' && (
//                         <textarea
//                           className="w-full border rounded px-3 py-2"
//                           rows={3}
//                           value={answers[q.id]?.text ?? ''}
//                           onChange={(e) => setText(q.id, e.target.value)}
//                           placeholder="請輸入意見"
//                         />
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {!preview && (
//             <div>
//               <button
//                 className="px-3 py-2 rounded bg-green-600 text-white"
//                 onClick={() => addQuestion(secIdx)}
//               >
//                 新增題目
//               </button>
//             </div>
//           )}
//         </section>
//       ))}

//       {/* 預覽送出（僅示意驗證） */}
//       {preview && (
//         <div className="border-t pt-4">
//           {missingRequired.length > 0 ? (
//             <div className="text-red-600 mb-3">
//               尚有 {missingRequired.length} 題必填未完成。
//             </div>
//           ) : (
//             <div className="text-green-600 mb-3">所有必填題已完成，可送出（示意）。</div>
//           )}
//           <button
//             className="px-4 py-2 rounded bg-blue-600 text-white"
//             onClick={() => alert('此為預覽模式，實際送出可自行串接 API。')}
//           >
//             送出（示意）
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type QuestionType = 'single' | 'multi' | 'text';

type Option = {
  id: string;
  label: string;
  hasFreeText?: boolean; // 例如「其他（請說明）」選到才顯示文字框
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
  options?: Option[];      // single/multi 使用
  maxSelect?: number;      // multi 可限制最多可選
  visibleIf?: VisibleIf;   // 條件顯示（例如 Q1=是 才顯示後續題）
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

const STORAGE_KEY = 'survey:editable';

// 用於產生唯一 ID 的小工具函式
const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`;

// （以下定義了一份預設的問卷模板 svey）
const q1_yes = uid('opt_q1_yes');
const q1_no = uid('opt_q1_no');
const q1: Question = {
  id: 'q1',
  title: '請問您目前是否有飼養貓咪？',
  type: 'single',
  required: true,
  options: [
    { id: q1_yes, label: '是' },
    { id: q1_no, label: '否（若選擇「否」，問卷將到此結束）' },
  ],
};
const q2: Question = {
  id: 'q2',
  title: '您目前主要餵食貓咪哪種類型的飼料？',
  type: 'single',
  options: [
    { id: uid('q2'), label: '乾飼料' },
    { id: uid('q2'), label: '濕飼料（罐頭/主食餐包）' },
    { id: uid('q2'), label: '半濕飼料' },
    { id: uid('q2'), label: '生食/自製鮮食' },
    { id: uid('q2'), label: '乾濕混合餵食' },
    { id: uid('q2_other'), label: '其他', hasFreeText: true },
  ],
  required: true,
  visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
};
const q3: Question = {
  id: 'q3',
  title: '在選購貓飼料時，您最重視的因素有哪些？（請選 3 項）',
  type: 'multi',
  maxSelect: 3,
  options: [
    { id: uid('q3'), label: '成分品質（天然、無穀、高肉含量）' },
    { id: uid('q3'), label: '價格' },
    { id: uid('q3'), label: '品牌聲譽/口碑' },
    { id: uid('q3'), label: '適口性（貓咪喜歡吃的程度）' },
    { id: uid('q3'), label: '包裝設計/容量大小' },
    { id: uid('q3'), label: '獸醫推薦' },
    { id: uid('q3'), label: '是否有添加物（防腐劑、人工色素）' },
    { id: uid('q3'), label: '其他', hasFreeText: true },
  ],
  required: true,
  visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
};
const q4: Question = {
  id: 'q4',
  title: '關於此款新品的口味（鮭魚 / 牛肉），您傾向購買哪種？',
  type: 'single',
  options: [
    { id: uid('q4'), label: '鮭魚' },
    { id: uid('q4'), label: '牛肉' },
    { id: uid('q4'), label: '兩種都會購買，會輪替' },
    { id: uid('q4'), label: '無特別偏好' },
  ],
  required: true,
  visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
};
const q5: Question = {
  id: 'q5',
  title: '關於此款新品的包裝容量（12 / 20 罐頭），您傾向購買哪種？',
  type: 'single',
  options: [
    { id: uid('q5'), label: '12 罐頭包裝（適合初次嘗試或單貓）' },
    { id: uid('q5'), label: '20 罐頭包裝（適合多貓或囤貨）' },
    { id: uid('q5'), label: '兩種都會購買，視情況調整' },
    { id: uid('q5'), label: '無特別偏好' },
  ],
  required: true,
  visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
};
const q6: Question = {
  id: 'q6',
  title: '您考慮購買此款新品的意願？',
  type: 'single',
  options: [
    { id: uid('q6'), label: '非常低（完全不考慮）' },
    { id: uid('q6'), label: '低（不太考慮）' },
    { id: uid('q6'), label: '中等（可能會考慮）' },
    { id: uid('q6'), label: '高（很有可能會考慮）' },
    { id: uid('q6'), label: '非常高（一定會購買）' },
  ],
  required: true,
  visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
};
const q7: Question = {
  id: 'q7',
  title: '「12 罐頭包裝」的合理價格區間？',
  type: 'single',
  options: [
    { id: uid('q7'), label: '低於 NT$200' },
    { id: uid('q7'), label: 'NT$201 - NT$300' },
    { id: uid('q7'), label: 'NT$301 - NT$400' },
    { id: uid('q7'), label: 'NT$401 - NT$500' },
    { id: uid('q7'), label: '高於 NT$500' },
  ],
  required: true,
  visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
};
const q8: Question = {
  id: 'q8',
  title: '您通常透過哪些管道得知新的貓飼料資訊？（可複選）',
  type: 'multi',
  options: [
    { id: uid('q8'), label: '寵物用品實體店面' },
    { id: uid('q8'), label: '獸醫院推薦' },
    { id: uid('q8'), label: '社群媒體（FB/IG/YouTube）' },
    { id: uid('q8'), label: '網路論壇/部落格（Dcard/PTT/貓社團）' },
    { id: uid('q8'), label: '朋友/飼主社群推薦' },
    { id: uid('q8'), label: '線上購物平台（蝦皮/Momo/PChome）' },
    { id: uid('q8'), label: '雜誌/報紙廣告' },
    { id: uid('q8'), label: '電視廣告' },
    { id: uid('q8_other'), label: '其他', hasFreeText: true },
  ],
  required: true,
  visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
};
const q9: Question = {
  id: 'q9',
  title: '對於這款新品（鮭魚/牛肉，12/20 罐頭包裝），您的建議或想法？',
  type: 'text',
  required: false,
  visibleIf: { questionId: 'q1', equalsOptionId: q1_yes },
};
const q10: Question = {
  id: 'q10',
  title: '請問您的年齡層是？',
  type: 'single',
  options: [
    { id: uid('q10'), label: '20 歲以下' },
    { id: uid('q10'), label: '20-29 歲' },
    { id: uid('q10'), label: '30-39 歲' },
    { id: uid('q10'), label: '40-49 歲' },
    { id: uid('q10'), label: '50 歲以上' },
  ],
  required: true,
};
const svey: Survey = {
  id: 'cat-canned-food-survey',
  title: '貓咪新品罐頭飼料市調問卷',
  intro: '感謝您撥冗參與本次問卷調查。本問卷約需 3-5 分鐘，您的回答將僅用於市場研究分析。',
  sections: [
    {
      id: 'sec1',
      title: '<第一部分：基本資料與養貓習慣（篩選）>',
      questions: [q1, q2],
    },
    {
      id: 'sec2',
      title: '<第二部分：新品需求與偏好>',
      description: '新品提供鮭魚與牛肉兩種口味，以及 12/20 罐頭兩種尺寸選擇。',
      questions: [q3, q4, q5, q6, q7, q8],
    },
    {
      id: 'sec3',
      title: '<第三部分：開放意見與基本資料>',
      questions: [q9, q10],
    },
  ],
};

// ---------- 小工具與型別保護 ----------

const asBool = (v: any) => v === true;

const isQuestionType = (t: any): t is QuestionType =>
  t === 'single' || t === 'multi' || t === 'text';

const stripBOM = (s: string) => s.replace(/^\uFEFF/, '').trim();

/** 嘗試解析 JSON；支援雙重字串化（parse 後仍是字串再 parse 一次） */
function safeParseJson(raw: string): any {
  const s = stripBOM(String(raw));
  let x: any;
  try {
    x = JSON.parse(s);
  } catch {
    // 若真的不是 JSON，直接回傳 undefined
    return undefined;
  }
  if (typeof x === 'string') {
    try {
      const y = JSON.parse(stripBOM(x));
      return y;
    } catch {
      // 不是雙重字串，保持原樣
    }
  }
  return x;
}

function toOption(o: any): Option {
  return {
    id: String(o?.id ?? uid('opt')),
    label: String(o?.label ?? ''),
    hasFreeText: asBool(o?.hasFreeText),
  };
}

function toQuestion(q: any): Question {
  const type: QuestionType = isQuestionType(q?.type) ? q.type : 'text';
  const base: Question = {
    id: String(q?.id ?? uid('q')),
    title: String(q?.title ?? ''),
    description: q?.description ? String(q.description) : undefined,
    type,
    required: asBool(q?.required),
    maxSelect: Number.isFinite(q?.maxSelect) ? Number(q.maxSelect) : undefined,
  };

  // options 僅在 single/multi 使用
  if (type !== 'text' && Array.isArray(q?.options)) {
    base.options = q.options.map(toOption);
  }

  // visibleIf（必須帶 questionId 與 equalsOptionId）
  if (q?.visibleIf?.questionId && q?.visibleIf?.equalsOptionId) {
    base.visibleIf = {
      questionId: String(q.visibleIf.questionId),
      equalsOptionId: String(q.visibleIf.equalsOptionId),
    };
  }
  return base;
}

function toSection(s: any): Section {
  return {
    id: String(s?.id ?? uid('sec')),
    title: String(s?.title ?? ''),
    description: s?.description ? String(s.description) : undefined,
    questions: Array.isArray(s?.questions) ? s.questions.map(toQuestion) : [],
  };
}

function toSurvey(x: any): Survey {
  return {
    id: String(x?.id ?? uid('survey')),
    title: String(x?.title ?? '未命名問卷'),
    intro: String(x?.intro ?? ''),
    sections: Array.isArray(x?.sections) ? x.sections.map(toSection) : [],
  };
}

// ---------- 以 sessionStorage 建立初始 Survey ----------
function useBuildInitialSurvey() {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = sessionStorage.getItem('survey:settings2');
        if (!raw || raw === 'null' || raw === 'undefined') {
          throw new Error('找不到或內容為空 (survey:settings2)');
        }

        const data = safeParseJson(raw);
        if (!data || !data.sections) {
          throw new Error('JSON.parse 失敗或結構不完整');
        }

        const parsed = toSurvey(data);

        // 最少要有 id/title/sections 這些欄位
        if (!parsed.title || !Array.isArray(parsed.sections)) {
          throw new Error('問卷必要欄位缺失');
        }

        if (!cancelled) setSurvey(parsed);
      } catch (e: any) {
        console.error('[survey init] 解析錯誤：', e);
        if (!cancelled) {
          // 不再 throw，避免整頁紅字崩潰；同時提供 fallback
          setErr(e?.message ?? '未知錯誤');
          setSurvey(structuredClone(svey));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { survey, setSurvey, loading, err };
}


function move<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const newIdx = index + dir;
  if (newIdx < 0 || newIdx >= arr.length) return next;
  [next[index], next[newIdx]] = [next[newIdx], next[index]];
  return next;
}

// 問卷預覽的填答狀態類型
type Answers = Record<string, {
  single?: string;
  multi?: string[];
  text?: string;
  freeText?: Record<string, string>;
}>;

export default function SurveyEditorPage() {
  const router = useRouter();
  const { survey, setSurvey, loading, err } = useBuildInitialSurvey();
  const [preview, setPreview] = useState(false);
  const [answers, setAnswers] = useState<Answers>({});

  // 將目前編輯的問卷內容存入 localStorage 以便持續編輯
  useEffect(() => {
    if (survey) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(survey));
      console.log("已將問卷存入 localStorage:", survey);
    }
  }, [survey]);

  // 根據 visibleIf 判斷題目是否顯示
  const isQuestionVisible = (q: Question): boolean => {
    if (!q.visibleIf) return true;
    const a = answers[q.visibleIf.questionId];
    const selected = a?.single ?? a?.multi?.[0];
    return selected === q.visibleIf.equalsOptionId;
  };

  // 編輯器操作相關函式們：
  const addQuestion = (secIdx: number) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      ns.sections[secIdx].questions.push({
        id: uid('q'),
        title: '未命名題目',
        type: 'single',
        options: [
          { id: uid('opt'), label: '選項 1' },
          { id: uid('opt'), label: '選項 2' },
        ],
      });
      return ns;
    });
  };

  const removeQuestion = (secIdx: number, qIdx: number) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      ns.sections[secIdx].questions.splice(qIdx, 1);
      return ns;
    });
  };

  const moveQuestion = (secIdx: number, qIdx: number, dir: -1 | 1) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      ns.sections[secIdx].questions = move(ns.sections[secIdx].questions, qIdx, dir);
      return ns;
    });
  };

  const duplicateQuestion = (secIdx: number, qIdx: number) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      const q = ns.sections[secIdx].questions[qIdx];
      const copy = structuredClone(q);
      copy.id = uid('q');
      copy.options = copy.options?.map((o) => ({ ...o, id: uid('opt') }));
      ns.sections[secIdx].questions.splice(qIdx + 1, 0, copy);
      return ns;
    });
  };

  const updateQuestion = (secIdx: number, qIdx: number, patch: Partial<Question>) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      ns.sections[secIdx].questions[qIdx] = {
        ...ns.sections[secIdx].questions[qIdx],
        ...patch,
      };
      return ns;
    });
  };

  const addOption = (secIdx: number, qIdx: number) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      const q = ns.sections[secIdx].questions[qIdx];
      q.options = q.options ?? [];
      q.options.push({ id: uid('opt'), label: `選項 ${q.options.length + 1}` });
      return ns;
    });
  };

  const updateOption = (secIdx: number, qIdx: number, optIdx: number, patch: Partial<Option>) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      const q = ns.sections[secIdx].questions[qIdx];
      if (!q.options) q.options = [];
      q.options[optIdx] = { ...q.options[optIdx], ...patch };
      return ns;
    });
  };

  const removeOption = (secIdx: number, qIdx: number, optIdx: number) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      const q = ns.sections[secIdx].questions[qIdx];
      q.options = (q.options ?? []).filter((_, i) => i !== optIdx);
      return ns;
    });
  };

  const moveOption = (secIdx: number, qIdx: number, optIdx: number, dir: -1 | 1) => {
    setSurvey((s) => {
      const ns = structuredClone(s);
      if (!ns) return ns;
      const q = ns.sections[secIdx].questions[qIdx];
      if (!q.options) return ns;
      q.options = move(q.options, optIdx, dir);
      return ns;
    });
  };

  const exportJson = () => {
    if (!survey) return;
    const blob = new Blob([JSON.stringify(survey, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `${survey.title || 'survey'}.json`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const obj = JSON.parse(text) as Survey;
      setSurvey(obj);
    } catch {
      alert('匯入失敗：不是合法的 Survey JSON');
    } finally {
      e.currentTarget.value = '';
    }
  };

  // 受測者預覽填答相關函式：
  const toggleSingle = (qid: string, optionId: string) => {
    setAnswers((a) => ({
      ...a,
      [qid]: { ...(a[qid] ?? {}), single: optionId, multi: undefined },
    }));
  };

  const toggleMulti = (qid: string, optionId: string, max?: number) => {
    setAnswers((a) => {
      const cur = new Set(a[qid]?.multi ?? []);
      if (cur.has(optionId)) {
        cur.delete(optionId);
      } else {
        if (!max || cur.size < max) cur.add(optionId);
      }
      return {
        ...a,
        [qid]: { ...(a[qid] ?? {}), multi: Array.from(cur), single: undefined },
      };
    });
  };

  const setText = (qid: string, text: string) => {
    setAnswers((a) => ({ ...a, [qid]: { ...(a[qid] ?? {}), text } }));
  };

  const setFreeText = (qid: string, optId: string, text: string) => {
    setAnswers((a) => {
      const ft = { ...(a[qid]?.freeText ?? {}) };
      ft[optId] = text;
      return { ...a, [qid]: { ...(a[qid] ?? {}), freeText: ft } };
    });
  };

  const resetToTemplate = () => {
    if (!confirm('將問卷重設為模板？目前編輯內容將遺失。')) return;
    // 重設為預設模板 (這裡使用 svey 或重新讀取 sessionStorage 的資料)
    setSurvey(structuredClone(svey));
    setAnswers({});
    localStorage.setItem(STORAGE_KEY, JSON.stringify(svey));
  };

  // 簡單驗證必填題是否都已填答（預覽模式下示意用）
  const missingRequired = useMemo(() => {
    const list: string[] = [];
    if (!survey) return list;
    for (const sec of survey.sections) {
      for (const q of sec.questions) {
        if (!q.required || !isQuestionVisible(q)) continue;
        const a = answers[q.id];
        if (q.type === 'single' && !a?.single) list.push(q.id);
        if (q.type === 'multi' && !(a?.multi && a.multi.length > 0)) list.push(q.id);
        if (q.type === 'text' && !(a?.text && a.text.trim())) list.push(q.id);
      }
    }
    return list;
  }, [survey, answers]);

  if (err) {
    // 如果初始化問卷時發生錯誤，顯示錯誤訊息
    return <div className="max-w-4xl mx-auto p-6 text-red-600">載入問卷資料時發生錯誤：{err}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 工具列 */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="px-3 py-2 rounded bg-blue-600 text-white"
          onClick={() => setPreview((p) => !p)}
        >
          {preview ? '返回編輯' : '預覽模式'}
        </button>
        <button className="px-3 py-2 rounded bg-gray-200" onClick={exportJson} title="匯出 JSON">
          匯出
        </button>
        <label className="px-3 py-2 rounded bg-gray-200 cursor-pointer">
          匯入
          <input type="file" accept="application/json" className="hidden" onChange={importJson} />
        </label>
        <button className="px-3 py-2 rounded bg-red-600 text-white" onClick={resetToTemplate}>
          重設模板
        </button>
      </div>

      {/* 標題與前言 */}
      {!preview ? (
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2 text-xl font-semibold"
            value={survey?.title ?? svey.title}
            onChange={(e) => setSurvey({ ...(survey ?? svey), title: e.target.value })}
            placeholder="問卷標題"
          />
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={survey?.intro ?? svey.intro}
            onChange={(e) => setSurvey({ ...(survey ?? svey), intro: e.target.value })}
            placeholder="問卷說明/前言"
          />
        </div>
      ) : (
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">{survey?.title ?? svey.title}</h1>
          <p className="text-gray-600">{survey?.intro ?? svey.intro}</p>
        </header>
      )}

      {/* 章節與題目清單 */}
      {(survey ? survey.sections : svey.sections).map((sec, secIdx) => (
        <section key={sec.id} className="border rounded-xl p-4 space-y-4">
          {!preview ? (
            <div className="space-y-2">
              <input
                className="w-full border rounded px-3 py-2 font-semibold"
                value={sec.title}
                onChange={(e) => {
                  const v = e.target.value;
                  setSurvey((s) => {
                    const ns = structuredClone(s);
                    if (!ns) return ns;
                    ns.sections[secIdx].title = v;
                    return ns;
                  });
                }}
                placeholder="章節標題"
              />
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={2}
                value={sec.description ?? ''}
                onChange={(e) => {
                  const v = e.target.value;
                  setSurvey((s) => {
                    const ns = structuredClone(s);
                    if (!ns) return ns;
                    ns.sections[secIdx].description = v;
                    return ns;
                  });
                }}
                placeholder="章節描述（可省略）"
              />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold">{sec.title}</h2>
              {sec.description && <p className="text-gray-600">{sec.description}</p>}
            </>
          )}

          {/* 該章節下的題目列表 */}
          <div className="space-y-4">
            {sec.questions.map((q, qIdx) => {
              const visible = preview ? isQuestionVisible(q) : true;
              if (!visible) return null;
              return (
                <div key={q.id} className="rounded-lg border p-4 space-y-3">
                  {!preview ? (
                    <>
                      <div className="flex flex-wrap gap-2 items-center">
                        <input
                          className="flex-1 border rounded px-3 py-2 font-medium"
                          value={q.title}
                          onChange={(e) => updateQuestion(secIdx, qIdx, { title: e.target.value })}
                          placeholder="題目標題"
                        />
                        <select
                          className="border rounded px-2 py-2"
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(secIdx, qIdx, {
                              type: e.target.value as QuestionType,
                              options:
                                e.target.value === 'text'
                                  ? undefined
                                  : q.options ?? [
                                      { id: uid('opt'), label: '選項 1' },
                                      { id: uid('opt'), label: '選項 2' },
                                    ],
                            })
                          }
                        >
                          <option value="single">單選</option>
                          <option value="multi">複選</option>
                          <option value="text">文字</option>
                        </select>
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={!!q.required}
                            onChange={(e) =>
                              updateQuestion(secIdx, qIdx, { required: e.target.checked })
                            }
                          />
                          必填
                        </label>
                      </div>

                      <input
                        className="w-full border rounded px-3 py-2"
                        value={q.description ?? ''}
                        onChange={(e) =>
                          updateQuestion(secIdx, qIdx, { description: e.target.value })
                        }
                        placeholder="題目描述（可省略）"
                      />

                      {(q.type === 'single' || q.type === 'multi') && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            {q.type === 'multi' && (
                              <div className="text-sm text-gray-600">
                                <label className="inline-flex items-center gap-2">
                                  最多可選
                                  <input
                                    type="number"
                                    min={1}
                                    className="w-20 border rounded px-2 py-1"
                                    value={q.maxSelect ?? ''}
                                    onChange={(e) =>
                                      updateQuestion(secIdx, qIdx, {
                                        maxSelect: e.target.value
                                          ? Number(e.target.value)
                                          : undefined,
                                      })
                                    }
                                  />
                                  項
                                </label>
                              </div>
                            )}
                            <button
                              className="px-2 py-1 rounded bg-gray-200"
                              onClick={() => addOption(secIdx, qIdx)}
                            >
                              新增選項
                            </button>
                          </div>

                          {(q.options ?? []).map((opt, optIdx) => (
                            <div key={opt.id} className="flex flex-wrap items-center gap-2">
                              <span className="text-gray-400 text-sm">{optIdx + 1}.</span>
                              <input
                                className="flex-1 min-w-[240px] border rounded px-3 py-1"
                                value={opt.label}
                                onChange={(e) =>
                                  updateOption(secIdx, qIdx, optIdx, { label: e.target.value })
                                }
                                placeholder="選項文字"
                              />
                              <label className="text-sm inline-flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={!!opt.hasFreeText}
                                  onChange={(e) =>
                                    updateOption(secIdx, qIdx, optIdx, { hasFreeText: e.target.checked })
                                  }
                                />
                                需補充文字（如「其他」選項）
                              </label>
                              <div className="ml-auto flex gap-1">
                                <button
                                  className="px-2 py-1 rounded bg-gray-200"
                                  onClick={() => moveOption(secIdx, qIdx, optIdx, -1)}
                                >
                                  ↑
                                </button>
                                <button
                                  className="px-2 py-1 rounded bg-gray-200"
                                  onClick={() => moveOption(secIdx, qIdx, optIdx, 1)}
                                >
                                  ↓
                                </button>
                                <button
                                  className="px-2 py-1 rounded bg-red-100 text-red-700"
                                  onClick={() => removeOption(secIdx, qIdx, optIdx)}
                                >
                                  刪除
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 條件顯示設定 */}
                      <div className="border-t pt-3 space-y-2">
                        <div className="text-sm text-gray-600">條件顯示（可選）</div>
                        <div className="flex flex-wrap gap-2">
                          <select
                            className="border rounded px-2 py-1"
                            value={q.visibleIf?.questionId ?? ''}
                            onChange={(e) => {
                              const v = e.target.value || undefined;
                              updateQuestion(secIdx, qIdx, {
                                visibleIf: v ? { questionId: v, equalsOptionId: '' } : undefined,
                              });
                            }}
                          >
                            <option value="">— 不設定 —</option>
                            {(survey ? survey.sections : svey.sections)
                              .flatMap((s) => s.questions)
                              .map((qq) => (
                                <option key={qq.id} value={qq.id}>
                                  {qq.id}．{qq.title.slice(0, 30)}
                                </option>
                              ))}
                          </select>

                          <select
                            className="border rounded px-2 py-1"
                            value={q.visibleIf?.equalsOptionId ?? ''}
                            onChange={(e) => {
                              const equalsOptionId = e.target.value || '';
                              updateQuestion(secIdx, qIdx, {
                                visibleIf: q.visibleIf
                                  ? { ...q.visibleIf, equalsOptionId }
                                  : undefined,
                              });
                            }}
                            disabled={!q.visibleIf?.questionId}
                          >
                            <option value="">（選擇上方題目的某個選項）</option>
                            {(() => {
                              const dep = (survey ? survey.sections : svey.sections)
                                .flatMap((s) => s.questions)
                                .find((qq) => qq.id === q.visibleIf?.questionId);
                              return (dep && dep.options ? dep.options : []).map((oo) => (
                                <option key={oo.id} value={oo.id}>
                                  {oo.label.slice(0, 30)}
                                </option>
                              ));
                            })()}
                          </select>

                          {q.visibleIf && (
                            <button
                              className="px-2 py-1 rounded bg-gray-200"
                              onClick={() => updateQuestion(secIdx, qIdx, { visibleIf: undefined })}
                            >
                              清除條件
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 題目操作按鈕們 */}
                      <div className="flex gap-2 pt-2">
                        <button
                          className="px-2 py-1 rounded bg-gray-200"
                          onClick={() => moveQuestion(secIdx, qIdx, -1)}
                        >
                          上移
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-gray-200"
                          onClick={() => moveQuestion(secIdx, qIdx, 1)}
                        >
                          下移
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-yellow-100"
                          onClick={() => duplicateQuestion(secIdx, qIdx)}
                        >
                          複製
                        </button>
                        <button
                          className="px-2 py-1 rounded bg-red-100 text-red-700"
                          onClick={() => removeQuestion(secIdx, qIdx)}
                        >
                          刪除
                        </button>
                      </div>
                    </>
                  ) : (
                    // ---------------- 下面為預覽模式下顯示問卷 ----------------
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className="font-medium">
                          {q.title} {q.required && <span className="text-red-500">*</span>}
                        </div>
                      </div>
                      {q.description && (
                        <div className="text-sm text-gray-600">{q.description}</div>
                      )}
                      {q.type === 'single' && (
                        <div className="space-y-2">
                          {(q.options ?? []).map((opt) => (
                            <label key={opt.id} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={q.id}
                                checked={answers[q.id]?.single === opt.id}
                                onChange={() => toggleSingle(q.id, opt.id)}
                              />
                              <span>{opt.label}</span>
                              {opt.hasFreeText && answers[q.id]?.single === opt.id && (
                                <input
                                  className="ml-2 border rounded px-2 py-1"
                                  placeholder="請說明"
                                  value={answers[q.id]?.freeText?.[opt.id] ?? ''}
                                  onChange={(e) => setFreeText(q.id, opt.id, e.target.value)}
                                />
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                      {q.type === 'multi' && (
                        <div className="space-y-2">
                          {(q.options ?? []).map((opt) => {
                            const picked = new Set(answers[q.id]?.multi ?? []);
                            const reached = q.maxSelect ? picked.size >= q.maxSelect : false;
                            const checked = picked.has(opt.id);
                            return (
                              <label key={opt.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleMulti(q.id, opt.id, q.maxSelect)}
                                  disabled={!checked && reached}
                                />
                                <span>{opt.label}</span>
                                {opt.hasFreeText && checked && (
                                  <input
                                    className="ml-2 border rounded px-2 py-1"
                                    placeholder="請說明"
                                    value={answers[q.id]?.freeText?.[opt.id] ?? ''}
                                    onChange={(e) => setFreeText(q.id, opt.id, e.target.value)}
                                  />
                                )}
                              </label>
                            );
                          })}
                          {q.maxSelect && (
                            <div className="text-xs text-gray-500">
                              最多可選 {q.maxSelect} 項（已選 {answers[q.id]?.multi?.length ?? 0} 項）
                            </div>
                          )}
                        </div>
                      )}
                      {q.type === 'text' && (
                        <textarea
                          className="w-full border rounded px-3 py-2"
                          rows={3}
                          value={answers[q.id]?.text ?? ''}
                          onChange={(e) => setText(q.id, e.target.value)}
                          placeholder="請輸入內容"
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!preview && (
            <div>
              <button
                className="px-3 py-2 rounded bg-green-600 text-white"
                onClick={() => addQuestion(secIdx)}
              >
                新增題目
              </button>
            </div>
          )}
        </section>
      ))}

      {/* 預覽模式下的送出按鈕與必填提示 */}
      {preview && (
        <div className="border-t pt-4">
          {missingRequired.length > 0 ? (
            <div className="text-red-600 mb-3">尚有 {missingRequired.length} 題必填未完成。</div>
          ) : (
            <div className="text-green-600 mb-3">所有必填題已完成，可送出。</div>
          )}
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white"
            onClick={() => alert('此為預覽模式，點擊送出不會真的提交')}
          >
            送出
          </button>
        </div>
      )}
    </div>
  );
}

