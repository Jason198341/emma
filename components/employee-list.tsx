"use client"

import { useState } from "react"
import type { Employee, Task } from "@/lib/types"
import { calculateWorkload, calculateStressIndex, calculatePerformance } from "@/lib/employee-metrics"
import { Edit, Trash2, Mail, Briefcase } from "lucide-react"
import EmployeeModal from "./employee-modal"
import DeleteConfirmationModal from "./delete-confirmation-modal"
import RemindModal from "./remind-modal"
import EmployeeTasksModal from "./employee-tasks-modal"
import { TaskManagementAlgorithm } from "@/lib/algorithms"
import { PostIt } from "./ui/post-it"
import { useLanguage } from "@/contexts/language-context"

interface EmployeeListProps {
  employees: Employee[]
  tasks: Task[]
  onUpdateEmployee: (employee: Employee) => void
  onDeleteEmployee: (employeeId: string) => void
  onCompleteTask: (taskId: string) => void
  onReassignTask: (taskId: string, newEmployeeId: string) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onAddFollowUpTask: (task: Task, previousTaskId: string) => void
}

export default function EmployeeList({
  employees,
  tasks,
  onUpdateEmployee,
  onDeleteEmployee,
  onCompleteTask,
  onReassignTask,
  onUpdateTask,
  onDeleteTask,
  onAddFollowUpTask,
}: EmployeeListProps) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isRemindModalOpen, setIsRemindModalOpen] = useState(false)
  const [remindContent, setRemindContent] = useState("")
  const [isTasksModalOpen, setIsTasksModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const { t } = useLanguage()

  const handleEditClick = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsEmployeeModalOpen(true)
  }

  const handleDeleteClick = (employeeId: string) => {
    // 해당 직원에게 할당된 업무가 있는지 확인
    const hasActiveTasks = tasks.some((task) => task.employeeId === employeeId && task.status !== "completed")

    if (hasActiveTasks) {
      alert(t("employeeList.deleteEmployeeAlert"))
      return
    }

    setDeletingEmployeeId(employeeId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (deletingEmployeeId) {
      onDeleteEmployee(deletingEmployeeId)
      setDeletingEmployeeId(null)
    }
  }

  // 직원 리마인드 버튼 클릭
  const handleRemindClick = (employee: Employee) => {
    // 직원의 활성 업무 가져오기
    const activeTasks = tasks.filter((task) => task.employeeId === employee.id && task.status !== "completed")

    if (activeTasks.length === 0) {
      alert(t("employeeList.noActiveTasksAlert"))
      return
    }

    // 리마인드 내용 생성
    let content = `${employee.name} ${t("employeeList.remindMessage.greeting")}\n`

    // 각 업무의 마감일 정보 추가
    activeTasks.forEach((task) => {
      const deadline = new Date(task.deadline)
      const formattedDeadline = `${deadline.getFullYear()}년 ${deadline.getMonth() + 1}월 ${deadline.getDate()}일`
      content += `${task.title}: ${formattedDeadline}\n`
    })

    content += `\n${t("employeeList.remindMessage.reminder")}\n\n${t("employeeList.remindMessage.thanks")}`

    setRemindContent(content)
    setIsRemindModalOpen(true)
  }

  // 업무 목록 모달 표시
  const handleTasksClick = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsTasksModalOpen(true)
  }

  // 포스트잇 색상 결정 함수
  const getPostItColor = (employee: Employee) => {
    const stressIndex = calculateStressIndex(employee, tasks)

    if (stressIndex >= 70) return "red"
    if (stressIndex >= 40) return "yellow"
    return "green"
  }

  // 포스트잇 회전 결정 함수 (약간의 랜덤성 추가)
  const getPostItRotation = (employeeId: string) => {
    // employeeId에서 숫자 추출하여 3으로 나눈 나머지에 따라 회전 결정
    const idNum = Number.parseInt(employeeId.replace(/\D/g, "")) || 0
    const remainder = idNum % 3
    return remainder === 0 ? "left" : remainder === 1 ? "right" : "none"
  }

  if (employees.length === 0) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-center py-8">
        <p className="mb-2">{t("employeeList.noEmployees")}</p>
        <p className="text-sm">{t("employeeList.addEmployeePrompt")}</p>
      </div>
    )
  }

  // 직원 목록을 이름 기준으로 정렬 (가나다순)
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name, "ko"))

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedEmployees.map((employee) => {
          // 지표 계산
          const currentWorkload = calculateWorkload(employee, tasks)
          const stressIndex = calculateStressIndex(employee, tasks)
          const performance = calculatePerformance(employee, tasks)

          // 진행 중인 업무 수 계산
          const activeTasks = employee.assignedTasks.filter((taskId) => {
            const task = tasks.find((t) => t.id === taskId)
            return task && task.status !== "completed"
          })

          // 포스트잇 색상 및 회전 결정
          const postItColor = getPostItColor(employee)
          const postItRotation = getPostItRotation(employee.id)

          return (
            <PostIt key={employee.id} color={postItColor} rotate={postItRotation} className="employee-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg font-nanum-pen-script">{employee.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{employee.position}</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => handleTasksClick(employee)}
                    className="text-xs px-2 py-1 rounded-full bg-white/70 hover:bg-white text-blue-800 transition-colors cursor-pointer flex items-center"
                  >
                    <Briefcase className="h-3 w-3 mr-1" />
                    {activeTasks.length} {t("employeeList.tasks")}
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>{t("employeeList.workload")}</span>
                    <span>{Math.round(currentWorkload)}%</span>
                  </div>
                  <div className="w-full bg-white/50 dark:bg-gray-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        currentWorkload >= 80 ? "bg-red-500" : currentWorkload >= 60 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${currentWorkload}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>{t("employeeList.stressIndex")}</span>
                    <span>{Math.round(stressIndex)}</span>
                  </div>
                  <div className="w-full bg-white/50 dark:bg-gray-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stressIndex >= 70 ? "bg-red-500" : stressIndex >= 40 ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{ width: `${stressIndex}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span>{t("employeeList.performance")}</span>
                    <span>{Math.round(performance)}</span>
                  </div>
                  <div className="w-full bg-white/50 dark:bg-gray-700/50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        performance >= 80 ? "bg-green-500" : performance >= 50 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                      style={{ width: `${performance}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {employee.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-full bg-white/70 text-gray-800 dark:text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-gray-300/30 flex justify-end space-x-1">
                <button
                  onClick={() => handleEditClick(employee)}
                  className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                  title={t("employeeList.edit")}
                >
                  <Edit className="h-3.5 w-3.5 text-blue-600" />
                </button>
                <button
                  onClick={() => handleDeleteClick(employee.id)}
                  className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                  title={t("employeeList.delete")}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                </button>
                {activeTasks.length > 0 && (
                  <button
                    onClick={() => handleRemindClick(employee)}
                    className="text-xs bg-white/70 hover:bg-white p-1.5 rounded-full transition-colors"
                    title={t("employeeList.remind")}
                  >
                    <Mail className="h-3.5 w-3.5 text-purple-600" />
                  </button>
                )}
              </div>
            </PostIt>
          )
        })}
      </div>

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onAddEmployee={() => {}}
        onUpdateEmployee={onUpdateEmployee}
        employee={editingEmployee}
        mode="edit"
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title={t("employeeList.deleteEmployee")}
        message={t("employeeList.deleteConfirmation")}
      />

      {/* 리마인드 내용 복사 모달 */}
      <RemindModal isOpen={isRemindModalOpen} onClose={() => setIsRemindModalOpen(false)} content={remindContent} />

      {/* 직원 업무 목록 모달 */}
      {selectedEmployee && (
        <EmployeeTasksModal
          isOpen={isTasksModalOpen}
          onClose={() => setIsTasksModalOpen(false)}
          employeeName={selectedEmployee.name}
          employeeId={selectedEmployee.id}
          tasks={tasks.filter((task) => task.employeeId === selectedEmployee.id && task.status !== "completed")}
          allTasks={tasks}
          employees={employees}
          onCompleteTask={onCompleteTask}
          onReassignTask={onReassignTask}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          onAddFollowUpTask={onAddFollowUpTask}
          algorithm={TaskManagementAlgorithm}
        />
      )}
    </>
  )
}

