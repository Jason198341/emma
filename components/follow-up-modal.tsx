"use client"

import { X, Check, XCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface FollowUpModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onDeny: () => void
  taskTitle: string
}

export default function FollowUpModal({ isOpen, onClose, onConfirm, onDeny, taskTitle }: FollowUpModalProps) {
  const { t } = useLanguage()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold gradient-text">{t("follow-up-task")}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <span className="font-semibold">{taskTitle}</span> {t("follow-up-task-confirm").split(".")[0]}.
          </p>
          <p className="text-gray-700 dark:text-gray-300">{t("follow-up-task-confirm").split(".")[1]}?</p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onDeny}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center"
            title={t("no")}
          >
            <XCircle className="h-4 w-4 mr-1" />
            {t("no")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors flex items-center shadow-sm hover:shadow"
            title={t("yes")}
          >
            <Check className="h-4 w-4 mr-1" />
            {t("yes")}
          </button>
        </div>
      </div>
    </div>
  )
}

