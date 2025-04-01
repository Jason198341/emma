"use client"

import { ClipboardList, CheckCircle, AlertTriangle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface DashboardStatsProps {
  activeTasks: number
  delayedTasks: number
  teamEfficiency: number
  unassignedTasks?: number
  employees?: Array<{
    id: string
    name: string
    assignedTasks: string[]
  }>
  tasks?: Array<{
    id: string
    status: string
    employeeId: string
  }>
}

export default function DashboardStats({
  activeTasks,
  delayedTasks,
  teamEfficiency,
  unassignedTasks = 0,
  employees = [],
  tasks = [],
}: DashboardStatsProps) {
  const { t } = useLanguage()

  // Calculate active and delayed tasks per employee
  const employeeTaskCounts = employees
    .map((employee) => {
      const activeCount = tasks.filter((task) => task.employeeId === employee.id && task.status === "active").length

      const delayedCount = tasks.filter((task) => task.employeeId === employee.id && task.status === "delayed").length

      return {
        name: employee.name,
        activeCount,
        delayedCount,
      }
    })
    .filter((emp) => emp.activeCount > 0 || emp.delayedCount > 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="rounded-lg bg-blue-50 dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <ClipboardList className="h-5 w-5 mr-2 text-primary" />
          {t("active-tasks")}
        </h2>
        <div className="text-3xl font-bold mt-3 text-primary">{activeTasks}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-2">{t("current-tasks")}</div>

        {employeeTaskCounts.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium mb-1">{t("tasks-by-employee")}</p>
            <ul className="text-xs space-y-1">
              {employeeTaskCounts
                .filter((emp) => emp.activeCount > 0)
                .sort((a, b) => b.activeCount - a.activeCount)
                .map((emp, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{emp.name}</span>
                    <span className="font-medium">{emp.activeCount}</span>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-blue-50 dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
          {t("delayed-tasks")}
        </h2>
        <div className="text-3xl font-bold mt-3 text-red-600 dark:text-red-500">{delayedTasks}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-2">{t("overdue-tasks")}</div>

        {employeeTaskCounts.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-medium mb-1">{t("delayed-tasks-by-employee")}</p>
            <ul className="text-xs space-y-1">
              {employeeTaskCounts
                .filter((emp) => emp.delayedCount > 0)
                .sort((a, b) => b.delayedCount - a.delayedCount)
                .map((emp, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{emp.name}</span>
                    <span className="font-medium text-red-600 dark:text-red-500">{emp.delayedCount}</span>
                  </li>
                ))}
              {employeeTaskCounts.filter((emp) => emp.delayedCount > 0).length === 0 && (
                <li className="text-gray-500">{t("no-delayed-tasks")}</li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-purple-50 dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-purple-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
          </svg>
          {t("potential-tasks")}
        </h2>
        <div className="text-3xl font-bold mt-3 text-purple-600">{unassignedTasks}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-2">{t("unassigned-tasks")}</div>

        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs mb-1">{unassignedTasks > 0 ? t("assign-tasks-prompt") : t("all-tasks-assigned")}</p>
        </div>
      </div>

      <div className="rounded-lg bg-green-50 dark:bg-gray-800 p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-success" />
          {t("team-efficiency")}
        </h2>
        <div className="text-3xl font-bold mt-3 text-success">{Math.round(teamEfficiency)}%</div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t("performance-efficiency")}</div>
      </div>
    </div>
  )
}

