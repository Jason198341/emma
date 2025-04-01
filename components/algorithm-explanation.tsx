"use client"

import { useLanguage } from "@/contexts/language-context"

export default function AlgorithmExplanation() {
  const { t } = useLanguage()

  return (
    <div className="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">{t("algorithmExplanation.title")}</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">{t("algorithmExplanation.intro")}</p>

      <div className="space-y-6">
        {/* 스트레스 지수 설명 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h3 className="text-xl font-semibold mb-3 text-primary">{t("algorithmExplanation.stressIndex.title")}</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">{t("algorithmExplanation.stressIndex.description")}</p>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t("algorithmExplanation.stressIndex.elementsTitle")}</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-400">
              <li>
                <span className="font-medium">{t("algorithmExplanation.stressIndex.workload")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.stressIndex.deadlinePressure")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.stressIndex.complexity")}</span>
              </li>
            </ul>
            <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
              <p className="text-sm font-mono">{t("algorithmExplanation.stressIndex.formula")}</p>
            </div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">{t("algorithmExplanation.stressIndex.levels")}</p>
          </div>
        </div>

        {/* 업무 수행 능력 설명 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h3 className="text-xl font-semibold mb-3 text-primary">{t("algorithmExplanation.performance.title")}</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">{t("algorithmExplanation.performance.description")}</p>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t("algorithmExplanation.performance.elementsTitle")}</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-400">
              <li>
                <span className="font-medium">{t("algorithmExplanation.performance.deadlineCompliance")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.performance.workload")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.performance.importanceWeight")}</span>
              </li>
            </ul>
            <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
              <p className="text-sm font-mono">{t("algorithmExplanation.performance.formula")}</p>
            </div>
            <p className="mt-3 text-gray-600 dark:text-gray-400">{t("algorithmExplanation.performance.levels")}</p>
          </div>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-medium">{t("algorithmExplanation.performance.noteTitle")}</span>
              {t("algorithmExplanation.performance.note")}
            </p>
          </div>
        </div>

        {/* 업무 배분 추천 알고리즘 설명 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h3 className="text-xl font-semibold mb-3 text-primary">{t("algorithmExplanation.taskAllocation.title")}</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            {t("algorithmExplanation.taskAllocation.description")}
          </p>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t("algorithmExplanation.taskAllocation.elementsTitle")}</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-400">
              <li>
                <span className="font-medium">{t("algorithmExplanation.taskAllocation.predictedPerformance")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.taskAllocation.workloadCapacity")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.taskAllocation.stressCapacity")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.taskAllocation.basicCompetency")}</span>
              </li>
            </ul>
            <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
              <p className="text-sm font-mono">{t("algorithmExplanation.taskAllocation.formula")}</p>
              <p className="text-sm font-mono mt-2">{t("algorithmExplanation.taskAllocation.importanceWeightNote")}</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <span className="font-medium">{t("algorithmExplanation.taskAllocation.fairnessTitle")}</span>
              {t("algorithmExplanation.taskAllocation.fairness")}
            </p>
          </div>
        </div>

        {/* 팀 효율성 설명 */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h3 className="text-xl font-semibold mb-3 text-primary">{t("algorithmExplanation.teamEfficiency.title")}</h3>
          <p className="mb-3 text-gray-700 dark:text-gray-300">
            {t("algorithmExplanation.teamEfficiency.description")}
          </p>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t("algorithmExplanation.teamEfficiency.elementsTitle")}</h4>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-400">
              <li>
                <span className="font-medium">{t("algorithmExplanation.teamEfficiency.averagePerformance")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.teamEfficiency.deadlineCompliance")}</span>
              </li>
              <li>
                <span className="font-medium">{t("algorithmExplanation.teamEfficiency.teamStressManagement")}</span>
              </li>
            </ul>
            <div className="mt-3 bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
              <p className="text-sm font-mono">{t("algorithmExplanation.teamEfficiency.formula")}</p>
            </div>
          </div>
          <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              <span className="font-medium">{t("algorithmExplanation.teamEfficiency.meaningTitle")}</span>
              {t("algorithmExplanation.teamEfficiency.meaning")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

