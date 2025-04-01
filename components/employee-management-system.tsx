"use client"

import { useEffect, useState } from "react"
import type { Employee, Task } from "@/lib/types"
import { generateSampleData } from "@/lib/sample-data"
import { TaskManagementAlgorithm } from "@/lib/algorithms"
import { loadEmployeesFromLocalStorage, loadTasksFromLocalStorage, saveAllData } from "@/lib/storage-utils"
import { updateAllTasksStatus, isTaskDelayed } from "@/lib/task-utils"
import DashboardStats from "./dashboard-stats"
import TaskList from "./task-list"
import EmployeeList from "./employee-list"
import UrgentTasks from "./urgent-tasks"
import { Plus } from "lucide-react"
import Sidebar from "./sidebar"
import EmployeeModal from "./employee-modal"
import TaskModal from "./task-modal"
import { useLanguage } from "@/contexts/language-context"
import LanguageToggle from "./language-toggle"

export default function EmployeeManagementSystem() {
  const { t } = useLanguage()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [taskFilter, setTaskFilter] = useState("all")
  const [teamEfficiency, setTeamEfficiency] = useState(0)
  const [activeTasks, setActiveTasks] = useState(0)
  const [delayedTasks, setDelayedTasks] = useState(0)
  const [taskPage, setTaskPage] = useState(1)
  const [employeePage, setEmployeePage] = useState(1)

  // Initial data loading
  useEffect(() => {
    // Load data from localStorage
    const storedEmployees = loadEmployeesFromLocalStorage()
    const storedTasks = loadTasksFromLocalStorage()

    if (storedEmployees.length > 0 || storedTasks.length > 0) {
      // Use stored data if available
      setEmployees(storedEmployees)

      // Update task status (check for delays)
      const updatedTasks = updateAllTasksStatus(storedTasks)
      setTasks(updatedTasks)
    } else {
      // Use sample data if no stored data
      const { employees: initialEmployees, tasks: initialTasks } = generateSampleData()
      setEmployees(initialEmployees)
      setTasks(initialTasks)
    }
  }, [])

  // Save data to localStorage when changed
  useEffect(() => {
    if (employees.length > 0 || tasks.length > 0) {
      saveAllData(employees, tasks)
    }
  }, [employees, tasks])

  // Update task status at midnight (check for delays)
  useEffect(() => {
    // Calculate time until next midnight
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    const timeUntilMidnight = tomorrow.getTime() - now.getTime()

    // Function to run at midnight
    const updateTasksAtMidnight = () => {
      setTasks((prev) => updateAllTasksStatus(prev))
    }

    // Set timer for first run
    const timer = setTimeout(updateTasksAtMidnight, timeUntilMidnight)

    return () => clearTimeout(timer)
  }, [])

  // Update dashboard stats
  useEffect(() => {
    updateDashboardStats()
  }, [tasks, employees])

  const updateDashboardStats = () => {
    // Active tasks (including delayed)
    const active = tasks.filter((task) => task.status === "active").length

    // Delayed tasks
    const delayed = tasks.filter((task) => task.status === "delayed").length

    // Team efficiency
    const efficiency = employees.length > 0 ? TaskManagementAlgorithm.calculateTeamEfficiency(employees, tasks) : 0

    setActiveTasks(active)
    setDelayedTasks(delayed)
    setTeamEfficiency(efficiency)
  }

  const updateTaskStatus = (task: Task): Task => {
    if (isTaskDelayed(task)) {
      return { ...task, status: "delayed" }
    }
    return task
  }

  const handleAddTask = (newTask: Task) => {
    // Check for delay status
    const taskWithStatus = updateTaskStatus(newTask)

    setTasks((prev) => [...prev, taskWithStatus])

    // Assign task to employee
    if (taskWithStatus.employeeId) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === taskWithStatus.employeeId
            ? { ...emp, assignedTasks: [...emp.assignedTasks, taskWithStatus.id] }
            : emp,
        ),
      )
    }
  }

  // Add follow-up task
  const handleAddFollowUpTask = (newTask: Task, previousTaskId: string) => {
    // Check for delay status
    const taskWithStatus = updateTaskStatus(newTask)

    setTasks((prev) => [...prev, taskWithStatus])

    // Assign task to employee
    if (taskWithStatus.employeeId) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === taskWithStatus.employeeId
            ? { ...emp, assignedTasks: [...emp.assignedTasks, taskWithStatus.id] }
            : emp,
        ),
      )
    }
  }

  const handleUpdateTask = (updatedTask: Task) => {
    const oldTask = tasks.find((t) => t.id === updatedTask.id)

    // Check for delay status
    const taskWithStatus = updateTaskStatus(updatedTask)

    // Update task
    setTasks((prev) => prev.map((task) => (task.id === taskWithStatus.id ? taskWithStatus : task)))

    // Update employee info if assignee changed
    if (oldTask && oldTask.employeeId !== taskWithStatus.employeeId) {
      setEmployees((prev) =>
        prev.map((emp) => {
          // Remove task from previous assignee
          if (emp.id === oldTask.employeeId) {
            return {
              ...emp,
              assignedTasks: emp.assignedTasks.filter((id) => id !== taskWithStatus.id),
            }
          }
          // Add task to new assignee
          if (emp.id === taskWithStatus.employeeId) {
            return {
              ...emp,
              assignedTasks: [...emp.assignedTasks, taskWithStatus.id],
            }
          }
          return emp
        }),
      )
    }

    // Update if status changed (to completed)
    if (oldTask && oldTask.status !== "completed" && taskWithStatus.status === "completed") {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === taskWithStatus.employeeId) {
            return {
              ...emp,
              assignedTasks: emp.assignedTasks.filter((id) => id !== taskWithStatus.id),
              completedTasks: [...emp.completedTasks, taskWithStatus.id],
            }
          }
          return emp
        }),
      )
    }

    // Update if status changed (from completed to other)
    if (oldTask && oldTask.status === "completed" && taskWithStatus.status !== "completed") {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === taskWithStatus.employeeId) {
            return {
              ...emp,
              assignedTasks: [...emp.assignedTasks, taskWithStatus.id],
              completedTasks: emp.completedTasks.filter((id) => id !== taskWithStatus.id),
            }
          }
          return emp
        }),
      )
    }
  }

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find((t) => t.id === taskId)

    // Delete task
    setTasks((prev) => prev.filter((task) => task.id !== taskId))

    // Update employee info
    if (taskToDelete && taskToDelete.employeeId) {
      setEmployees((prev) =>
        prev.map((emp) => {
          if (emp.id === taskToDelete.employeeId) {
            return {
              ...emp,
              assignedTasks: emp.assignedTasks.filter((id) => id !== taskId),
              completedTasks: emp.completedTasks.filter((id) => id !== taskId),
            }
          }
          return emp
        }),
      )
    }
  }

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, status: "completed", completedDate: new Date() } : task)),
    )

    // Update employee's task lists
    setEmployees((prev) =>
      prev.map((emp) => {
        const task = tasks.find((t) => t.id === taskId)
        if (task && task.employeeId === emp.id) {
          return {
            ...emp,
            assignedTasks: emp.assignedTasks.filter((id) => id !== taskId),
            completedTasks: [...emp.completedTasks, taskId],
          }
        }
        return emp
      }),
    )
  }

  const handleReassignTask = (taskId: string, newEmployeeId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const oldEmployeeId = task.employeeId

    // Update task
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, employeeId: newEmployeeId } : t)))

    // Update employees
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === oldEmployeeId) {
          return {
            ...emp,
            assignedTasks: emp.assignedTasks.filter((id) => id !== taskId),
          }
        }
        if (emp.id === newEmployeeId) {
          return {
            ...emp,
            assignedTasks: [...emp.assignedTasks, taskId],
          }
        }
        return emp
      }),
    )
  }

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees((prev) => [...prev, newEmployee])
  }

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees((prev) => prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
  }

  const handleDeleteEmployee = (employeeId: string) => {
    // Delete employee
    setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId))

    // Update tasks assigned to this employee
    setTasks((prev) => prev.map((task) => (task.employeeId === employeeId ? { ...task, employeeId: "" } : task)))
  }

  // Check for delayed tasks
  const checkDelayedTasks = () => {
    setTasks((prev) => updateAllTasksStatus(prev))
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "all") return true
    return task.status === taskFilter
  })

  // Paginate tasks (20 per page)
  const paginatedTasks = filteredTasks.slice((taskPage - 1) * 20, taskPage * 20)

  // Sort and paginate employees (20 per page)
  const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name, "ko"))
  const paginatedEmployees = sortedEmployees.slice((employeePage - 1) * 20, employeePage * 20)

  return (
    <div className="container mx-auto px-4 py-6">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-center">{t("employee-management-system")}</h1>
          <LanguageToggle />
        </div>
        <p className="text-center text-gray-600 dark:text-gray-400">{t("team-management-optimization")}</p>
      </header>

      <DashboardStats
        activeTasks={activeTasks}
        delayedTasks={delayedTasks}
        teamEfficiency={teamEfficiency}
        unassignedTasks={tasks.filter((task) => !task.employeeId || task.employeeId === "").length}
        employees={employees}
        tasks={tasks}
      />

      {/* 긴급 업무 섹션 */}
      <UrgentTasks
        tasks={tasks}
        employees={employees}
        onCompleteTask={handleCompleteTask}
        onReassignTask={handleReassignTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
        onAddFollowUpTask={handleAddFollowUpTask}
        algorithm={TaskManagementAlgorithm}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 업무 관리 섹션 */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t("task-management")}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={checkDelayedTasks}
                  className="text-yellow-600 hover:text-yellow-700 dark:hover:text-yellow-400 text-sm font-medium flex items-center"
                >
                  {t("check-delayed-tasks")}
                </button>
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="text-primary hover:text-primary-dark dark:hover:text-blue-400 text-sm font-medium flex items-center"
                >
                  <Plus className="h-5 w-5 mr-1" />
                  {t("add-new-task")}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t("current-task-status")}</h3>
              <div>
                <select
                  id="task-filter"
                  className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-700 focus:ring-primary focus:border-primary"
                  value={taskFilter}
                  onChange={(e) => {
                    setTaskFilter(e.target.value)
                    setTaskPage(1) // Reset to first page when filter changes
                  }}
                >
                  <option value="all">{t("all-tasks")}</option>
                  <option value="active">{t("in-progress")}</option>
                  <option value="delayed">{t("delayed")}</option>
                  <option value="completed">{t("completed")}</option>
                </select>
              </div>
            </div>

            {/* Task list with pagination (20 per page) */}
            <TaskList
              tasks={paginatedTasks}
              employees={employees}
              filter={taskFilter}
              onCompleteTask={handleCompleteTask}
              onReassignTask={handleReassignTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAddFollowUpTask={handleAddFollowUpTask}
              algorithm={TaskManagementAlgorithm}
            />

            {/* Task pagination */}
            {filteredTasks.length > 20 && (
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTaskPage((prev) => Math.max(prev - 1, 1))}
                    disabled={taskPage === 1}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                  >
                    {t("previous")}
                  </button>
                  <span className="px-3 py-1">
                    {taskPage} / {Math.ceil(filteredTasks.length / 20)}
                  </span>
                  <button
                    onClick={() => setTaskPage((prev) => prev + 1)}
                    disabled={taskPage >= Math.ceil(filteredTasks.length / 20)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 직원 관리 섹션 */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t("employee-management")}</h2>
              <button
                onClick={() => setIsEmployeeModalOpen(true)}
                className="text-primary hover:text-primary-dark dark:hover:text-blue-400 text-sm font-medium flex items-center"
              >
                <Plus className="h-5 w-5 mr-1" />
                {t("add-employee")}
              </button>
            </div>

            {/* Employee list with pagination (20 per page) */}
            <EmployeeList
              employees={paginatedEmployees}
              tasks={tasks}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onCompleteTask={handleCompleteTask}
              onReassignTask={handleReassignTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onAddFollowUpTask={handleAddFollowUpTask}
            />

            {/* Employee pagination */}
            {employees.length > 20 && (
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEmployeePage((prev) => Math.max(prev - 1, 1))}
                    disabled={employeePage === 1}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                  >
                    {t("previous")}
                  </button>
                  <span className="px-3 py-1">
                    {employeePage} / {Math.ceil(employees.length / 20)}
                  </span>
                  <button
                    onClick={() => setEmployeePage((prev) => prev + 1)}
                    disabled={employeePage >= Math.ceil(employees.length / 20)}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
                  >
                    {t("next")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 사이드바 추가 */}
      <Sidebar />

      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        onAddEmployee={handleAddEmployee}
        mode="add"
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleAddTask}
        employees={employees}
        mode="add"
        tasks={tasks}
      />
    </div>
  )
}

