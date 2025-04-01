"use client"

import { useState } from "react"
import { X, Edit, Trash2, CheckCircle, UserPlus, Check } from "lucide-react"
import type { Task, Employee } from "@/lib/types"
import TaskModal from "./task-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import FollowUpModal from "./follow-up-modal"
import type { TaskManagementAlgorithm } from "@/lib/algorithms"
import { useLanguage } from "@/contexts/language-context"

interface EmployeeTasksModalProps {
  isOpen: boolean
  onClose: () => void
  employeeName: string
  employeeId: string
  tasks: Task[]
  allTasks: Task[]
  employees: Employee[]
  onCompleteTask: (taskId: string) => void
  onReassignTask: (taskId: string, newEmployeeId: string) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onAddFollowUpTask: (task: Task, previousTaskId: string) => void
  algorithm: typeof TaskManagementAlgorithm
}

export default function EmployeeTasksModal({
  isOpen,
  onClose,
  employeeName,
  employeeId,
  tasks,
  allTasks,
  employees,
  onCompleteTask,
  onReassignTask,
  onUpdateTask,
  onDeleteTask,
  onAddFollowUpTask,
  algorithm,
}: EmployeeTasksModalProps) {
  // 상태 관리
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [isFollowUpTaskModalOpen, setIsFollowUpTaskModalOpen] = useState(false)
  const [followUpBaseTask, setFollowUpBaseTask] = useState<Task | null>(null)
  const [showReassignDropdown, setShowReassignDropdown] = useState<string | null>(null)

  const { t } = useLanguage()

  if (!isOpen) return null

  // 마감일 기준으로 정렬 (가까운 순)
  const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  // 업무 편집
  const handleEditClick = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  // 업무 삭제
  const handleDeleteClick = (taskId: string) => {
    setDeletingTaskId(taskId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (deletingTaskId) {
      onDeleteTask(deletingTaskId)
      setDeletingTaskId(null)
    }
  }

  // 업무 완료
  const handleCompleteClick = (taskId: string) => {
    const task = allTasks.find((t) => t.id === taskId)
    if (task) {
      setCompletingTaskId(taskId)
      setFollowUpBaseTask(task)
      setIsFollowUpModalOpen(true)
    }
  }

  // 후속 업무 없음 - 바로 완료 처리
  const handleNoFollowUp = () => {
    if (completingTaskId) {
      onCompleteTask(completingTaskId)
      setCompletingTaskId(null)
      setFollowUpBaseTask(null)
      setIsFollowUpModalOpen(false)
    }
  }

  // 후속 업무 있음 - 완료 처리 후 업무 추가 모달 표시
  const handleHasFollowUp = () => {
    if (completingTaskId) {
      onCompleteTask(completingTaskId)
      setIsFollowUpModalOpen(false)

      // 약간의 지연 후 후속 업무 모달 표시 (UI 업데이트 충돌 방지)
      setTimeout(() => {
        setIsFollowUpTaskModalOpen(true)
      }, 100)
    }
  }

  // 후속 업무 추가
  const handleAddFollowUpTask = (newTask: Task) => {
    if (completingTaskId && followUpBaseTask) {
      onAddFollowUpTask(newTask, completingTaskId)
      setCompletingTaskId(null)
      setFollowUpBaseTask(null)
      setIsFollowUpTaskModalOpen(false)
    }
  }

  // 담당자 재배정
  const handleReassignClick = (taskId: string) => {
    setShowReassignDropdown(taskId)
    setSelectedEmployeeId("")

    // 추천 직원 가져오기
    const task = allTasks.find((t) => t.id === taskId)
    if (task) {
      const recommendations = algorithm.recommendTaskAssignment(task, employees, allTasks)
      if (recommendations.length > 0) {
        setSelectedEmployeeId(recommendations[0].employeeId)
      }
    }
  }

  const confirmReassign = (taskId: string) => {
    if (selectedEmployeeId) {
      onReassignTask(taskId, selectedEmployeeId)
      setShowReassignDropdown(null)
    }
  }

  // 모달 창 디자인 개선
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold gradient-text">
            {employeeName}
            {t("employee-tasks")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {sortedTasks.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">{t("no_tasks_in_progress")}</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {sortedTasks.map((task) => {
              // 마감일까지 남은 일수 계산
              const today = new Date()
              const deadline = new Date(task.deadline)
              const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

              // 상태에 따른 스타일 설정
              let statusClass = ""
              let statusText = ""

              if (task.status === "delayed") {
                statusClass = "text-red-600 dark:text-red-400 font-medium"
                statusText = t("delayed")
              } else {
                if (daysLeft <= 2) {
                  statusClass = "text-yellow-600 dark:text-yellow-400 font-medium"
                  statusText = t("deadline_approaching")
                } else {
                  statusClass = "text-blue-600 dark:text-blue-400 font-medium"
                  statusText = t("in_progress")
                }
              }

              // 중요도에 따른 표시
              let importanceText = ""
              let importanceClass = ""

              switch (task.importance) {
                case 1:
                  importanceText = t("low")
                  importanceClass = "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  break
                case 2:
                  importanceText = t("medium")
                  importanceClass = "bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300"
                  break
                case 3:
                  importanceText = t("high")
                  importanceClass = "bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-300"
                  break
                case 4:
                  importanceText = t("urgent")
                  importanceClass = "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300"
                  break
              }

              return (
                <div
                  key={task.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg glass-effect card-hover"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${importanceClass}`}>{importanceText}</span>
                  </div>

                  {task.description && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {task.description.length > 100 ? task.description.substring(0, 100) + "..." : task.description}
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm mb-3">
                    <div className={statusClass}>{statusText}</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {t("deadline")}: {new Date(task.deadline).toLocaleDateString("ko-KR")}
                      <span className="ml-2">
                        {daysLeft < 0
                          ? `(${Math.abs(daysLeft)}${t("days_overdue")})`
                          : daysLeft === 0
                            ? `(${t("due_today")})`
                            : `(${daysLeft}${t("days_remaining")})`}
                      </span>
                    </div>
                  </div>

                  {/* 작업 버튼 */}
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white p-1.5 rounded transition duration-150 ease-in-out"
                        title={t("edit")}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task.id)}
                        className="text-xs bg-red-500 hover:bg-red-600 text-white p-1.5 rounded transition duration-150 ease-in-out"
                        title={t("delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCompleteClick(task.id)}
                        className="text-xs bg-green-500 hover:bg-green-600 text-white p-1.5 rounded transition duration-150 ease-in-out"
                        title={t("complete")}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                      </button>

                      {showReassignDropdown === task.id ? (
                        <div className="flex space-x-2">
                          <select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            className="text-xs border border-gray-300 dark:border-gray-600 rounded"
                          >
                            <option value="">{t("select_employee")}</option>
                            {[...employees]
                              .sort((a, b) => a.name.localeCompare(b.name, "ko"))
                              .map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.name}
                                </option>
                              ))}
                          </select>
                          <button
                            onClick={() => confirmReassign(task.id)}
                            disabled={!selectedEmployeeId}
                            className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white p-1.5 rounded transition duration-150 ease-in-out disabled:opacity-50"
                            title={t("confirm")}
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setShowReassignDropdown(null)}
                            className="text-xs bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded transition duration-150 ease-in-out"
                            title={t("cancel")}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleReassignClick(task.id)}
                          className="text-xs bg-gray-500 hover:bg-gray-600 text-white p-1.5 rounded transition duration-150 ease-in-out"
                          title={t("reassign")}
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors shadow-sm hover:shadow"
          >
            {t("close")}
          </button>
        </div>
      </div>

      {/* 업무 수정 모달 */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={(updatedTask) => {
          onUpdateTask(updatedTask)
          setIsTaskModalOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
        employees={employees}
        mode="edit"
        tasks={allTasks}
      />

      {/* 업무 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t("delete_task")}
        message={t("delete_task_confirmation")}
      />

      {/* 후속 업무 확인 모달 */}
      <FollowUpModal
        isOpen={isFollowUpModalOpen}
        onClose={() => setIsFollowUpModalOpen(false)}
        onConfirm={handleHasFollowUp}
        onDeny={handleNoFollowUp}
        taskTitle={followUpBaseTask?.title || ""}
      />

      {/* 후속 업무 추가 모달 */}
      <TaskModal
        isOpen={isFollowUpTaskModalOpen}
        onClose={() => {
          setIsFollowUpTaskModalOpen(false)
          setFollowUpBaseTask(null)
          setCompletingTaskId(null)
        }}
        onSave={handleAddFollowUpTask}
        employees={employees}
        mode="add"
        baseTask={followUpBaseTask}
        tasks={allTasks}
      />
    </div>
  )
}

