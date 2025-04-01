import type { Employee, Task, RecommendedEmployee } from "./types"
import { calculateWorkload, calculateStressIndex, calculatePerformance } from "./employee-metrics"

export class TaskManagementAlgorithm {
  // Predict employee performance based on history and current state
  static predictEmployeePerformance(employee: Employee, tasks: Task[]): number {
    if (!employee || employee.performanceHistory.length === 0) {
      return 50 // Default value
    }

    // Analyze trend from recent performance data
    const recentPerformance = employee.performanceHistory.slice(-3)
    const performanceValues = recentPerformance.map((p) => p.value)

    // Consider current workload
    const currentWorkload = calculateWorkload(employee, tasks)
    const workloadFactor = 1 - currentWorkload / 200 // Higher workload reduces performance

    // Consider stress impact
    const currentStress = calculateStressIndex(employee, tasks)
    const stressFactor = 1 - currentStress / 200 // Higher stress reduces performance

    // Weighted average with higher weight for more recent performance
    const weightedSum = performanceValues.reduce((sum, value, i) => {
      const weight = i + 1 // Higher index = more recent = higher weight
      return sum + value * weight
    }, 0)

    const weightSum = (performanceValues.length * (performanceValues.length + 1)) / 2
    const basePerformance = weightedSum / weightSum

    // Final predicted performance
    const predictedPerformance = basePerformance * workloadFactor * stressFactor

    return Math.max(0, Math.min(100, predictedPerformance))
  }

  // Calculate task urgency (0-100)
  static calculateTaskUrgency(task: Task): number {
    const today = new Date()
    const deadline = new Date(task.deadline)
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    let urgency = 0

    if (daysLeft < 0) {
      // Past deadline
      urgency = 100
    } else if (daysLeft === 0) {
      // Due today
      urgency = 90
    } else if (daysLeft === 1) {
      // Due tomorrow
      urgency = 80
    } else if (daysLeft <= 3) {
      // Due within 3 days
      urgency = 70
    } else if (daysLeft <= 7) {
      // Due within a week
      urgency = 50
    } else if (daysLeft <= 14) {
      // Due within 2 weeks
      urgency = 30
    } else {
      // Due in more than 2 weeks
      urgency = 10
    }

    // Apply importance weighting
    return urgency * (task.importance / 2)
  }

  // Recommend optimal employee assignment for a task
  static recommendTaskAssignment(task: Task, employees: Employee[], tasks: Task[]): RecommendedEmployee[] {
    // Analyze task characteristics
    const taskImportance = task.importance
    const taskUrgency = this.calculateTaskUrgency(task)

    // Calculate suitability score for each employee
    const employeeRatings = employees.map((employee) => {
      // Current stress and workload
      const stress = calculateStressIndex(employee, tasks)
      const workload = calculateWorkload(employee, tasks)

      // Predicted performance
      const performance = this.predictEmployeePerformance(employee, tasks)

      // Importance-based weighting
      const importanceWeight = 1 + (taskImportance - 2) * 0.2 // 1.0 ~ 1.6

      // Employee capacity score
      const capacityScore = employee.baseCapacity * 10

      // Calculate suitability score (higher is better)
      // Composite calculation considering performance, workload, stress, and capacity
      const suitabilityScore =
        (performance * 0.4 + (100 - workload) * 0.3 + (100 - stress) * 0.2 + capacityScore * 0.1) * importanceWeight

      return {
        employeeId: employee.id,
        name: employee.name,
        position: employee.position,
        suitabilityScore,
      }
    })

    // Sort by suitability score (descending)
    return employeeRatings.sort((a, b) => b.suitabilityScore - a.suitabilityScore)
  }

  // Calculate team efficiency (0-100)
  static calculateTeamEfficiency(employees: Employee[], tasks: Task[]): number {
    if (employees.length === 0) return 0

    // Average employee performance
    const performanceSum = employees.reduce((sum, employee) => {
      return sum + calculatePerformance(employee, tasks)
    }, 0)
    const avgPerformance = performanceSum / employees.length

    // On-time completion rate
    const allCompletedTasks = tasks.filter((task) => task.status === "completed")
    const onTimeCompletions = allCompletedTasks.filter((task) => {
      if (!task.completedDate) return false
      const deadline = new Date(task.deadline)
      const completedDate = new Date(task.completedDate)
      return completedDate <= deadline
    })

    const onTimeRate = allCompletedTasks.length > 0 ? (onTimeCompletions.length / allCompletedTasks.length) * 100 : 0

    // Average stress level (lower is better)
    const stressSum = employees.reduce((sum, employee) => {
      return sum + calculateStressIndex(employee, tasks)
    }, 0)
    const avgStress = stressSum / employees.length
    const stressFactor = Math.max(0, 100 - avgStress)

    // Team efficiency score
    const efficiencyScore = avgPerformance * 0.5 + onTimeRate * 0.3 + stressFactor * 0.2

    return Math.min(100, Math.max(0, efficiencyScore))
  }
}

