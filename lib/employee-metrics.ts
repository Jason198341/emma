import type { Employee, Task } from "./types"

// Calculate employee's current workload (0-100%)
export function calculateWorkload(employee: Employee, tasks: Task[]): number {
  const activeTasks = employee.assignedTasks.filter((taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    return task && task.status !== "completed"
  })

  // Apply importance-based weighting
  const weightedWorkload = activeTasks.reduce((total, taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    return total + (task ? task.importance : 0)
  }, 0)

  // Maximum capacity based on employee's base capacity
  const maxCapacity = employee.baseCapacity * 3

  return Math.min(100, (weightedWorkload / maxCapacity) * 100)
}

// Calculate deadline pressure (0-100)
export function calculateDeadlinePressure(employee: Employee, tasks: Task[]): number {
  const today = new Date()
  let totalPressure = 0
  let taskCount = 0

  employee.assignedTasks.forEach((taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== "completed") {
      const deadline = new Date(task.deadline)
      const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      // Higher pressure for closer deadlines
      let pressure = 0
      if (daysLeft < 0) {
        // Past deadline
        pressure = 100
      } else if (daysLeft === 0) {
        // Due today
        pressure = 90
      } else if (daysLeft === 1) {
        // Due tomorrow
        pressure = 80
      } else if (daysLeft <= 3) {
        // Due within 3 days
        pressure = 70
      } else if (daysLeft <= 7) {
        // Due within a week
        pressure = 50
      } else {
        // Due in more than a week
        pressure = 30
      }

      // Apply importance weighting
      pressure *= task.importance / 2

      totalPressure += pressure
      taskCount++
    }
  })

  return taskCount > 0 ? totalPressure / taskCount : 0
}

// Calculate task complexity (0-100)
export function calculateTaskComplexity(employee: Employee, tasks: Task[]): number {
  let totalComplexity = 0
  let taskCount = 0

  employee.assignedTasks.forEach((taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== "completed") {
      // Complexity based on importance and description length
      const importanceFactor = task.importance * 15 // Max 60
      const descriptionFactor = Math.min(40, task.description.length / 10) // Max 40

      const complexity = importanceFactor + descriptionFactor
      totalComplexity += complexity
      taskCount++
    }
  })

  return taskCount > 0 ? Math.min(100, totalComplexity / taskCount) : 0
}

// Calculate stress index (0-100)
export function calculateStressIndex(employee: Employee, tasks: Task[]): number {
  const workload = calculateWorkload(employee, tasks)
  const deadlinePressure = calculateDeadlinePressure(employee, tasks)
  const taskComplexity = calculateTaskComplexity(employee, tasks)

  // Weighted average
  const stressIndex = workload * 0.5 + deadlinePressure * 0.3 + taskComplexity * 0.2

  return stressIndex
}

// Calculate performance score (0-100)
export function calculatePerformance(employee: Employee, tasks: Task[]): number {
  const recentTaskCount = 10 // Benchmark for task count
  const completedCount = employee.completedTasks.length

  if (completedCount === 0) {
    return 50 // Default value
  }

  // Calculate on-time completion ratio
  const onTimeCompletions = employee.completedTasks.filter((taskId) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return false

    const deadline = new Date(task.deadline)
    const completedDate = new Date(task.completedDate!)
    return completedDate <= deadline
  }).length

  const onTimeRatio = completedCount > 0 ? onTimeCompletions / completedCount : 0

  // Calculate importance weighting
  const importanceWeight =
    employee.completedTasks.reduce((total, taskId) => {
      const task = tasks.find((t) => t.id === taskId)
      return total + (task ? task.importance : 0)
    }, 0) / Math.max(1, completedCount)

  // Calculate performance score
  const performanceScore =
    onTimeRatio * 50 + // On-time completion (50%)
    Math.min(completedCount / recentTaskCount, 1) * 30 + // Task volume (30%)
    importanceWeight * 5 // Importance weighting (20%)

  return performanceScore
}

