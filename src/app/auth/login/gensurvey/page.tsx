// src/app/index/surveyset/page.tsx
//surveyset->
//->surveyedit
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function SurveyResultPage() {
  const router = useRouter();
  const [data, setData] = useState<FormDataShape | null>(null);
  const [resultText, setResultText] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleGoBack = () => router.push('/auth/login/surveyset');

    useEffect(() => {
        const raw = sessionStorage.getItem('survey:settings');
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as FormDataShape;
                if(!parsed)
                {
                    console.error('survey:settings 不是合法 JSON');
                
                }
                setData(parsed);
                setLoading(true);
                fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: parsed })
                })
                .then(async (r) => {
                if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
                return r.json();
                })
                .then(({ text }) => setResultText(text))
                .catch((e) => setErr(e.message))
                .finally(() => setLoading(false));
            } catch {
            setData(null);
            }
            
        }else{
            console.error('找不到 survey:settings');
            return;
        }
    
    }, []);
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        sessionStorage.setItem('survey:settings2', JSON.stringify(resultText));
        router.push("/auth/login/surveyedit");
    }
  return (
    <div className="p-6 space-y-4">
      <button onClick={handleGoBack} className="px-3 py-2 rounded bg-gray-200">返回</button>
      <h1 className="text-2xl font-bold">設定結果</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>

      {loading && <div>生成中…</div>}
      {err && <div className="text-red-600">發生錯誤：{err}</div>}

      {!loading && !err && (
        <div className="result whitespace-pre-wrap">
            <p>{resultText}</p>
            <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  儲存設定&生成問卷
                </button>
            </div>
        
      )}
    </div>
  );
}
