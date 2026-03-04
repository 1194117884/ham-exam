// src/types/index.ts

export interface Question {
  id: string;        // 内部编号:多选组编号（LX:MC2=0103）
  topic: string;     // 知识点
  content: string;   // 题干
  options: string[]; // 选项
  answer: string;    // 正确答案（多选）
  explanation?: string; // 答案解析
}

export type ExamClass = 'A' | 'B' | 'C';

export interface ExamResult {
  examId: string;
  class: ExamClass;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  date: Date;
}

export interface WrongAnswerRecord {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  examClass: ExamClass;
  timestamp: Date;
  errorCount: number;           // 错误次数
  errorHistory: Date[];         // 错误时间历史
}

export interface HamExamState {
  currentClass: ExamClass;
  wrongAnswers: Record<string, WrongAnswerRecord>; // questionId -> record
  focusMode: boolean; // 专注模式，只做错题
  practiceSettings: {
    shuffleQuestions: boolean;    // 是否随机题目顺序
    shuffleOptions: boolean;      // 是否随机选项顺序
    rememberProgress: boolean;    // 是否记住进度
  };
  progress: {
    [key: string]: number;       // 记录每个知识点刷题进度 { class_topic: questionIndex }
  };
}