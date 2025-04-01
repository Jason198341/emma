"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "ko" | "en"

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Get initial language from localStorage or default to Korean
  const [language, setLanguage] = useState<Language>("ko")

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "ko" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// Translations object
const translations: Record<Language, Record<string, string>> = {
  ko: {
    // System
    "employee-management-system": "직원 관리 시스템",
    "team-management-optimization": "효율적인 팀 관리와 직원 성과 최적화",
    "퀵 추가 메뉴": "퀵 추가 메뉴",
    "퀵 추가 메뉴 열기": "퀵 추가 메뉴 열기",
    "알고리즘 설명 보기": "알고리즘 설명 보기",

    // Dashboard
    "active-tasks": "활성 업무",
    "current-tasks": "현재 진행중인 업무",
    "delayed-tasks": "지연 업무",
    "overdue-tasks": "마감일 초과 업무",
    "potential-tasks": "잠재 업무",
    "unassigned-tasks": "담당자 미배정 업무",
    "team-efficiency": "팀 효율성",
    "performance-efficiency": "업무 수행 효율성",
    "tasks-by-employee": "직원별 활성 업무:",
    "delayed-tasks-by-employee": "직원별 지연 업무:",
    "no-delayed-tasks": "지연 업무 없음",
    "assign-tasks-prompt": "담당자를 배정하여 업무를 시작하세요.",
    "all-tasks-assigned": "모든 업무에 담당자가 배정되었습니다.",

    // Urgent Tasks
    "urgent-tasks": "긴급 업무",
    "no-urgent-tasks": "현재 긴급한 업무가 없습니다.",
    "task-details": "업무 상세 설명",
    "no-description": "상세 설명이 없습니다.",
    "created-date": "생성일:",
    deadline: "마감일:",
    "days-overdue": "일 초과",
    "due-today": "오늘 마감",
    "days-remaining": "일 남음",

    // Task Management
    "task-management": "업무 관리",
    "check-delayed-tasks": "지연 업무 체크",
    "add-new-task": "새 업무 추가",
    "current-task-status": "현재 업무 현황",
    "all-tasks": "모든 업무",
    "in-progress": "진행 중",
    delayed: "지연",
    completed: "완료",
    "no-tasks": "등록된 업무가 없습니다.",
    "add-task-prompt": "위의 '새 업무 추가' 버튼을 클릭하여 업무를 추가해 보세요.",
    "no-filtered-tasks": "선택한 필터에 해당하는 업무가 없습니다.",
    previous: "이전",
    next: "다음",

    // Employee Management
    "employee-management": "직원 관리",
    "add-employee": "직원 추가",
    "no-employees": "등록된 직원이 없습니다.",
    "add-employee-prompt": "오른쪽 상단의 '직원 추가' 버튼을 클릭하여 직원을 추가해 보세요.",
    tasks: "개 업무",
    workload: "업무 부하",
    "stress-index": "스트레스 지수",
    "performance-score": "성과 점수",

    // Task Modal
    "edit-task": "업무 수정",
    "add-task": "새 업무 추가",
    "add-follow-up-task": "후속 업무 추가",
    "task-title": "업무 제목",
    assignee: "담당자",
    "search-employee": "담당자 검색...",
    "select-employee": "직원 선택",
    deadline: "마감일",
    "task-description": "업무 설명",
    importance: "중요도",
    low: "낮음",
    medium: "보통",
    high: "높음",
    urgent: "긴급",
    status: "상태",
    "in-progress": "진행 중",
    delayed: "지연",
    completed: "완료",
    add: "추가",
    save: "저장",
    "title-deadline-required": "제목과 마감일은 필수 입력 항목입니다.",

    // Employee Modal
    "edit-employee": "직원 정보 수정",
    "add-employee": "직원 추가",
    name: "이름",
    position: "직책",
    skills: "주요 기술 (쉼표로 구분)",
    capacity: "업무 수용력 (1-10)",
    "low-capacity": "낮음",
    "high-capacity": "높음",
    "name-position-required": "이름과 직책은 필수 입력 항목입니다.",

    // Confirmation Modals
    "delete-task": "업무 삭제",
    "delete-task-confirm": "이 업무를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    "delete-employee": "직원 삭제",
    "delete-employee-confirm": "이 직원을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    "employee-has-tasks":
      "이 직원에게 할당된 진행 중인 업무가 있습니다. 업무를 재배정하거나 완료한 후 직원을 삭제해주세요.",
    "follow-up-task": "후속 업무 확인",
    "follow-up-task-confirm": "업무를 완료 처리합니다. 이 업무에 대한 후속 업무가 있습니까?",
    "follow-up-task-confirm-1": "업무를 완료 처리합니다.",
    "follow-up-task-confirm-2": "이 업무에 대한 후속 업무가 있습니까?",
    "remind-copied": "리마인드 내용 복사됨",
    "remind-copied-message": "다음 내용이 클립보드에 복사되었습니다:",

    // Actions
    edit: "수정",
    delete: "삭제",
    complete: "완료",
    reassign: "재배정",
    remind: "리마인드",
    cancel: "취소",
    confirm: "확인",
    yes: "예",
    no: "아니오",
    close: "닫기",

    // Employee Tasks Modal
    "employee-tasks": "의 업무 목록",
    "no-active-tasks": "진행 중인 업무가 없습니다.",
    "task-status": "상태",
    "in-progress": "진행중",
    delayed: "지연",
    "approaching-deadline": "마감임박",

    // Remind Modal
    "remind-email": "님, 건에 대해서 리마인드 메일 드립니다.\n피드백은 까지 부탁드립니다.\n\n감사합니다.",
    "remind-multiple": "님,\n\n건에 대해 리마인드 드립니다.\n\n감사합니다.",

    // Language
    language: "언어",
    korean: "한국어",
    english: "영어",

    // Date Options
    "date-option-3-days": "D+3 (3일 후)",
    "date-option-7-days": "D+7 (7일 후)",
    "date-option-15-days": "D+15 (15일 후)",
    "date-option-30-days": "D+30 (30일 후)",
  },
  en: {
    // System
    "employee-management-system": "Employee Management System",
    "team-management-optimization": "Efficient Team Management and Employee Performance Optimization",
    "퀵 추가 메뉴": "Quick Add Menu",
    "퀵 추가 메뉴 열기": "Open Quick Add Menu",
    "알고리즘 설명 보기": "View Algorithm Explanation",

    // Dashboard
    "active-tasks": "Active Tasks",
    "current-tasks": "Currently in progress",
    "delayed-tasks": "Delayed Tasks",
    "overdue-tasks": "Past deadline",
    "potential-tasks": "Potential Tasks",
    "unassigned-tasks": "Unassigned tasks",
    "team-efficiency": "Team Efficiency",
    "performance-efficiency": "Task performance efficiency",
    "tasks-by-employee": "Tasks by employee:",
    "delayed-tasks-by-employee": "Delayed tasks by employee:",
    "no-delayed-tasks": "No delayed tasks",
    "assign-tasks-prompt": "Assign employees to start tasks.",
    "all-tasks-assigned": "All tasks have been assigned.",

    // Urgent Tasks
    "urgent-tasks": "Urgent Tasks",
    "no-urgent-tasks": "No urgent tasks at the moment.",
    "task-details": "Task Details",
    "no-description": "No description available.",
    "created-date": "Created:",
    deadline: "Deadline:",
    "days-overdue": "days overdue",
    "due-today": "Due today",
    "days-remaining": "days remaining",

    // Task Management
    "task-management": "Task Management",
    "check-delayed-tasks": "Check Delayed Tasks",
    "add-new-task": "Add New Task",
    "current-task-status": "Current Task Status",
    "all-tasks": "All Tasks",
    "in-progress": "In Progress",
    delayed: "Delayed",
    completed: "Completed",
    "no-tasks": "No tasks registered.",
    "add-task-prompt": "Click the 'Add New Task' button above to add a task.",
    "no-filtered-tasks": "No tasks match the selected filter.",
    previous: "Previous",
    next: "Next",

    // Employee Management
    "employee-management": "Employee Management",
    "add-employee": "Add Employee",
    "no-employees": "No employees registered.",
    "add-employee-prompt": "Click the 'Add Employee' button in the top right to add an employee.",
    tasks: "tasks",
    workload: "Workload",
    "stress-index": "Stress Index",
    "performance-score": "Performance Score",

    // Task Modal
    "edit-task": "Edit Task",
    "add-task": "Add New Task",
    "add-follow-up-task": "Add Follow-up Task",
    "task-title": "Task Title",
    assignee: "Assignee",
    "search-employee": "Search employee...",
    "select-employee": "Select employee",
    deadline: "Deadline",
    "task-description": "Task Description",
    importance: "Importance",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    status: "Status",
    "in-progress": "In Progress",
    delayed: "Delayed",
    completed: "Completed",
    add: "Add",
    save: "Save",
    "title-deadline-required": "Title and deadline are required fields.",

    // Employee Modal
    "edit-employee": "Edit Employee",
    "add-employee": "Add Employee",
    name: "Name",
    position: "Position",
    skills: "Key Skills (comma separated)",
    capacity: "Work Capacity (1-10)",
    "low-capacity": "Low",
    "high-capacity": "High",
    "name-position-required": "Name and position are required fields.",

    // Confirmation Modals
    "delete-task": "Delete Task",
    "delete-task-confirm": "Are you sure you want to delete this task? This action cannot be undone.",
    "delete-employee": "Delete Employee",
    "delete-employee-confirm": "Are you sure you want to delete this employee? This action cannot be undone.",
    "employee-has-tasks":
      "This employee has active tasks assigned. Please reassign or complete these tasks before deleting the employee.",
    "follow-up-task": "Follow-up Task Confirmation",
    "follow-up-task-confirm": "This task will be marked as complete. Is there a follow-up task for this?",
    "follow-up-task-confirm-1": "This task will be marked as complete.",
    "follow-up-task-confirm-2": "Is there a follow-up task for this?",
    "remind-copied": "Reminder Content Copied",
    "remind-copied-message": "The following content has been copied to clipboard:",

    // Actions
    edit: "Edit",
    delete: "Delete",
    complete: "Complete",
    reassign: "Reassign",
    remind: "Remind",
    cancel: "Cancel",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    close: "Close",

    // Employee Tasks Modal
    "employee-tasks": "'s Task List",
    "no-active-tasks": "No active tasks.",
    "task-status": "Status",
    "in-progress": "In Progress",
    delayed: "Delayed",
    "approaching-deadline": "Deadline Approaching",

    // Remind Modal
    "remind-email": ", I'm sending a reminder about the task. Please provide feedback by . Thank you.",
    "remind-multiple": ",\n\nThis is a reminder about the following tasks:\n\nThank you.",

    // Language
    language: "Language",
    korean: "Korean",
    english: "English",

    // Date Options
    "date-option-3-days": "D+3 (3 days later)",
    "date-option-7-days": "D+7 (7 days later)",
    "date-option-15-days": "D+15 (15 days later)",
    "date-option-30-days": "D+30 (30 days later)",
  },
}

