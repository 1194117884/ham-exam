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

    // 对每个问题的选项进行洗牌
    const shuffledQuestions = examQuestions.map((question) => {
      // 创建 [原始索引, 选项文本] 的数组对
      const indexedOptions = question.options.map(
        (opt: string, index: number) => [index, opt],
      );

      // 使用 Fisher-Yates 洗牌算法
      for (let i = indexedOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexedOptions[i], indexedOptions[j]] = [
          indexedOptions[j],
          indexedOptions[i],
        ];
      }

      // 生成新的正确答案
      const newAnswer = [];
      // 处理原始答案：如果是字符串则将其转换为字符数组
      const originalAnswerArray =
        typeof question.answer === "string"
          ? question.answer.split("")
          : question.answer;

      const originalAnswerIndices = originalAnswerArray.map((ans: string) =>
        question.options.findIndex((opt: string) => opt.charAt(0) === ans),
      );

      for (let i = 0; i < indexedOptions.length; i++) {
        const originalIndex = indexedOptions[i][0] as number;
        if (originalAnswerIndices.includes(originalIndex)) {
          // 获取洗牌后该位置对应的新字母
          const newLetter = String.fromCharCode(65 + i); // A=65, B=66, etc.
          newAnswer.push(newLetter);
        }
      }

      // 返回包含洗牌后选项和新答案的对象
      return {
        ...question,
        shuffledOptions: indexedOptions,
        answer: newAnswer, // 使用新的答案字母
      };
    });

    setQuestions(shuffledQuestions);
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

      const correctAnswer = question.answer; // 洗牌后的答案字母

      // 检查用户答案是否与正确答案完全匹配（包括完全正确和完全错误的情况）
      // 多选题必须精确匹配所有正确选项才算正确，漏选、多选或错选都是错误
      const isFullyCorrect =
        userAnswerLetters.length === correctAnswer.length &&
        userAnswerLetters.every((ans: string) => correctAnswer.includes(ans)) &&
        correctAnswer.every((ans: string) => userAnswerLetters.includes(ans));

      // 添加判题详情
      details.push({
        questionId: question.id,
        userAnswer: userAnswerLetters,
        userAnswerTexts: userAnswerLetters.map((ans: string) => {
          // 找到字母对应的选项索引 (A=0, B=1, C=2, D=3...)
          const optIndex = ans.charCodeAt(0) - 65; // A=65, B=66, etc.
          return optIndex >= 0 && optIndex < question.shuffledOptions.length
            ? question.shuffledOptions[optIndex][1] // 取出洗牌后的选项文本
            : ans;
        }),
        correctAnswer: correctAnswer,
        correctAnswerTexts: correctAnswer.map((ans: string) => {
          // 找到字母对应的选项索引 (A=0, B=1, C=2, D=3...)
          const optIndex = ans.charCodeAt(0) - 65; // A=65, B=66, etc.
          return optIndex >= 0 && optIndex < question.shuffledOptions.length
            ? question.shuffledOptions[optIndex][1] // 取出洗牌后的选项文本
            : ans;
        }),
        isCorrect: isFullyCorrect,
        content: question.content
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
      details: details
    });
  };

  // 处理选项变更
  const handleOptionChange = (questionId: string, option: string) => {
    if (!isExamActive || examSubmitted) return;

    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    setAnswers((prev) => {
      const currentSelection = prev[questionId] || [];

      if (
        typeof question.answer === "string"
          ? question.answer.length > 1
          : question.answer.length > 1
      ) {
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
      <div className="flex flex-col items-center gap-4 mb-6">
        {isExamActive && !examSubmitted && (
          <div className="flex items-center space-x-4">
            <div
              className={`text-lg font-mono ${timeLeft < 300 ? "text-red-600" : "text-gray-700"}`}
            >
              剩余时间: {formatTime(timeLeft)}
            </div>
            <button
              onClick={submitExam}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              提交试卷
            </button>
          </div>
        )}
      </div>

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
                <h3 className="text-2xl font-bold mb-4">考试结束</h3>

                <div className="mb-6">
                  <div
                    className={`text-5xl font-bold mb-2 ${examResults.score >= getPassingScore() ? "text-green-600" : "text-red-600"}`}
                  >
                    {examResults.score}/{examResults.total}
                  </div>
                  <div className="text-gray-600">
                    得分:{" "}
                    {Math.round((examResults.score / examResults.total) * 100)}%
                  </div>
                </div>

                <div className="mb-6 p-4 rounded-lg bg-gray-50 text-left">
                  <h4 className="font-medium mb-2">考试详情：</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 考试类别：{currentClass}类</li>
                    <li>• 题目总数：{examResults.total}题</li>
                    <li>• 答对题目：{examResults.score}题</li>
                    <li>• 合格标准：{getPassingScore()}题</li>
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
                  查看详情
                </button>

                <button
                  onClick={startExam}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium mr-2"
                >
                  再考一次
                </button>
                <button
                  onClick={() => {
                    setIsExamActive(false);
                    setExamSubmitted(false);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                >
                  返回首页
                </button>
              </div>

              {/* 详细结果模态框 */}
              <Modal
                isOpen={showDetailedResults}
                onClose={() => setShowDetailedResults(false)}
                title="详细答题结果"
              >
                <div className="space-y-4">
                  {examResults.details.map((detail, index) => (
                    <div
                      key={detail.questionId}
                      className={`p-4 rounded-lg border ${detail.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className="flex items-start">
                        <div className={`mr-3 mt-1 text-lg ${detail.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {detail.isCorrect ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">
                            第 {index + 1} 题: {detail.content}
                          </h4>
                          <div className="mt-2 text-sm">
                            <div>
                              <span className="font-medium">你的答案:</span>
                              {detail.userAnswer.length > 0
                                ? detail.userAnswerTexts.map((text, idx) => (
                                    <span key={idx} className="ml-2 px-2 py-1 bg-blue-100 rounded">
                                      {detail.userAnswer[idx]}: {text.substring(3)} {/* 移除字母前缀 */}
                                    </span>
                                  ))
                                : '未作答'}
                            </div>
                            <div>
                              <span className="font-medium">正确答案:</span>
                              {detail.correctAnswerTexts.map((text, idx) => (
                                <span key={idx} className="ml-2 px-2 py-1 bg-green-100 rounded">
                                  {detail.correctAnswer[idx]}: {text.substring(3)} {/* 移除字母前缀 */}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                      <span className="text-gray-500 text-sm">
                        第 {index + 1} 题
                      </span>
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
                    {question.shuffledOptions.map(
                      ([_, option]: [number, string], optIndex: number) => {
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

              <div className="fixed bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg">
                <div className="text-sm">
                  已答: {Object.keys(answers).length} / {questions.length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Exam;
