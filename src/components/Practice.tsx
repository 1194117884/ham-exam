// src/components/Practice.tsx
import React, { useState, useEffect } from "react";
import { useHamExam } from "../contexts/HamExamContext";

const Practice: React.FC = () => {
  const {
    currentClass,
    getQuestionsByClass,
    addWrongAnswer,
    updateProgress,
    progress,
    practiceSettings,
    toggleFavorite,
    favorites,
  } = useHamExam();

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [inputQuestionNumber, setInputQuestionNumber] = useState<string>("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Initialize with all questions in sequential order
  useEffect(() => {
    const allQuestions = getQuestionsByClass(currentClass);

    setQuestions(allQuestions);

    setSelectedOptions([]);
    setShowResult(false);
    setScore(0);
    setAnsweredCount(0);

    // Load saved progress from context if rememberProgress is enabled
    if (practiceSettings.rememberProgress) {
      const progressKey = `${currentClass}_practice`;
      const savedIndex = progress[progressKey] || 0;
      setCurrentQuestionIndex(savedIndex);
      setInputQuestionNumber((savedIndex + 1).toString());
    } else {
      setCurrentQuestionIndex(0);
      setInputQuestionNumber("1");
    }
  }, [currentClass, practiceSettings.rememberProgress, progress]);

  // Sync input field with current question index
  useEffect(() => {
    if (!isInputFocused) {
      setInputQuestionNumber((currentQuestionIndex + 1).toString());
    }
  }, [currentQuestionIndex, isInputFocused]);

  const currentQuestion = questions[currentQuestionIndex];

  // Use original options without shuffling
  const originalQuestionData = {
    options:
      currentQuestion?.options?.map((opt: string, index: number) => [
        index,
        opt,
      ]) || [],
    answer: Array.isArray(currentQuestion?.answer)
      ? currentQuestion.answer
      : typeof currentQuestion?.answer === "string"
        ? currentQuestion.answer.split("")
        : [],
  };

  if (!currentQuestion || !originalQuestionData) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="text-2xl font-bold text-center mb-6 dark:text-white">
          正在准备练习题目...
        </div>
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700">
          <p className="text-gray-600 dark:text-gray-300">
            {questions.length === 0 ? "暂无符合条件的题目" : "正在加载题目..."}
          </p>
        </div>
      </div>
    );
  }

  const { options: originalOptions, answer: originalAnswer } =
    originalQuestionData;

  const handleOptionChange = (option: string) => {
    if (showResult) return;

    if (
      typeof currentQuestion.answer === "string"
        ? currentQuestion.answer.length > 1
        : currentQuestion.answer.length > 1
    ) {
      // Multiple choice
      setSelectedOptions((prev) =>
        prev.includes(option)
          ? prev.filter((opt) => opt !== option)
          : [...prev, option],
      );
    } else {
      // Single choice
      setSelectedOptions([option]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) return;

    // 使用当前状态值而不是依赖props，避免状态竞态问题
    const selectedLetters = selectedOptions
      .map((opt) => opt.charAt(0))
      .sort()
      .join("");
    const correctAnswer = [...originalAnswer].sort().join("");

    // 检查用户答案是否与正确答案完全匹配（包括完全正确和完全错误的情况）
    // 多选题必须精确匹配所有正确选项才算正确，漏选、多选或错选都是错误
    const isFullyCorrect = selectedLetters === correctAnswer;

    // 判断是否为漏选情况（至少选中了一个正确答案，但未全选中）
    const selectedLettersArray = selectedOptions.map((opt) => opt.charAt(0));
    const hasCorrectSelection = originalAnswer.some((ans: string) =>
      selectedLettersArray.includes(ans),
    ); // 至少包含一个正确选项
    const hasMissingSelection = originalAnswer.some(
      (ans: string) => !selectedLettersArray.includes(ans),
    ); // 至少缺少一个正确选项
    const isPartialCorrect = hasCorrectSelection && hasMissingSelection; // 漏选情况

    if (!isFullyCorrect) {
      addWrongAnswer({
        questionId: currentQuestion.id,
        selectedAnswer: selectedOptions.join(""),
        correctAnswer: currentQuestion.answer, // Store original answer for reference
        examClass: currentClass,
      });

      // Stay on the current question to show wrong result
      // 保持在当前题目以显示错误结果，避免状态快速改变导致界面闪烁
      setShowResult(true);
      setAnsweredCount(prevCount => prevCount + 1);

      // 如果是漏选，提示用户"漏选"
      if (isPartialCorrect) {
        // 使用立即执行而非setTimeout，避免延迟导致的问题
        alert("存在漏选，请检查您的答案！");
      }
    } else {
      // Answer is correct, go to next question automatically
      setScore(prevScore => prevScore + 1);
      setAnsweredCount(prevCount => prevCount + 1);

      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question
        const newIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(newIndex);
        // Save progress to context if rememberProgress is enabled
        if (practiceSettings.rememberProgress) {
          updateProgress(`${currentClass}_practice`, newIndex);
        }
        setSelectedOptions([]);
        setShowResult(false);
      } else {
        // If it's the last question, show completion message
        alert(`练习结束！您的得分：${score + 1}/${answeredCount + 1}`);
        setScore(0);
        setAnsweredCount(0);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      // Save progress to context if rememberProgress is enabled
      if (practiceSettings.rememberProgress) {
        updateProgress(`${currentClass}_practice`, newIndex);
      }
      setSelectedOptions([]);
      setShowResult(false);
    } else {
      // If it's the last question, show completion message
      alert(`练习结束！您的得分：${score}/${answeredCount}`);
      setScore(0);
      setAnsweredCount(0);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      // Save progress to context if rememberProgress is enabled
      if (practiceSettings.rememberProgress) {
        updateProgress(`${currentClass}_practice`, newIndex);
      }
      setSelectedOptions([]);
      setShowResult(false);
    }
  };

  // Jump to specific question
  const handleJumpToQuestion = () => {
    if (!inputQuestionNumber.trim()) {
      setInputQuestionNumber((currentQuestionIndex + 1).toString());
      return;
    }

    const num = parseInt(inputQuestionNumber);
    if (isNaN(num) || num < 1 || num > questions.length) {
      alert(`请输入有效的题号 (1-${questions.length})`);
      setInputQuestionNumber((currentQuestionIndex + 1).toString());
      return;
    }

    const newIndex = num - 1;
    setCurrentQuestionIndex(newIndex);
    // Save progress to context if rememberProgress is enabled
    if (practiceSettings.rememberProgress) {
      updateProgress(`${currentClass}_practice`, newIndex);
    }
    setSelectedOptions([]);
    setShowResult(false);
    setIsInputFocused(false);
  };

  const handleInputBlur = () => {
    handleJumpToQuestion();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleJumpToQuestion();
    }
  };

  const handleInputClick = () => {
    setIsInputFocused(true);
    setInputQuestionNumber((currentQuestionIndex + 1).toString());
  };

  const isOptionSelected = (option: string) => {
    return selectedOptions.includes(option);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Centered progress indicator */}
      <div className="flex justify-center mb-6">
        {isInputFocused ? (
          <input
            type="number"
            min="1"
            max={questions.length}
            value={inputQuestionNumber}
            onChange={(e) => setInputQuestionNumber(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700 rounded-full px-3 py-1 w-20 text-center"
          />
        ) : (
          <span
            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full cursor-pointer"
            onClick={handleInputClick}
          >
            {currentQuestionIndex + 1} / {questions.length}
          </span>
        )}
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-6 mb-6">
        {/* Question header with topic, ID, and type aligned properly */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {currentQuestion.id.replace("[", "").replace("]", "")}
            </span>
            <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded">
              {currentQuestion.topic}
            </span>
            <span
              className={`inline-block px-2 py-1 rounded text-xs ${
                typeof currentQuestion.answer === "string"
                  ? currentQuestion.answer.length > 1
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : currentQuestion.answer.length > 1
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
                    : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
              }`}
            >
              {typeof currentQuestion.answer === "string"
                ? currentQuestion.answer.length > 1
                  ? "多选"
                  : "单选"
                : currentQuestion.answer.length > 1
                  ? "多选"
                  : "单选"}
            </span>
          </div>

          <div className="flex items-center">
            <button
              onClick={() => toggleFavorite(currentQuestion.id)}
              className={`p-1 rounded transition-colors flex flex-col items-center justify-center ${
                favorites[currentQuestion.id]
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-gray-400 dark:text-gray-500 hover:text-yellow-500"
              }`}
              title={favorites[currentQuestion.id] ? "取消收藏" : "收藏题目"}
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

        <h3 className="text-lg font-medium mb-4 dark:text-white">{currentQuestion.content}</h3>

        {/* Display attachment image if available */}
        {currentQuestion.attachment && (
          <div className="mb-4 flex justify-center">
            <img
              src={currentQuestion.attachment}
              alt="题目附件"
              className="max-w-full h-auto rounded-lg border border-gray-300 dark:border-gray-600"
              onError={() => {
                console.warn(`Failed to load attachment: ${currentQuestion.attachment}`);
              }}
            />
          </div>
        )}

        <div className="space-y-2 mb-6">
          {originalOptions.map(
            ([_, option]: [number, string], index: number) => {
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

              let optionClasses =
                "block w-full text-left p-3 rounded-lg border cursor-pointer transition-colors ";

              if (showResult) {
                // Determine if this option is part of the correct answer
                const isPartOfCorrectAnswer =
                  originalAnswer.includes(optionLetter);

                if (isOptionSelected(option)) {
                  if (isPartOfCorrectAnswer) {
                    optionClasses +=
                      "bg-green-100 dark:bg-green-900 border-green-500 dark:border-green-500 text-green-700 dark:text-green-200"; // Correctly selected
                  } else {
                    optionClasses += "bg-red-100 dark:bg-red-900 border-red-500 dark:border-red-500 text-red-700 dark:text-red-200"; // Incorrectly selected
                  }
                } else if (isPartOfCorrectAnswer) {
                  optionClasses +=
                    "bg-green-50 dark:bg-green-800 border-green-300 dark:border-green-600 text-green-600 dark:text-green-300"; // Correct but not selected
                } else {
                  optionClasses += "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"; // Not selected and incorrect
                }
              } else {
                if (isOptionSelected(option)) {
                  optionClasses += "bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-500 text-blue-700 dark:text-blue-200";
                } else {
                  optionClasses +=
                    "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600";
                }
              }

              return (
                <div
                  key={index}
                  className={optionClasses}
                  onClick={() => handleOptionChange(option)}
                >
                  <span className="font-medium">{optionLetter}.</span>{" "}
                  {option.substring(3)} {/* Remove "A. " prefix */}
                  {showResult &&
                    !isOptionSelected(option) &&
                    originalAnswer.includes(optionLetter) && (
                      <span className="ml-2 text-green-600 dark:text-green-400">(漏选)</span>
                    )}
                  {showResult &&
                    isOptionSelected(option) &&
                    !originalAnswer.includes(optionLetter) && (
                      <span className="ml-2 text-red-600 dark:text-red-400">(错误选择)</span>
                    )}
                </div>
              );
            },
          )}
        </div>

        {!showResult ? (
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded disabled:opacity-50"
            >
              上一题
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              确认
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex >= questions.length - 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded disabled:opacity-50"
            >
              下一题
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded disabled:opacity-50"
              >
                上一题
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-green-600 text-white rounded"
              >
                {currentQuestionIndex < questions.length - 1
                  ? "下一题"
                  : "完成练习"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4">
        <div className="flex flex-wrap justify-between text-sm dark:text-gray-300">
          <div>
            已答题: <span className="font-medium">{answeredCount}</span>
          </div>
          <div>
            正确: <span className="font-medium text-green-600 dark:text-green-400">{score}</span>
          </div>
          <div>
            准确率:{" "}
            <span className="font-medium">
              {answeredCount > 0
                ? Math.round((score / answeredCount) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice;
