"use client"

import { useState, type FormEvent } from "react"
import type { Employee, Task } from "@/lib/types"

interface TaskFormProps {
  employees: Employee[]
  onAddTask: (task: Task) => void
}

export default function TaskForm({ employees, onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState("")
  const [employeeId, setEmployeeId] = useState("")
  const [deadline, setDeadline] = useState("")
  const [description, setDescription] = useState("")
  const [importance, setImportance] = useState(2)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!title || !employeeId || !deadline) {
      alert("제목, 담당자, 마감일은 필수 입력 항목입니다.")
      return
    }

    const taskId = `task-${Date.now()}`
    const newTask: Task = {
      id: taskId,
      title,
      employeeId,
      description,
      deadline,
      importance,
      status: "active",
      createdDate: new Date(),
      completedDate: null,
    }

    onAddTask(newTask)

    // Reset form
    setTitle("")
    setEmployeeId("")
    setDeadline("")
    setDescription("")
    setImportance(2)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">새 업무 추가</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            업무 제목
          </label>
          <input
            type="text"
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-base bg-white dark:bg-gray-700 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-employee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              담당자
            </label>
            <select
              id="task-employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-base bg-white dark:bg-gray-700 focus:ring-primary focus:border-primary"
            >
              <option value="">선택하세요</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="task-deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              마감일
            </label>
            <input
              type="date"
              id="task-deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-base bg-white dark:bg-gray-700 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            업무 설명
          </label>
          <textarea
            id="task-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-base bg-white dark:bg-gray-700 focus:ring-primary focus:border-primary"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">중요도</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="importance"
                value="1"
                checked={importance === 1}
                onChange={() => setImportance(1)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="ml-2">낮음</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="importance"
                value="2"
                checked={importance === 2}
                onChange={() => setImportance(2)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="ml-2">보통</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="importance"
                value="3"
                checked={importance === 3}
                onChange={() => setImportance(3)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="ml-2">높음</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="importance"
                value="4"
                checked={importance === 4}
                onChange={() => setImportance(4)}
                className="text-primary focus:ring-primary h-4 w-4"
              />
              <span className="ml-2">긴급</span>
            </label>
          </div>
        </div>
        <div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out"
          >
            업무 추가
          </button>
        </div>
      </form>
    </div>
  )
}

