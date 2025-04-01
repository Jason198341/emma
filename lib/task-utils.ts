import type { Task } from "./types"

// 지연된 업무인지 확인하는 함수
export function isTaskDelayed(task: Task): boolean {
  if (task.status === "completed") return false

  const today = new Date()
  const deadline = new Date(task.deadline)

  // 날짜만 비교 (시간 제외)
  today.setHours(0, 0, 0, 0)
  deadline.setHours(0, 0, 0, 0)

  return deadline < today
}

// 업무 상태 업데이트 함수
export function updateTaskStatus(task: Task): Task {
  // 이미 완료된 업무는 상태 변경 없음
  if (task.status === "completed") return task

  // 지연 상태 확인
  const delayed = isTaskDelayed(task)

  return {
    ...task,
    status: delayed ? "delayed" : "active",
  }
}

// 모든 업무의 상태 업데이트
export function updateAllTasksStatus(tasks: Task[]): Task[] {
  return tasks.map((task) => updateTaskStatus(task))
}

