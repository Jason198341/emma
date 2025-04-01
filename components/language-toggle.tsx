"use client"

import { useLanguage } from "@/contexts/language-context"
import { Globe } from "lucide-react"

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div className="flex items-center">
      <div className="relative inline-block">
        <button
          className="flex items-center space-x-1 bg-white dark:bg-gray-700 px-3 py-1.5 rounded-md shadow-sm text-sm"
          onClick={() => setLanguage(language === "ko" ? "en" : "ko")}
        >
          <Globe className="h-4 w-4 mr-1" />
          <span>{language === "ko" ? "한국어" : "English"}</span>
        </button>
      </div>
    </div>
  )
}

