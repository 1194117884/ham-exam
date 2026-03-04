// src/contexts/HamExamContext.tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { HamExamState, ExamClass, WrongAnswerRecord } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

// 动态导入题库数据
import { questionsData_A } from '../data/questions_A';
import { questionsData_B } from '../data/questions_B';
import { questionsData_C } from '../data/questions_C';

const questionsA = questionsData_A;
const questionsB = questionsData_B;
const questionsC = questionsData_C;

interface HamExamContextType extends HamExamState {
  setCurrentClass: (examClass: ExamClass) => void;
  addWrongAnswer: (record: Omit<WrongAnswerRecord, 'timestamp' | 'errorCount' | 'errorHistory'>) => void;
  clearWrongAnswers: () => void;
  setFocusMode: (focus: boolean) => void;
  setPracticeSetting: (setting: keyof HamExamState['practiceSettings'], value: any) => void;
  updateProgress: (progressKey: string, questionIndex: number) => void;
  getQuestionsByClass: (examClass: ExamClass) => any[];
  getQuestionsByTopic: (examClass: ExamClass, topic: string) => any[];
  getWrongQuestions: () => any[];
}

const initialState: HamExamState = {
  currentClass: 'A',
  wrongAnswers: {},
  focusMode: false,
  practiceSettings: {
    shuffleQuestions: true,    // 默认随机题目顺序
    shuffleOptions: true,      // 默认随机选项顺序
    rememberProgress: true     // 默认记住进度
  },
  progress: {},
  ...loadFromStorage()
};

type Action =
  | { type: 'SET_CURRENT_CLASS'; payload: ExamClass }
  | { type: 'ADD_WRONG_ANSWER'; payload: WrongAnswerRecord }
  | { type: 'CLEAR_WRONG_ANSWERS' }
  | { type: 'SET_FOCUS_MODE'; payload: boolean }
  | { type: 'UPDATE_PRACTICE_SETTING'; payload: { setting: keyof HamExamState['practiceSettings']; value: any } }
  | { type: 'UPDATE_PROGRESS'; payload: { key: string; questionIndex: number } };

const hamExamReducer = (state: HamExamState, action: Action): HamExamState => {
  switch (action.type) {
    case 'SET_CURRENT_CLASS':
      return { ...state, currentClass: action.payload };
    case 'ADD_WRONG_ANSWER':
      return {
        ...state,
        wrongAnswers: {
          ...state.wrongAnswers,
          [action.payload.questionId]: action.payload
        }
      };
    case 'CLEAR_WRONG_ANSWERS':
      return { ...state, wrongAnswers: {} };
    case 'SET_FOCUS_MODE':
      return { ...state, focusMode: action.payload };
    case 'UPDATE_PRACTICE_SETTING':
      return {
        ...state,
        practiceSettings: {
          ...state.practiceSettings,
          [action.payload.setting]: action.payload.value
        }
      };
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.payload.key]: action.payload.questionIndex
        }
      };
    default:
      return state;
  }
};

const HamExamContext = createContext<HamExamContextType | undefined>(undefined);

export const HamExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(hamExamReducer, initialState);

  // 保存状态到本地存储
  React.useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const setCurrentClass = (examClass: ExamClass) => {
    dispatch({ type: 'SET_CURRENT_CLASS', payload: examClass });
  };

  const addWrongAnswer = (record: Omit<WrongAnswerRecord, 'timestamp' | 'errorCount' | 'errorHistory'>) => {
    const existingRecord = state.wrongAnswers[record.questionId];
    let newErrorCount = 1;
    let newErrorHistory = [new Date()];

    if (existingRecord) {
      newErrorCount = existingRecord.errorCount + 1;
      newErrorHistory = [...existingRecord.errorHistory, new Date()];
    }

    dispatch({
      type: 'ADD_WRONG_ANSWER',
      payload: {
        ...record,
        timestamp: new Date(),
        errorCount: newErrorCount,
        errorHistory: newErrorHistory
      }
    });
  };

  const clearWrongAnswers = () => {
    dispatch({ type: 'CLEAR_WRONG_ANSWERS' });
  };

  const setFocusMode = (focus: boolean) => {
    dispatch({ type: 'SET_FOCUS_MODE', payload: focus });
  };

  const setPracticeSetting = (setting: keyof HamExamState['practiceSettings'], value: any) => {
    dispatch({
      type: 'UPDATE_PRACTICE_SETTING',
      payload: { setting, value }
    });
  };

  const updateProgress = (progressKey: string, questionIndex: number) => {
    dispatch({
      type: 'UPDATE_PROGRESS',
      payload: { key: progressKey, questionIndex }
    });
  };

  const getQuestionsByClass = (examClass: ExamClass) => {
    switch (examClass) {
      case 'A':
        return questionsA;
      case 'B':
        return questionsB;
      case 'C':
        return questionsC;
      default:
        return questionsA;
    }
  };

  const getQuestionsByTopic = (examClass: ExamClass, topic: string) => {
    const questions = getQuestionsByClass(examClass);
    return questions.filter((q: any) => q.topic.toLowerCase().includes(topic.toLowerCase()));
  };

  const getWrongQuestions = () => {
    const currentQuestions = getQuestionsByClass(state.currentClass);
    return currentQuestions.filter((q: any) => state.wrongAnswers[q.id]);
  };

  const value: HamExamContextType = {
    ...state,
    setCurrentClass,
    addWrongAnswer,
    clearWrongAnswers,
    setFocusMode,
    setPracticeSetting,
    updateProgress,
    getQuestionsByClass,
    getQuestionsByTopic,
    getWrongQuestions
  };

  return (
    <HamExamContext.Provider value={value}>
      {children}
    </HamExamContext.Provider>
  );
};

export const useHamExam = () => {
  const context = useContext(HamExamContext);
  if (!context) {
    throw new Error('useHamExam must be used within a HamExamProvider');
  }
  return context;
};