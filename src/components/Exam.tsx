// src/components/Exam.tsx
import React, { useState, useEffect } from "react";
import { useHamExam } from "../contexts/HamExamContext";
import Modal from "./Modal";

const Exam: React.FC = () => {
  const { currentClass, getQuestionsByClass, addWrongAnswer } = useHamExam();
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isExamActive, setIsExamActive] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResults, setExamResults] = useState<{
    score: number;
    total: number;
    details: {
      questionId: string;
      userAnswer: string[];
      userAnswerTexts: string[];
      correctAnswer: string[];
      correctAnswerTexts: string[];
      isCorrect: boolean;
      content: string;
    }[];
  } | null>(null);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});

  const toggleQuestionDetail = (index: number) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // 考试时长（分钟）根据类别设定
  const getExamDuration = (): number => {
    switch (currentClass) {
      case "A":
        return 40; // A类考试40分钟
      case "B":
        return 60; // B类考试60分钟
      case "C":
        return 90; // C类考试90分钟
      default:
        return 40;
    }
  };

  // 开始考试
  const startExam = () => {
    const allQuestions = getQuestionsByClass(currentClass);
    // 随机选取题目（根据考试规则）
    let examQuestions: any[];

    if (currentClass === "A") {
      // A类：32单选 + 8多选 = 40题
      const singleChoice = allQuestions
        .filter((q: any) =>
          typeof q.answer === "string"
            ? q.answer.length === 1
            : q.answer.length === 1,
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 32);
      const multiChoice = allQuestions
        .filter((q: any) =>
          typeof q.answer === "string"
            ? q.answer.length > 1
            : q.answer.length > 1,
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      examQuestions = [...singleChoice, ...multiChoice].sort(
        () => Math.random() - 0.5,
      );
    } else if (currentClass === "B") {
      // B类：45单选 + 15多选 = 60题
      const singleChoice = allQuestions
        .filter((q: any) =>
          typeof q.answer === "string"
            ? q.answer.length === 1
            : q.answer.length === 1,
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 45);
      const multiChoice = allQuestions
        .filter((q: any) =>
          typeof q.answer === "string"
            ? q.answer.length > 1
            : q.answer.length > 1,
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 15);
      examQuestions = [...singleChoice, ...multiChoice].sort(
        () => Math.random() - 0.5,
      );
    } else {
      // C类：70单选 + 20多选 = 90题
      const singleChoice = allQuestions
        .filter((q: any) =>
          typeof q.answer === "string"
            ? q.answer.length === 1
            : q.answer.length === 1,
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 70);
      const multiChoice = allQuestions
        .filter((q: any) =>
          typeof q.answer === "string"
            ? q.answer.length > 1
            : q.answer.length > 1,
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 20);
      examQuestions = [...singleChoice, ...multiChoice].sort(
        () => Math.random() - 0.5,
      );
    }

    // 不再对选项进行洗牌，直接使用原始选项
    setQuestions(examQuestions);
    setAnswers({});
    setTimeLeft(getExamDuration() * 60); // 转换为秒
    setIsExamActive(true);
    setExamSubmitted(false);
    setExamResults(null);
  };

  // 提交考试
  const submitExam = () => {
    if (!window.confirm("确定要提交试卷吗？")) return;

    setIsExamActive(false);
    setExamSubmitted(true);

    // 计算成绩
    let correctCount = 0;
    const totalQuestions = questions.length;
    const details: {
      questionId: string;
      userAnswer: string[];
      userAnswerTexts: string[];
      correctAnswer: string[];
      correctAnswerTexts: string[];
      isCorrect: boolean;
      content: string;
    }[] = [];

    questions.forEach((question) => {
      // 获取用户原始答案（包含完整选项文本）
      const rawUserAnswers = answers[question.id] || [];

      // 将完整选项文本转换为选项字母（例如 "A. 垂直天线" -> "A"）
      const userAnswerLetters = rawUserAnswers.map((rawAns: string) => {
        // 提取选项字母 (A, B, C, D ...)
        return rawAns.charAt(0);
      });

      // 直接使用原始选项和答案，无需处理洗牌逻辑
      const correctAnswer = question.answer;

      // 检查用户答案是否与正确答案完全匹配（包括完全正确和完全错误的情况）
      // 多选题必须精确匹配所有正确选项才算正确，漏选、多选或错选都是错误
      // 为了准确比较，我们先对两个数组进行排序再比较
      const sortedUserAnswers = [...userAnswerLetters].sort();
      const sortedCorrectAnswers = [...(typeof correctAnswer === 'string' ? correctAnswer.split('') : correctAnswer)].sort();
      const isFullyCorrect =
        sortedUserAnswers.length === sortedCorrectAnswers.length &&
        sortedUserAnswers.every((ans, index) => ans === sortedCorrectAnswers[index]);

      // 添加判题详情
      details.push({
        questionId: question.id,
        userAnswer: userAnswerLetters,
        userAnswerTexts: userAnswerLetters.map((ans: string) => {
          // 找到字母对应的原始选项
          const optIndex = ans.charCodeAt(0) - 65; // A=65, B=66, etc.
          return optIndex >= 0 && optIndex < (question.options?.length || 0)
            ? question.options[optIndex] // 取出原始选项文本
            : ans;
        }),
        correctAnswer: correctAnswer,
        correctAnswerTexts: (typeof correctAnswer === 'string' ? correctAnswer.split('') : correctAnswer).map((ans: string) => {
          // 找到字母对应的原始选项
          const optIndex = ans.charCodeAt(0) - 65; // A=65, B=66, etc.
          return optIndex >= 0 && optIndex < (question.options?.length || 0)
            ? question.options[optIndex] // 取出原始选项文本
            : ans;
        }),
        isCorrect: isFullyCorrect,
        content: question.content,
      });

      if (isFullyCorrect) {
        correctCount++;
      } else {
        // 添加错题记录 - 存储原始答案用于参考
        const originalQuestion = getQuestionsByClass(currentClass).find(
          (q: any) => q.id === question.id,
        );
        addWrongAnswer({
          questionId: question.id,
          selectedAnswer: userAnswerLetters.join(""),
          correctAnswer: originalQuestion
            ? typeof originalQuestion.answer === "string"
              ? originalQuestion.answer.split("")
              : originalQuestion.answer
            : question.answer,
          examClass: currentClass,
        });
      }
    });

    setExamResults({
      score: correctCount,
      total: totalQuestions,
      details: details,
    });
  };

  // 处理选项变更
  const handleOptionChange = (questionId: string, option: string) => {
    if (!isExamActive || examSubmitted) return;

    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    setAnswers((prev) => {
      const currentSelection = prev[questionId] || [];

      // 根据题目答案长度判断是否为多选题
      const isMultiChoice =
        typeof question.answer === "string"
          ? question.answer.length > 1
          : question.answer.length > 1;

      if (isMultiChoice) {
        // 多选题
        return {
          ...prev,
          [questionId]: currentSelection.includes(option)
            ? currentSelection.filter((opt: string) => opt !== option)
            : [...currentSelection, option],
        };
      } else {
        // 单选题
        return {
          ...prev,
          [questionId]: [option],
        };
      }
    });
  };

  // 检查选项是否被选中
  const isOptionSelected = (questionId: string, option: string) => {
    const currentSelection = answers[questionId] || [];
    return currentSelection.includes(option);
  };

  // 倒计时效果
  useEffect(() => {
    let timer: any = null;
    if (isExamActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isExamActive && timeLeft === 0) {
      submitExam(); // 时间到自动提交
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isExamActive, timeLeft]);

  // 将秒数转换为MM:SS格式
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 计算通过分数线
  const getPassingScore = (): number => {
    switch (currentClass) {
      case "A":
        return 30; // A类需答对30题
      case "B":
        return 45; // B类需答对45题
      case "C":
        return 70; // C类需答对70题
      default:
        return 30;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {!isExamActive && !examSubmitted ? (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-4">
              模拟{currentClass} 类考试
            </h3>

            <div className="mb-6 text-left">
              <h4 className="font-medium mb-2">考试规则：</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {currentClass === "A" && (
                  <>
                    <li>• 单选题：32题</li>
                    <li>• 多选题：8题</li>
                    <li>• 总题数：40题</li>
                  </>
                )}
                {currentClass === "B" && (
                  <>
                    <li>• 单选题：45题</li>
                    <li>• 多选题：15题</li>
                    <li>• 总题数：60题</li>
                  </>
                )}
                {currentClass === "C" && (
                  <>
                    <li>• 单选题：70题</li>
                    <li>• 多选题：20题</li>
                    <li>• 总题数：90题</li>
                  </>
                )}
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    考试时间: {getExamDuration()}分钟
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    合格标准: {getPassingScore()}题
                  </span>
                </div>
              </ul>
            </div>

            <button
              onClick={startExam}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              开始考试
            </button>
          </div>
        </div>
      ) : (
        <div>
          {examSubmitted && examResults ? (
            // 显示考试结果
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <h3 className="text-2xl font-bold mb-4">分数</h3>

                <div className="mb-6">
                  <div
                    className={`text-5xl font-bold mb-2 ${examResults.score >= getPassingScore() ? "text-green-600" : "text-red-600"}`}
                  >
                    {examResults.score}/{examResults.total}
                  </div>
                  <div className="text-gray-600">
                    准确度:{" "}
                    {Math.round((examResults.score / examResults.total) * 100)}%
                  </div>
                </div>

                <div className="mb-6 p-4 rounded-lg bg-gray-50 text-left">
                  <h4 className="font-medium mb-2">考试详情：</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 证别：{currentClass}类</li>
                    <li>• 总考题：{examResults.total}题</li>
                    <li>• 达标标准：{getPassingScore()}题</li>
                    <li>• 答对：{examResults.score}题</li>
                    <li>
                      • 考试结果：
                      <span
                        className={
                          examResults.score >= getPassingScore()
                            ? "text-green-600 font-medium"
                            : "text-red-600 font-medium"
                        }
                      >
                        {examResults.score >= getPassingScore()
                          ? "通过"
                          : "未通过"}
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowDetailedResults(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium mr-2"
                >
                  详情
                </button>

                <button
                  onClick={startExam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mr-2"
                >
                  重考
                </button>

                <button
                  onClick={() => {
                    setIsExamActive(false);
                    setExamSubmitted(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  返回
                </button>
              </div>

              {/* 详细结果模态框 */}
              <Modal
                isOpen={showDetailedResults}
                onClose={() => setShowDetailedResults(false)}
                title="详细答题结果"
              >
                <div className="space-y-4">
                  {examResults.details.map((detail, index) => {
                    const isExpanded = expandedQuestions[index] ?? false;
                    const isCorrect = detail.isCorrect;

                    return (
                      <div
                        key={detail.questionId}
                        className={`p-4 rounded-lg border ${detail.isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => isCorrect && toggleQuestionDetail(index)}
                        >
                          <div className="flex flex-col justify-center items-start">
                            <h4 className="font-medium text-start">
                              {isCorrect ? (
                                <span>
                                  {isExpanded ? '▼ ' : '► '}第 {index + 1} 题
                                </span>
                              ) : (
                                <span>第 {index + 1} 题: {detail.content}</span>
                              )}
                            </h4>

                            {/* 只有在错误或者正确题目的展开状态下才显示详细信息 */}
                            {(isCorrect && isExpanded) || !isCorrect ? (
                              <div className="mt-2 text-sm text-start">
                                {/* 当题目正确且处于展开状态时显示题目内容 */}
                                {isCorrect && isExpanded && (
                                  <div className="mb-2">
                                    {detail.content}
                                  </div>
                                )}

                                <div>
                                  <span className="font-medium">正确答案:</span>
                                  {detail.correctAnswerTexts.map((text, idx) => (
                                    <span
                                      key={idx}
                                      className="ml-2 px-2 py-1 bg-green-100 rounded"
                                    >
                                      {detail.correctAnswer[idx]}: {text.substring(3)}{" "}
                                      {/* 移除字母前缀 */}
                                    </span>
                                  ))}
                                </div>

                                <div>
                                  <span className="font-medium">你的答案:</span>
                                  {detail.userAnswer.length > 0 ? (
                                    detail.userAnswerTexts.map((text, idx) => (
                                      <span
                                        key={idx}
                                        className="ml-2 px-2 py-1 bg-blue-100 rounded"
                                      >
                                        {detail.userAnswer[idx]}: {text.substring(3)}{" "}
                                        {/* 移除字母前缀 */}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="ml-2 px-2 py-1 bg-py-100 rounded">
                                      未作答
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Modal>
            </div>
          ) : (
            // 考试进行中
            <div>
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-white rounded-lg shadow-md p-6 mb-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded mr-2">
                        {question.topic}
                      </span>
                      <span className="text-gray-500 text-sm">{index + 1}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {(
                        typeof question.answer === "string"
                          ? question.answer.length > 1
                          : question.answer.length > 1
                      )
                        ? "多选题"
                        : "单选题"}
                    </span>
                  </div>

                  <h3 className="text-lg font-medium mb-4">
                    {question.content}
                  </h3>

                  <div className="space-y-2">
                    {question.options.map(
                      (option: string, optIndex: number) => {
                        const isSelected = isOptionSelected(
                          question.id,
                          option,
                        );
                        const optionClasses = `block w-full text-left p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-100 border-blue-500 text-blue-700"
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                        }`;

                        const optionLetter = String.fromCharCode(65 + optIndex); // A, B, C, D...

                        return (
                          <div
                            key={optIndex}
                            className={optionClasses}
                            onClick={() =>
                              handleOptionChange(question.id, option)
                            }
                          >
                            <span className="font-medium">{optionLetter}.</span>{" "}
                            {option.substring(3)} {/* 移除"A. "前缀 */}
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              ))}

              {/* 固定的底部控制栏，包含答题进度和提交按钮 */}
              {isExamActive && !examSubmitted && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-3 rounded-lg shadow-lg border flex items-center gap-3 z-10 min-w-max">
                  <div className="text-xs font-mono whitespace-nowrap">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xs whitespace-nowrap">
                    {Object.keys(answers).length}/{questions.length}
                  </div>
                  <button
                    onClick={submitExam}
                    className="px-3 py-1.5 bg-red-600 text-white rounded text-xs whitespace-nowrap"
                  >
                    交卷
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Exam;
