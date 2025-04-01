"use client"

import { useState, type FormEvent, useEffect } from "react"
import type { Employee } from "@/lib/types"
import { X } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface EmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onAddEmployee: (employee: Employee) => void
  onUpdateEmployee?: (employee: Employee) => void
  employee?: Employee | null
  mode: "add" | "edit"
}

export default function EmployeeModal({
  isOpen: initialIsOpen,
  onClose,
  onAddEmployee,
  onUpdateEmployee,
  employee,
  mode: initialMode,
}: EmployeeModalProps) {
  const [name, setName] = useState("")
  const [position, setPosition] = useState("")
  const [skillsStr, setSkillsStr] = useState("")
  const [capacity, setCapacity] = useState(5)
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(initialIsOpen)
  const [mode, setMode] = useState<"add" | "edit">(initialMode)

  // props 변경 시 내부 상태 업데이트
  useEffect(() => {
    setIsOpen(initialIsOpen)
    setMode(initialMode)
  }, [initialIsOpen, initialMode])

  // 사이드바에서 모달을 열기 위한 이벤트 리스너 추가
  useEffect(() => {
    const handleOpenEmployeeModal = () => {
      console.log("Employee modal event received")
      setIsOpen(true)
      setMode("add")

      // 부모 컴포넌트에 모달이 열렸음을 알림
      const event = new CustomEvent("employeeModalOpened")
      window.dispatchEvent(event)
    }

    window.addEventListener("openEmployeeModal", handleOpenEmployeeModal)

    return () => {
      window.removeEventListener("openEmployeeModal", handleOpenEmployeeModal)
    }
  }, [])

  // 수정 모드일 때 기존 데이터로 폼 초기화
  useEffect(() => {
    if (mode === "edit" && employee) {
      setName(employee.name)
      setPosition(employee.position)
      setSkillsStr(employee.skills.join(", "))
      setCapacity(employee.baseCapacity)
    } else {
      // 추가 모드일 때 폼 초기화
      setName("")
      setPosition("")
      setSkillsStr("")
      setCapacity(5)
    }
  }, [employee, mode, isOpen])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!name || !position) {
      alert(t("name-position-required"))
      return
    }

    const skills = skillsStr
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s)

    if (mode === "edit" && employee && onUpdateEmployee) {
      // 기존 직원 정보 업데이트
      const updatedEmployee: Employee = {
        ...employee,
        name,
        position,
        skills,
        baseCapacity: capacity,
      }
      onUpdateEmployee(updatedEmployee)
    } else {
      // 새 직원 추가
      const employeeId = `emp-${Date.now()}`
      const newEmployee: Employee = {
        id: employeeId,
        name,
        position,
        skills,
        baseCapacity: capacity,
        assignedTasks: [],
        completedTasks: [],
        stressHistory: [],
        performanceHistory: [],
      }

      // 오늘 날짜의 데이터만 추가
      const today = new Date()

      newEmployee.stressHistory.push({
        date: new Date(today),
        value: 50,
      })

      newEmployee.performanceHistory.push({
        date: new Date(today),
        value: 50,
      })

      onAddEmployee(newEmployee)
    }

    // 폼 초기화 및 모달 닫기
    setName("")
    setPosition("")
    setSkillsStr("")
    setCapacity(5)
    handleClose()
  }

  const handleClose = () => {
    setIsOpen(false)
    onClose()
  }

  if (!isOpen) return null

  // 모달 창 디자인 개선
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-0"
      onClick={(e) => {
        // 배경 클릭 시 모달 닫기
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-xs sm:max-w-sm overflow-auto max-h-[90vh] sm:max-h-[80vh] border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-xl font-semibold gradient-text">
            {mode === "add" ? t("add-employee") : t("edit-employee")}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation() // 이벤트 버블링 방지
              handleClose() // 모달 닫기 함수 호출
            }}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="employee-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("name")}
            </label>
            <input
              type="text"
              id="employee-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-base bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="employee-position"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("position")}
            </label>
            <input
              type="text"
              id="employee-position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-base bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="employee-skills"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("skills")}
            </label>
            <input
              type="text"
              id="employee-skills"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-base bg-white dark:bg-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="employee-capacity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              {t("capacity")}
            </label>
            <input
              type="range"
              id="employee-capacity"
              min="1"
              max="10"
              value={capacity}
              onChange={(e) => setCapacity(Number.parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{t("low-capacity")}</span>
              <span>{t("high-capacity")}</span>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition duration-150 ease-in-out shadow-sm hover:shadow"
            >
              {mode === "add" ? t("add-employee") : t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

