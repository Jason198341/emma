import type { Employee, Task } from "./types"

// 로컬 스토리지 키
const EMPLOYEES_STORAGE_KEY = "employee-management-employees"
const TASKS_STORAGE_KEY = "employee-management-tasks"

// 직원 데이터 저장
export function saveEmployeesToLocalStorage(employees: Employee[]): void {
  try {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees))
  } catch (error) {
    console.error("직원 데이터 저장 중 오류 발생:", error)
  }
}

// 업무 데이터 저장
export function saveTasksToLocalStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error("업무 데이터 저장 중 오류 발생:", error)
  }
}

// 직원 데이터 불러오기
export function loadEmployeesFromLocalStorage(): Employee[] {
  try {
    const data = localStorage.getItem(EMPLOYEES_STORAGE_KEY)
    if (!data) return []

    const parsedData = JSON.parse(data)

    // Date 객체 변환
    return parsedData.map((employee: any) => ({
      ...employee,
      stressHistory: employee.stressHistory.map((h: any) => ({
        ...h,
        date: new Date(h.date),
      })),
      performanceHistory: employee.performanceHistory.map((h: any) => ({
        ...h,
        date: new Date(h.date),
      })),
    }))
  } catch (error) {
    console.error("직원 데이터 불러오기 중 오류 발생:", error)
    return []
  }
}

// 업무 데이터 불러오기
export function loadTasksFromLocalStorage(): Task[] {
  try {
    const data = localStorage.getItem(TASKS_STORAGE_KEY)
    if (!data) return []

    const parsedData = JSON.parse(data)

    // Date 객체 변환
    return parsedData.map((task: any) => ({
      ...task,
      createdDate: new Date(task.createdDate),
      completedDate: task.completedDate ? new Date(task.completedDate) : null,
    }))
  } catch (error) {
    console.error("업무 데이터 불러오기 중 오류 발생:", error)
    return []
  }
}

// 모든 데이터 저장
export function saveAllData(employees: Employee[], tasks: Task[]): void {
  saveEmployeesToLocalStorage(employees)
  saveTasksToLocalStorage(tasks)
}

