import type { Employee, Task } from "./types"

export function generateSampleData() {
  // 빈 배열로 초기화하여 사용자가 직접 데이터를 추가할 수 있게 함
  const employees: Employee[] = []
  const tasks: Task[] = []

  return { employees, tasks }
}

