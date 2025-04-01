"use client"

import { useState } from "react"
import type { Employee, Task } from "@/lib/types"
import type { TaskManagementAlgorithm } from "@/lib/algorithms"
import {
  Edit,
  Trash2,
  Mail,
  CheckCircle,
  UserPlus,
  Check,
  X,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
} from "lucide-react"
import TaskModal from "./task-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import FollowUpModal from "./follow-up-modal"
import RemindModal from "./remind-modal"
import { PostIt } from "./ui/post-it"
import { useLanguage } from "@/contexts/language-context"

interface UrgentTasksProps {
  tasks: Task[]
  employees: Employee[]
  onCompleteTask: (taskId: string) => void
  onReassignTask: (taskId: string, newEmployeeId: string) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onAddFollowUpTask: (task: Task, previousTaskId: string) => void
  algorithm: typeof TaskManagementAlgorithm
}

export default function UrgentTasks({
  tasks,
  employees,
  onCompleteTask,
  onReassignTask,
  onUpdateTask,
  onDeleteTask,
  onAddFollowUpTask,
  algorithm,
}: UrgentTasksProps) {
  const [reassigningTaskId, setReassigningTaskId] = useState<string | null>(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false)
  const [isFollowUpTaskModalOpen, setIsFollowUpTaskModalOpen] = useState(false)
  const [followUpBaseTask, setFollowUpBaseTask] = useState<Task | null>(null)
  const [isRemindModalOpen, setIsRemindModalOpen] = useState(false)
  const [remindContent, setRemindContent] = useState("")
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  const { t } = useLanguage()

  // 긴급 업무 필터링 (기한이 3일 이하로 남았거나 지난 업무, 완료된 업무 제외)
  const urgentTasks = tasks.filter((task) => {
    if (task.status === "completed") return false

    const today = new Date()
    const deadline = new Date(task.deadline)
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    return daysLeft <= 3
  })

  // 마감일 순으로 정렬 (가까운 순)
  const sortedTasks = [...urgentTasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

  const handleReassignClick = (taskId: string) => {
    setReassigningTaskId(taskId)
    setSelectedEmployeeId("")

    // 추천 직원 가져오기
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      const recommendations = algorithm.recommendTaskAssignment(task, employees, tasks)
      if (recommendations.length > 0) {
        setSelectedEmployeeId(recommendations[0].employeeId)
      }
    }
  }

  const confirmReassign = () => {
    if (reassigningTaskId && selectedEmployeeId) {
      onReassignTask(reassigningTaskId, selectedEmployeeId)
      setReassigningTaskId(null)
    }
  }

  const handleEditClick = (task: Task) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

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

  // 업무 리마인드 버튼 클릭
  const handleRemindClick = (task: Task) => {
    const employee = employees.find((e) => e.id === task.employeeId)
    if (!employee) return

    // 마감일 포맷팅
    const deadline = new Date(task.deadline)
    const formattedDeadline = `${deadline.getFullYear()}년 ${deadline.getMonth() + 1}월 ${deadline.getDate()}일`

    // 리마인드 내용 생성
    const content = `${employee.name}님, ${task.title}건에 대해서 리마인드 메일 드립니다.
피드백은 ${formattedDeadline}까지 부탁드립니다.

감사합니다.`

    setRemindContent(content)
    setIsRemindModalOpen(true)
  }

  // 완료 버튼 클릭 시 후속 업무 확인 모달 표시
  const handleCompleteClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
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
      // 먼저 업무 완료 처리
      onCompleteTask(completingTaskId)

      // 후속 업무 모달 상태 업데이트 - 순서 중요!
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
      setIsFollowUpTaskModalOpen(false)
      setCompletingTaskId(null)
      setFollowUpBaseTask(null)
    }
  }

  // 업무 상세 정보 토글
  const toggleTaskDetails = (taskId: string) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null)
    } else {
      setExpandedTaskId(taskId)
    }
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 포스트잇 색상 결정 함수
  const getPostItColor = (task: Task) => {
    // 마감일까지 남은 일수 계산
    const today = new Date()
    const deadline = new Date(task.deadline)
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (task.status === "delayed" || daysLeft < 0) return "red"
    if (daysLeft === 0) return "orange"
    if (daysLeft === 1) return "pink"
    return "yellow"
  }

  // 포스트잇 회전 결정 함수 (약간의 랜덤성 추가)
  const getPostItRotation = (taskId: string) => {
    // taskId에서 숫자 추출하여 3으로 나눈 나머지에 따라 회전 결정
    const idNum = Number.parseInt(taskId.replace(/\D/g, "")) || 0
    const remainder = idNum % 3
    return remainder === 0 ? "left" : remainder === 1 ? "right" : "none"
  }

  if (sortedTasks.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-green-500 mr-2" />
          <h2 className="text-xl font-semibold">{t("urgentTasks")}</h2>
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-center py-4">
          <p>{t("noUrgentTasks")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
        <h2 className="text-xl font-semibold">
          {t("urgentTasks")} ({sortedTasks.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map((task) => {
          const employee = employees.find((e) => e.id === task.employeeId)
          const employeeName = employee ? employee.name : t("unassigned")
          const employeePosition = employee ? employee.position : ""

          // 마감일까지 남은 일수 계산
          const today = new Date()
          const deadline = new Date(task.deadline)
          const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          // 포스트잇 색상 및 회전 결정
          const postItColor = getPostItColor(task)
          const postItRotation = getPostItRotation(task.id)

          const isExpanded = expandedTaskId === task.id

          return (
            <PostIt key={task.id} color={postItColor} rotate={postItRotation} size="lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold text-lg font-nanum-pen-script">{task.title}</h3>
                    <button
                      onClick={() => toggleTaskDetails(task.id)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      aria-label={isExpanded ? t("collapse") : t("expand")}
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex items-center mt-1 text-sm">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>
                      {t("deadline")}: {formatDate(task.deadline)}
                    </span>
                    <span
                      className={`ml-2 ${
                        daysLeft < 0
                          ? "text-red-600 dark:text-red-400 font-bold"
                          : daysLeft === 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-yellow-600 dark:text-yellow-400"
                      }`}
                    >
                      {daysLeft < 0
                        ? `(${Math.abs(daysLeft)}${t("daysOverdue")})`
                        : daysLeft === 0
                          ? `(${t("dueToday")})`
                          : `(${daysLeft}${t("daysLeft")})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* 담당자 정보 */}
              <div className="flex items-center mb-2 text-sm bg-white/50 px-2 py-1 rounded-full inline-block">
                <User className="h-3.5 w-3.5 mr-1 text-gray-500" />
                <span className="font-medium">{employeeName}</span>
                {employeePosition && (
                  <span className="text-gray-500 dark:text-gray-400 ml-1">({employeePosition})</span>
                )}
              </div>

              {/* 업무 설명 (접었다 펼 수 있음) */}
              <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96" : "max-h-0"}`}>
                <div className="mt-3 p-3 bg-white/50 dark:bg-gray-700/50 rounded-md">
                  <h4 className="font-medium mb-2 text-sm">{t("taskDetails")}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                    {task.description || t("noDescription")}
                  </p>

                  <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50 text-xs text-gray-500 dark:text-gray-400">
                    <p>
                      {t("createdDate")}: {formatDate(task.createdDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 작업 버튼 */}
              <div className="mt-3 pt-3 border-t border-gray-300/30 flex justify-between">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                    title={t("edit")}
                  >
                    <Edit className="h-3.5 w-3.5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                    title={t("delete")}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </button>
                  {task.employeeId && (
                    <button
                      onClick={() => handleRemindClick(task)}
                      className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                      title={t("createReminderEmail")}
                    >
                      <Mail className="h-3.5 w-3.5 text-purple-600" />
                    </button>
                  )}
                </div>

                <div className="flex space-x-1">
                  <button
                    onClick={() => handleCompleteClick(task.id)}
                    className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                    title={t("complete")}
                  >
                    <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                  </button>

                  {reassigningTaskId === task.id ? (
                    <div className="flex space-x-1 bg-white/80 rounded-full p-1">
                      <select
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="text-xs border-none rounded-l-full bg-transparent focus:ring-0"
                      >
                        <option value="">{t("selectEmployee")}</option>
                        {[...employees]
                          .sort((a, b) => a.name.localeCompare(b.name, "ko"))
                          .map((emp) => (
                            <option key={emp.id} value={emp.id}>
                              {emp.name}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={confirmReassign}
                        disabled={!selectedEmployeeId}
                        className="text-xs p-1 rounded-full disabled:opacity-50"
                        title={t("confirm")}
                      >
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </button>
                      <button
                        onClick={() => setReassigningTaskId(null)}
                        className="text-xs p-1 rounded-full"
                        title={t("cancel")}
                      >
                        <X className="h-3.5 w-3.5 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleReassignClick(task.id)}
                      className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                      title={t("reassign")}
                    >
                      <UserPlus className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>
            </PostIt>
          )
        })}
      </div>

      {/* 업무 수정 모달 */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={onUpdateTask}
        task={editingTask}
        employees={employees}
        mode="edit"
        tasks={tasks}
      />

      {/* 업무 삭제 확인 모달 */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t("deleteTask")}
        message={t("deleteTaskConfirmation")}
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
        tasks={tasks}
      />

      {/* 리마인드 내용 복사 모달 */}
      <RemindModal isOpen={isRemindModalOpen} onClose={() => setIsRemindModalOpen(false)} content={remindContent} />
    </div>
  )
}

