// import { NextRequest, NextResponse } from "next/server";
// import {getJson} from "serpapi";
// //const { getJson } = require("serpapi");

// const cheerio = require("cheerio");

// main();

// async function main() {
//   const url =
//     "https://www.fire.taichung.gov.tw/caselist/index.asp?Parser=99,8,226";
//     const cheerio = require("cheerio");
//     //body就是拿到的那陀html文字
//   //const response = await fetchUrl(url, handleTaichungFireCrawler);
//   const response = await fetch(url, {
//       method: "GET",  // GET 請求
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     // 檢查 HTTP 狀態碼
//     if (!response.ok) {
//       throw new Error(`HTTP 錯誤！狀態碼：${response.status}`);
//     }

//     // 讀取回傳資料（通常是 JSON）
//     const data = await response.json();
//     console.log("✅ API 回傳資料:", data);
//     handleTaichungFireCrawler(data);
//   if (!response.ok) {
//     console.error("❌ API Error:", response.status, await response.text());
//     return;
//   }
//   console.log(response);
// }

// function handleTaichungFireCrawler(req:NextRequest) {
//   const $ = cheerio.load(req.body);
//   // 解析火灾案件列表
//     $.html();
//   //   const fireCases = [];
// //   $(".case-item").each((index, element) => {
// //     const title = $(element).find(".case-title").text();
// //     const date = $(element).find(".case-date").text();
// //     fireCases.push({ title, date });
// //   });
// //   return fireCases;
// }

// export async function searchWeb(req: NextRequest) {
//     const apiKey = process.env.SERP_API_KEY;
//     // Implement search functionality using the SERP API key
//     if (!apiKey) {
//       throw new Error("SERP_API_KEY is not defined in the environment variables.");
//     }
//       const { query } = await req.json();
//       const response = await fetch(`https://serpapi.com/search?api_key=${apiKey}&engine=google&q=${query}`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch search results");
//       }
//       const data = await response.json();

//     //   fetch('/api/generate', {
//     //                 method: 'Get',
//     //                 headers: { 'Content-Type': 'application/json' },
//     //                 body: JSON.stringify({ data: parsed })
//     //             })
//       return NextResponse.json(data);
// }