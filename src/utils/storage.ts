// src/utils/storage.ts
const HAM_EXAM_STATE_KEY = 'ham_exam_state';

// Functions expected by HamExamContext
export const loadFromStorage = () => {
  try {
    const data = localStorage.getItem(HAM_EXAM_STATE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return {};
  }
};

export const saveToStorage = (state: any) => {
  try {
    localStorage.setItem(HAM_EXAM_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save to storage:', error);
  }
};