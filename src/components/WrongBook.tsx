// src/components/WrongBook.tsx
import React, { useState } from "react";
import { useHamExam } from "../contexts/HamExamContext";

const WrongBook: React.FC = () => {
  const { getWrongQuestions, wrongAnswers, clearWrongAnswers } = useHamExam();
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  // 获取所有错题
  const wrongQuestions = getWrongQuestions();

  const handleClearWrongAnswers = () => {
    if (window.confirm("确定要清空所有错题记录吗？此操作不可恢复。")) {
      clearWrongAnswers();
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("zh-CN");
  };

  const renderQuestionDetail = (question: any) => {
    const wrongRecord = wrongAnswers[question.id];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded mr-2">
              {question.topic}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {question.id.replace("[", "").replace("]", "")}
            </span>
          </div>
          {wrongRecord && (
            <div className="text-right">
              <div className="text-sm text-red-600 dark:text-red-400">
                错误 {wrongRecord.errorCount} 次
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                最后错误于 {formatDate(wrongRecord.timestamp)}
              </div>
            </div>
          )}
        </div>

        <h3 className="text-lg font-medium mb-4 dark:text-white">{question.content}</h3>

        {/* Display attachment image if available */}
        {question.attachment && (
          <div className="mb-4 flex justify-center">
            <img
              src={question.attachment}
              alt="题目附件"
              className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
              onError={() => {
                console.warn(`Failed to load attachment: ${question.attachment}`);
              }}
            />
          </div>
        )}

        <div className="space-y-2 mb-4">
          {question.options.map((option: string, index: number) => {
            const optionLetter = option.charAt(0);
            const isCorrect = question.answer.includes(optionLetter);
            const isSelected =
              wrongRecord && wrongRecord.selectedAnswer.includes(optionLetter);

            let optionClasses = "block w-full text-left p-3 rounded-lg border ";

            if (isCorrect) {
              optionClasses += "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-500 text-green-700 dark:text-green-300";
            } else if (isSelected) {
              optionClasses += "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-500 text-red-700 dark:text-red-300";
            } else {
              optionClasses += "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600";
            }

            return (
              <div key={index} className={optionClasses}>
                <span className="font-medium">{optionLetter}.</span>{" "}
                {option.substring(3)} {/* 移除"A. "前缀 */}
                {isCorrect && (
                  <span className="ml-2 text-green-600 dark:text-green-400">(正确答案)</span>
                )}
                {isSelected && !isCorrect && (
                  <span className="ml-2 text-red-600 dark:text-red-400">(你的选择)</span>
                )}
              </div>
            );
          })}
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200">
            错误历史 ({wrongRecord?.errorHistory?.length || 0}次)
          </summary>
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded">
            <ul className="list-disc pl-5 space-y-1">
              {(wrongRecord?.errorHistory || []).map(
                (date: Date, idx: number) => (
                  <li key={idx}>{formatDate(date)}</li>
                ),
              )}
            </ul>
          </div>
        </details>

        <div className="mt-4 flex space-x-4">
          <button
            onClick={() => setSelectedQuestion(null)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white">错题: {wrongQuestions.length}道</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleClearWrongAnswers}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            清空记录
          </button>
        </div>
      </div>

      {wrongQuestions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-medium mb-2 dark:text-white">暂无错题</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            在练习或考试中答错的题目会被自动记录在这里
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            去"刷题练习"或"模拟考试"中开始答题吧！
          </p>
        </div>
      ) : selectedQuestion ? (
        // 显示具体错题详情
        renderQuestionDetail(selectedQuestion)
      ) : (
        // 显示错题列表
        <div>
          <div className="space-y-4">
            {wrongQuestions.map((question) => {
              const wrongRecord = wrongAnswers[question.id];

              return (
                <div
                  key={question.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4 hover:shadow-lg cursor-pointer border-l-4 border-red-500 dark:border-red-500"
                  onClick={() => setSelectedQuestion(question)}
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium dark:text-white">
                        {question.content.substring(0, 60)}
                        {question.content.length > 60 ? "..." : ""}
                      </h3>
                      <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="mr-3">
                          题号: {question.id.replace("[", "").replace("]", "")}
                        </span>
                        <span>知识点: {question.topic}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex justify-end mb-2">
                        {wrongRecord && (
                          <span className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded">
                            错误 {wrongRecord.errorCount} 次
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {wrongRecord ? formatDate(wrongRecord.timestamp) : ""}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WrongBook;
