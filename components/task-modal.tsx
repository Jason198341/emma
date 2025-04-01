"use client"

import { useState, type FormEvent, useEffect, useRef } from "react"
import type { Task } from "@/lib/types"
import { X, Calendar, ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  task?: Task | null
  baseTask?: Task | null // 후속 업무 추가 시 참조할 기존 업무
  employees: Array<{ id: string; name: string }>
  mode: "add" | "edit"
  tasks?: Task[] // 기존 업무 목록 추가
}

export default function TaskModal({
  isOpen: initialIsOpen,
  onClose,
  onSave,
  task,
  baseTask,
  employees,
  mode: initialMode,
  tasks = [],
}: TaskModalProps) {
  const [title, setTitle] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState("")
  const [deadline, setDeadline] = useState("")
  const [description, setDescription] = useState("")
  const [importance, setImportance] = useState(2)
  const [status, setStatus] = useState<"active" | "delayed" | "completed">("active")
  const [isOpen, setIsOpen] = useState(initialIsOpen)
  const [mode, setMode] = useState<"add" | "edit">(initialMode)

  // 자동완성 관련 상태
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false)
  const [showTitleDropdown, setShowTitleDropdown] = useState(false)
  const [filteredEmployees, setFilteredEmployees] = useState<Array<{ id: string; name: string }>>([])
  const [filteredTitles, setFilteredTitles] = useState<string[]>([])
  const [showDateOptions, setShowDateOptions] = useState(false)

  // 드롭다운 외부 클릭 감지를 위한 ref
  const employeeDropdownRef = useRef<HTMLDivElement>(null)
  const titleDropdownRef = useRef<HTMLDivElement>(null)
  const dateOptionsRef = useRef<HTMLDivElement>(null)

  const { t } = useLanguage()

  // props 변경 시 내부 상태 업데이트
  useEffect(() => {
    setIsOpen(initialIsOpen)
    setMode(initialMode)
  }, [initialIsOpen, initialMode])

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (mode === "edit" && task) {
      setTitle(task.title)
      setEmployeeId(task.employeeId || "")
      const employee = employees.find((e) => e.id === task.employeeId)
      setEmployeeSearchTerm(employee?.name || "")
      setDeadline(task.deadline)
      setDescription(task.description)
      setImportance(task.importance)
      setStatus(task.status)
    } else if (mode === "add" && baseTask) {
      // 후속 업무 추가 시 기존 업무 정보 참조
      setTitle(`${baseTask.title} (후속)`)
      setEmployeeId(baseTask.employeeId || "")
      const employee = employees.find((e) => e.id === baseTask.employeeId)
      setEmployeeSearchTerm(employee?.name || "")

      // 마감일은 오늘로부터 7일 후로 설정
      const newDeadline = new Date()
      newDeadline.setDate(newDeadline.getDate() + 7)
      setDeadline(newDeadline.toISOString().split("T")[0])

      setDescription(`${baseTask.title}에 대한 후속 업무:\n\n${baseTask.description}`)
      setImportance(baseTask.importance)
      setStatus("active")
    } else {
      // 일반 추가 모드일 때 폼 초기화
      setTitle("")
      setEmployeeId("")
      setEmployeeSearchTerm("")
      setDeadline("")
      setDescription("")
      setImportance(2)
      setStatus("active")
    }
  }, [task, baseTask, mode, isOpen, employees])

  // 담당자 검색어 변경 시 필터링
  useEffect(() => {
    if (employeeSearchTerm.trim() === "") {
      setFilteredEmployees([])
      return
    }

    const filtered = employees.filter((employee) =>
      employee.name.toLowerCase().includes(employeeSearchTerm.toLowerCase()),
    )
    setFilteredEmployees(filtered)
    setShowEmployeeDropdown(true)
  }, [employeeSearchTerm, employees])

  // 업무 제목 검색어 변경 시 필터링
  useEffect(() => {
    if (title.trim() === "" || mode === "edit") {
      setFilteredTitles([])
      return
    }

    // 중복 제거된 업무 제목 목록 생성
    const uniqueTitles = Array.from(new Set(tasks.map((t) => t.title)))

    const filtered = uniqueTitles
      .filter((t) => t.toLowerCase().includes(title.toLowerCase()) && t !== title)
      .slice(0, 5) // 최대 5개까지만 표시

    setFilteredTitles(filtered)
    setShowTitleDropdown(filtered.length > 0)
  }, [title, tasks, mode])

  // 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target as Node)) {
        setShowEmployeeDropdown(false)
      }
      if (titleDropdownRef.current && !titleDropdownRef.current.contains(event.target as Node)) {
        setShowTitleDropdown(false)
      }
      if (dateOptionsRef.current && !dateOptionsRef.current.contains(event.target as Node)) {
        setShowDateOptions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // 사이드바에서 모달을 열기 위한 이벤트 리스너 추가
  useEffect(() => {
    const handleOpenTaskModal = () => {
      console.log("Task modal event received")
      setIsOpen(true)
      setMode("add")

      // 부모 컴포넌트에 모달이 열렸음을 알림
      const event = new CustomEvent("taskModalOpened")
      window.dispatchEvent(event)
    }

    window.addEventListener("openTaskModal", handleOpenTaskModal)

    return () => {
      window.removeEventListener("openTaskModal", handleOpenTaskModal)
    }
  }, [])

  const handleEmployeeSelect = (id: string, name: string) => {
    setEmployeeId(id)
    setEmployeeSearchTerm(name)
    setShowEmployeeDropdown(false)
  }

  const handleTitleSelect = (selectedTitle: string) => {
    setTitle(selectedTitle)
    setShowTitleDropdown(false)
  }

  const handleDateOptionSelect = (days: number) => {
    const newDeadline = new Date()
    newDeadline.setDate(newDeadline.getDate() + days)
    setDeadline(newDeadline.toISOString().split("T")[0])
    setShowDateOptions(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!title || !deadline) {
      alert(t("title-deadline-required"))
      return
    }

    const updatedTask: Task = {
      id: task ? task.id : `task-${Date.now()}`,
      title,
      employeeId,
      description,
      deadline,
      importance,
      status,
      createdDate: task ? task.createdDate : new Date(),
      completedDate: task?.completedDate || null,
    }

    onSave(updatedTask)
    onClose()
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-0">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm overflow-auto max-h-[90vh] sm:max-h-[80vh] border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold gradient-text">
            {mode === "add" ? (baseTask ? t("add-follow-up-task") : t("add-task")) : t("edit-task")}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("task-title")}
            </label>
            <div className="relative" ref={titleDropdownRef}>
              <input
                type="text"
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-base bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                autoComplete="off"
              />
              {showTitleDropdown && filteredTitles.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredTitles.map((title, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                      onClick={() => handleTitleSelect(title)}
                    >
                      {title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-employee"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("assignee")}
              </label>
              <div className="relative" ref={employeeDropdownRef}>
                <input
                  type="text"
                  id="task-employee"
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  placeholder={t("search-employee")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-base bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  autoComplete="off"
                />
                {showEmployeeDropdown && filteredEmployees.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                        onClick={() => handleEmployeeSelect(employee.id, employee.name)}
                      >
                        {employee.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="task-deadline"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {t("deadline")}
              </label>
              <div className="relative" ref={dateOptionsRef}>
                <div className="flex">
                  <input
                    type="date"
                    id="task-deadline"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-l-lg text-base bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    className="px-3 py-2 bg-indigo-100 dark:bg-indigo-800 border border-gray-300 dark:border-gray-700 rounded-r-lg flex items-center transition-colors hover:bg-indigo-200 dark:hover:bg-indigo-700"
                    onClick={() => setShowDateOptions(!showDateOptions)}
                  >
                    <Calendar className="h-4 w-4 mr-1 text-indigo-600 dark:text-indigo-400" />
                    <ChevronDown className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </button>
                </div>
                {showDateOptions && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg">
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                      onClick={() => handleDateOptionSelect(3)}
                    >
                      {t("date-option-3-days")}
                    </div>
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                      onClick={() => handleDateOptionSelect(7)}
                    >
                      {t("date-option-7-days")}
                    </div>
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                      onClick={() => handleDateOptionSelect(15)}
                    >
                      {t("date-option-15-days")}
                    </div>
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                      onClick={() => handleDateOptionSelect(30)}
                    >
                      {t("date-option-30-days")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("task-description")}
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-base bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("importance")}</label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="importance"
                  value="1"
                  checked={importance === 1}
                  onChange={() => setImportance(1)}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="ml-2 text-sm">{t("low")}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="importance"
                  value="2"
                  checked={importance === 2}
                  onChange={() => setImportance(2)}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="ml-2 text-sm">{t("medium")}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="importance"
                  value="3"
                  checked={importance === 3}
                  onChange={() => setImportance(3)}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="ml-2 text-sm">{t("high")}</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="importance"
                  value="4"
                  checked={importance === 4}
                  onChange={() => setImportance(4)}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="ml-2 text-sm">{t("urgent")}</span>
              </label>
            </div>
          </div>
          {mode === "edit" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t("status")}</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="active"
                    checked={status === "active"}
                    onChange={() => setStatus("active")}
                    className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm">{t("in-progress")}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="delayed"
                    checked={status === "delayed"}
                    onChange={() => setStatus("delayed")}
                    className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm">{t("delayed")}</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="status"
                    value="completed"
                    checked={status === "completed"}
                    onChange={() => setStatus("completed")}
                    className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm">{t("completed")}</span>
                </label>
              </div>
            </div>
          )}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-150 ease-in-out shadow-sm hover:shadow"
            >
              {mode === "add" ? (baseTask ? t("add-follow-up-task") : t("add")) : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

