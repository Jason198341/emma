"use client"

import { useState } from "react"
import type { Employee, Task } from "@/lib/types"
import type { TaskManagementAlgorithm } from "@/lib/algorithms"
import { Edit, Trash2, Mail, CheckCircle, UserPlus, Check, X, Clock, AlertTriangle, CheckCheck } from "lucide-react"
import TaskModal from "./task-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import FollowUpModal from "./follow-up-modal"
import RemindModal from "./remind-modal"
import { PostIt } from "./ui/post-it"
import { useLanguage } from "@/contexts/language-context"

interface TaskListProps {
  tasks: Task[]
  employees: Employee[]
  filter: string
  onCompleteTask: (taskId: string) => void
  onReassignTask: (taskId: string, newEmployeeId: string) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onAddFollowUpTask: (task: Task, previousTaskId: string) => void
  algorithm: typeof TaskManagementAlgorithm
}

export default function TaskList({
  tasks,
  employees,
  filter,
  onCompleteTask,
  onReassignTask,
  onUpdateTask,
  onDeleteTask,
  onAddFollowUpTask,
  algorithm,
}: TaskListProps) {
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

  const { t } = useLanguage()

  // 필터에 따라 업무 필터링
  let filteredTasks = tasks
  if (filter !== "all") {
    filteredTasks = tasks.filter((task) => task.status === filter)
  }

  // 마감일 순으로 정렬 (가까운 순)
  filteredTasks = [...filteredTasks].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())

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

  // 포스트잇 색상 결정 함수
  const getPostItColor = (task: Task) => {
    if (task.status === "completed") return "green"
    if (task.status === "delayed") return "red"

    // 중요도에 따른 색상
    switch (task.importance) {
      case 4:
        return "orange" // 긴급
      case 3:
        return "pink" // 높음
      case 2:
        return "yellow" // 보통
      case 1:
        return "blue" // 낮음
      default:
        return "yellow"
    }
  }

  // 포스트잇 회전 결정 함수 (약간의 랜덤성 추가)
  const getPostItRotation = (taskId: string) => {
    // taskId에서 숫자 추출하여 3으로 나눈 나머지에 따라 회전 결정
    const idNum = Number.parseInt(taskId.replace(/\D/g, "")) || 0
    const remainder = idNum % 3
    return remainder === 0 ? "left" : remainder === 1 ? "right" : "none"
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center py-8">
        {tasks.length === 0 ? (
          <div>
            <p className="mb-2">{t("등록된 업무가 없습니다.")}</p>
            <p className="text-sm">{t("위의 '새 업무 추가' 버튼을 클릭하여 업무를 추가해 보세요.")}</p>
          </div>
        ) : (
          <p>{t("선택한 필터에 해당하는 업무가 없습니다.")}</p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTasks.map((task) => {
          const employee = employees.find((e) => e.id === task.employeeId)
          const employeeName = employee ? employee.name : t("미할당")

          // 마감일까지 남은 일수 계산
          const today = new Date()
          const deadline = new Date(task.deadline)
          const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          // 상태 아이콘 결정
          let StatusIcon = Clock
          if (task.status === "completed") {
            StatusIcon = CheckCheck
          } else if (task.status === "delayed") {
            StatusIcon = AlertTriangle
          }

          // 포스트잇 색상 및 회전 결정
          const postItColor = getPostItColor(task)
          const postItRotation = getPostItRotation(task.id)

          return (
            <PostIt
              key={task.id}
              color={postItColor}
              rotate={postItRotation}
              className={task.status === "completed" ? "opacity-70" : ""}
            >
              <div className="flex justify-between items-start mb-2">
                <h3
                  className={`font-semibold text-lg font-nanum-pen-script ${task.status === "completed" ? "line-through" : ""}`}
                >
                  {task.title}
                </h3>
                <StatusIcon
                  className={`h-5 w-5 ${task.status === "delayed" ? "text-red-600" : task.status === "completed" ? "text-green-600" : "text-gray-600"}`}
                />
              </div>

              <div className={`mb-3 text-sm ${task.status === "completed" ? "line-through opacity-70" : ""}`}>
                {task.description.length > 80 ? task.description.substring(0, 80) + "..." : task.description}
              </div>

              <div className="flex justify-between items-center text-xs mb-3">
                <span className="font-medium bg-white/50 px-2 py-1 rounded-full">{employeeName}</span>
                <span
                  className={`px-2 py-1 rounded-full bg-white/50 ${
                    daysLeft < 0
                      ? "text-red-600 font-bold"
                      : daysLeft === 0
                        ? "text-red-600"
                        : daysLeft <= 2
                          ? "text-orange-600"
                          : ""
                  }`}
                >
                  {daysLeft < 0
                    ? `${Math.abs(daysLeft)}일 초과`
                    : daysLeft === 0
                      ? t("오늘 마감")
                      : `${daysLeft}일 남음`}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-300/30">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditClick(task)}
                    className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                    title={t("수정")}
                  >
                    <Edit className="h-3.5 w-3.5 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(task.id)}
                    className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                    title={t("삭제")}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </button>
                  {task.status !== "completed" && task.employeeId && (
                    <button
                      onClick={() => handleRemindClick(task)}
                      className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                      title={t("리마인드 메일 내용 생성")}
                    >
                      <Mail className="h-3.5 w-3.5 text-purple-600" />
                    </button>
                  )}
                </div>

                {task.status !== "completed" && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleCompleteClick(task.id)}
                      className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                      title={t("완료")}
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
                          <option value="">{t("직원 선택")}</option>
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
                          title={t("확인")}
                        >
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        </button>
                        <button
                          onClick={() => setReassigningTaskId(null)}
                          className="text-xs p-1 rounded-full"
                          title={t("취소")}
                        >
                          <X className="h-3.5 w-3.5 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReassignClick(task.id)}
                        className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                        title={t("재배정")}
                      >
                        <UserPlus className="h-3.5 w-3.5 text-gray-600" />
                      </button>
                    )}
                  </div>
                )}
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
        title={t("업무 삭제")}
        message={t("이 업무를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")}
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
    </>
  )
}

