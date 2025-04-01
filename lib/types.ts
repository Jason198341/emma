export interface Employee {
  id: string
  name: string
  position: string
  skills: string[]
  baseCapacity: number
  assignedTasks: string[]
  completedTasks: string[]
  stressHistory: HistoryPoint[]
  performanceHistory: HistoryPoint[]
}

export interface HistoryPoint {
  date: Date
  value: number
}

export interface Task {
  id: string
  title: string
  employeeId: string
  description: string
  deadline: string
  importance: number
  status: "active" | "delayed" | "completed"
  createdDate: Date
  completedDate: Date | null
}

export interface RecommendedEmployee {
  employeeId: string
  name: string
  position: string
  suitabilityScore: number
}

