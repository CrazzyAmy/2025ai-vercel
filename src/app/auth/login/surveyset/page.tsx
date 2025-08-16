'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { redirect } from "next/navigation"
export default function ProductSurveyPage() {
  //const router = useRouter(); // 初始化 router
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
    router.push('/dashboard');
  };
  // 產品敘述相關狀態
  //單選
  const [productDescription, setProductDescription] = useState<'self' | 'document'>('self');
  //複選
  const [productDescriptions, setProductDescriptions] = useState({
    self: false,
    document: false,
    website: false
  });
  const handleDescriptionChange = (type: 'self' | 'document' | 'website') => {
    setProductDescriptions(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };// src/app/page.tsx
  const [selfDescription, setSelfDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [referenceUrl, setReferenceUrl] = useState('');
  // 題數狀態
  const [questionCount, setQuestionCount] = useState(10);

  // 問卷類別狀態
  const [surveyCategory, setSurveyCategory] = useState('使用');
  const [otherCategory, setOtherCategory] = useState('');
  // 處理檔案上傳
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // 提交表單
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = {
      productDescriptions: {
        self: productDescriptions.self ? selfDescription : null,
        document: productDescriptions.document ? uploadedFile?.name : null,
        website: productDescriptions.website ? referenceUrl : null
      },
      questionCount,
      surveyCategory,
      otherCategory: surveyCategory === '其他' ? otherCategory : null
      // productDescription: {
      //   type: productDescription,
      //   content: productDescription === 'self' ? selfDescription : uploadedFile?.name
      // },
      // questionCount,
      // surveyCategory
    };
    
    console.log('表單資料:', formData);
    alert('設定已儲存！');
    sessionStorage.setItem('survey:settings', JSON.stringify(formData));
    router.push("/auth/login/gensurvey");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 頁面標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            產品問卷設定
          </h1>
          <p className="text-gray-600">
            設定您的產品問卷參數和內容
          </p>
        </div>

        {/* 主要表單 */}
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="space-y-8">
            
            {/* 產品敘述區塊 */}
            <div>
              <label className="text-lg font-semibold text-gray-900 mb-4 block">
                產品敘述:
              </label>
              
              <div className="space-y-4">
                {/* 自述選項 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="productDescriptions"
                      value="self"
                      checked={productDescriptions.self}
                      onChange={(e) => handleDescriptionChange('self')}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">自述</span>
                      {productDescriptions.self && (
                        <div className="mt-3">
                          <textarea
                            value={selfDescription}
                            onChange={(e) => setSelfDescription(e.target.value)}
                            placeholder="請描述您的產品..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* 上傳文件選項 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="productDescriptions"
                      value="document"
                      checked={productDescriptions.document}
                      onChange={(e) => handleDescriptionChange('document')}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">附上產品文件</span>
                      {productDescriptions.document && (
                        <div className="mt-3">
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                </svg>
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">點擊上傳</span> 或拖拽檔案到此處
                                </p>
                                <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 10MB)</p>
                              </div>
                              <input 
                                type="file" 
                                accept=".pdf,.doc,.docx"
                                onChange={handleFileUpload}
                                className="hidden" 
                              />
                            </label>
                          </div>
                          {uploadedFile && (
                            <div className="mt-2 text-sm text-green-600">
                              已選擇檔案: {uploadedFile.name}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                {/* 參考網址選項 */}
                <div className="border rounded-lg p-4 hover:bg-gray-50">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productDescriptions.website}
                      onChange={() => handleDescriptionChange('website')}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">輸入參考網址</span>
                      {productDescriptions.website && (
                        <div className="mt-3">
                          <input
                            type="url"
                            value={referenceUrl}
                            onChange={(e) => setReferenceUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 題數區塊 */}
            <div>
              <label className="text-lg font-semibold text-gray-900 mb-4 block">
                題數: <span className="text-blue-600">{questionCount}</span>
              </label>
              
              <div className="px-3">
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>10</span>
                  <span>20</span>
                </div>
              </div>
            </div>

            {/* 問卷類別區塊 */}
            <div>
              <label className="text-lg font-semibold text-gray-900 mb-4 block">
                問卷類別:
              </label>
              
              <div className="grid grid-cols-1 gap-3">
                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="surveyCategory"
                    value="使用者回饋"
                    checked={surveyCategory === '使用者回饋'}
                    onChange={(e) => setSurveyCategory(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-900">使用者回饋</span>
                </label>

                <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="surveyCategory"
                    value="新品市調"
                    checked={surveyCategory === '新品市調'}
                    onChange={(e) => setSurveyCategory(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-900">新品市調</span>
                </label>

                <div className="border rounded-lg p-3 hover:bg-gray-50">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="surveyCategory"
                      value="其他"
                      checked={surveyCategory === '其他'}
                      onChange={(e) => setSurveyCategory(e.target.value)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-900">其他</span>
                      {surveyCategory === '其他' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={otherCategory}
                            onChange={(e) => setOtherCategory(e.target.value)}
                            placeholder="請輸入問卷類別..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* 提交按鈕 */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  取消
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  儲存設定&生成問卷
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* 設定預覽 */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">設定預覽</h3>
          <div className="text-sm text-gray-600 space-y-2">
            <div>
              <span className="font-medium">產品敘述方式:</span> {productDescription === 'self' ? '自述' : '文件上傳'}
            </div>
            {productDescription === 'self' && selfDescription && (
              <div>
                <span className="font-medium">內容:</span> {selfDescription.substring(0, 100)}{selfDescription.length > 100 ? '...' : ''}
              </div>
            )}
            {productDescription === 'document' && uploadedFile && (
              <div>
                <span className="font-medium">上傳檔案:</span> {uploadedFile.name}
              </div>
            )}
            <div>
              <span className="font-medium">題數:</span> {questionCount} 題
            </div>
            <div>
              <span className="font-medium">問卷類別:</span> {surveyCategory}
            </div>
          </div>
        </div>
      </div>

      {/* 自訂樣式 */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}