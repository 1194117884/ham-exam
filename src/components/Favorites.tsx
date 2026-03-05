// src/components/Favorites.tsx
import React, { useState } from "react";
import { useHamExam } from "../contexts/HamExamContext";

const Favorites: React.FC = () => {
  const {
    currentClass,
    getFavoriteQuestions,
    toggleFavorite,
    getQuestionsByClass,
  } = useHamExam();

  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string[]>
  >({});
  const [showResult, setShowResult] = useState<Record<string, boolean>>({});

  const favoriteQuestions = getFavoriteQuestions();
  const allQuestions = getQuestionsByClass(currentClass);

  const handleOptionChange = (questionId: string, option: string) => {
    if (showResult[questionId]) return;

    const question = allQuestions.find((q: any) => q.id === questionId);
    if (!question) return;

    const isMultipleChoice = Array.isArray(question.answer)
      ? question.answer.length > 1
      : typeof question.answer === "string" && question.answer.length > 1;

    setSelectedOptions((prev) => {
      const currentOptions = prev[questionId] || [];
      if (isMultipleChoice) {
        return {
          ...prev,
          [questionId]: currentOptions.includes(option)
            ? currentOptions.filter((opt) => opt !== option)
            : [...currentOptions, option],
        };
      } else {
        return {
          ...prev,
          [questionId]: [option],
        };
      }
    });
  };

  const handleSubmit = (questionId: string) => {
    const question = allQuestions.find((q: any) => q.id === questionId);
    if (!question) return;

    const selected = selectedOptions[questionId] || [];
    if (selected.length === 0) return;

    setShowResult((prev) => ({
      ...prev,
      [questionId]: true,
    }));
  };

  const handleRemoveFavorite = (questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(questionId);
  };

  if (favoriteQuestions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-2xl font-bold text-center mb-6 dark:text-white">我的收藏</div>
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700">
          <p className="text-gray-600 dark:text-gray-300">暂无收藏题目</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            在练习页面点击题目右上角的 ⭐ 收藏题目
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-2xl font-bold text-center mb-6 dark:text-white">
        我的收藏 ({favoriteQuestions.length})
      </div>

      <div className="space-y-4">
        {favoriteQuestions.map((question: any, index: number) => {
          const questionShowResult = showResult[question.id] || false;
          const questionSelectedOptions = selectedOptions[question.id] || [];

          const originalAnswer = Array.isArray(question.answer)
            ? question.answer
            : typeof question.answer === "string"
              ? question.answer.split("")
              : [];

          return (
            <div
              key={question.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6"
            >
              {/* Question header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {question.id.replace("[", "").replace("]", "")}
                  </span>
                  <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded">
                    {question.topic}
                  </span>
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      Array.isArray(question.answer)
                        ? question.answer.length > 1
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                          : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : typeof question.answer === "string" &&
                            question.answer.length > 1
                          ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                          : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    }`}
                  >
                    {Array.isArray(question.answer)
                      ? question.answer.length > 1
                        ? "多选"
                        : "单选"
                      : typeof question.answer === "string" &&
                          question.answer.length > 1
                        ? "多选"
                        : "单选"}
                  </span>
                </div>

                <div className="flex items-center">
                  <button
                    onClick={(e) => handleRemoveFavorite(question.id, e)}
                    className="p-1 text-yellow-500 hover:text-yellow-600 transition-colors flex flex-col items-center justify-start"
                    title="取消收藏"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Question number */}
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                第 {index + 1} 题 / 共 {favoriteQuestions.length} 题
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
                {question.options.map((opt: string, optIndex: number) => {
                  const optionLetter = String.fromCharCode(65 + optIndex);
                  const fullOption = `${optionLetter}. ${opt.substring(3)}`;

                  let optionClasses =
                    "block w-full text-left p-3 rounded-lg border cursor-pointer transition-colors ";

                  if (questionShowResult) {
                    const isPartOfCorrectAnswer =
                      originalAnswer.includes(optionLetter);

                    if (questionSelectedOptions.includes(fullOption)) {
                      if (isPartOfCorrectAnswer) {
                        optionClasses +=
                          "bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-500 text-green-700 dark:text-green-200";
                      } else {
                        optionClasses +=
                          "bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-500 text-red-700 dark:text-red-200";
                      }
                    } else if (isPartOfCorrectAnswer) {
                      optionClasses +=
                        "bg-green-50 dark:bg-green-800 border-green-300 dark:border-green-600 text-green-600 dark:text-green-300";
                    } else {
                      optionClasses +=
                        "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300";
                    }
                  } else {
                    if (questionSelectedOptions.includes(fullOption)) {
                      optionClasses +=
                        "bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-200";
                    } else {
                      optionClasses +=
                        "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600";
                    }
                  }

                  return (
                    <div
                      key={optIndex}
                      className={optionClasses}
                      onClick={() =>
                        handleOptionChange(question.id, fullOption)
                      }
                    >
                      <span className="font-medium">{optionLetter}.</span>{" "}
                      {opt.substring(3)}
                    </div>
                  );
                })}
              </div>

              {!questionShowResult ? (
                <button
                  onClick={() => handleSubmit(question.id)}
                  disabled={questionSelectedOptions.length === 0}
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  提交答案
                </button>
              ) : (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-800 dark:text-green-300 font-medium">
                    正确答案：{originalAnswer.join("")}
                  </p>
                  {question.explanation && (
                    <p className="text-green-700 dark:text-green-400 text-sm mt-2">
                      {question.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Favorites;
