"use client"

import { X, Check } from "lucide-react"
import { useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

interface RemindModalProps {
  isOpen: boolean
  onClose: () => void
  content: string
}

export default function RemindModal({ isOpen, onClose, content }: RemindModalProps) {
  // 모달이 열릴 때 클립보드에 내용 복사
  useEffect(() => {
    if (isOpen && content) {
      navigator.clipboard.writeText(content).catch((err) => console.error("클립보드 복사 실패:", err))
    }
  }, [isOpen, content])

  const { t } = useLanguage()

  if (!isOpen) return null

  // 모달 창 디자인 개선
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold gradient-text">{t("remind-copied")}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t("remind-copied-message")}</p>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm whitespace-pre-line border border-gray-200 dark:border-gray-600">
            {content}
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors flex items-center shadow-sm hover:shadow"
            title={t("confirm")}
          >
            <Check className="h-4 w-4 mr-1" />
            {t("confirm")}
          </button>
        </div>
      </div>
    </div>
  )
}

