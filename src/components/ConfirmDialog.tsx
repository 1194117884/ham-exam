// src/components/ConfirmDialog.tsx
import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "确定",
  cancelText = "取消",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"
        onClick={onCancel}
      ></div>

      {/* iOS风格对话框 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm z-10">
        <div className="p-5 text-center">
          <h3 className="text-lg font-semibold mb-2 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>

        <div className="flex border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-bl-lg transition-colors"
          >
            {cancelText}
          </button>
          <div className="border-l border-gray-200 dark:border-gray-700"></div>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 text-red-600 dark:text-red-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-br-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;