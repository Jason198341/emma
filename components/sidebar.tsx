"use client"

import { useState, useEffect } from "react"
import { Plus, UserPlus, ClipboardList, BookOpen } from "lucide-react"
import AlgorithmExplanation from "./algorithm-explanation"
import { useLanguage } from "@/contexts/language-context"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLanguage()

  // 모달 상태 관리
  const [showAlgorithmModal, setShowAlgorithmModal] = useState(false)

  // 버튼 클릭 시 이벤트 발생 - 수정된 부분
  const openTaskModal = () => {
    // 직접 이벤트를 생성하고 발생시킴
    try {
      const event = new CustomEvent("openTaskModal")
      window.dispatchEvent(event)
      console.log("Task modal event dispatched")

      // 이벤트 발생 후 메뉴 닫기
      setIsOpen(false)
    } catch (error) {
      console.error("Error dispatching task modal event:", error)
    }
  }

  const openEmployeeModal = () => {
    // 직접 이벤트를 생성하고 발생시킴
    try {
      const event = new CustomEvent("openEmployeeModal")
      window.dispatchEvent(event)
      console.log("Employee modal event dispatched")

      // 이벤트 발생 후 메뉴 닫기
      setIsOpen(false)
    } catch (error) {
      console.error("Error dispatching employee modal event:", error)
    }
  }

  // 알고리즘 모달 토글
  const toggleAlgorithmModal = () => {
    setShowAlgorithmModal(!showAlgorithmModal)
    // 모달을 열 때 메뉴 닫기
    setIsOpen(false)
  }

  // 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const floatingMenu = document.getElementById("floating-menu")
      if (floatingMenu && !floatingMenu.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // 모달 이벤트 리스너 등록 확인을 위한 디버깅 코드
  useEffect(() => {
    const checkTaskModalListener = () => {
      console.log("Task modal event listener check")
    }

    const checkEmployeeModalListener = () => {
      console.log("Employee modal event listener check")
    }

    // 테스트용 이벤트 리스너 등록
    window.addEventListener("openTaskModal", checkTaskModalListener)
    window.addEventListener("openEmployeeModal", checkEmployeeModalListener)

    return () => {
      window.removeEventListener("openTaskModal", checkTaskModalListener)
      window.removeEventListener("openEmployeeModal", checkEmployeeModalListener)
    }
  }, [])

  return (
    <>
      {/* 플로팅 메뉴 컨테이너 */}
      <div id="floating-menu" className="fixed bottom-8 right-8 z-30">
        {/* 알고리즘 설명 버튼 - 메뉴가 열렸을 때만 표시 */}
        <button
          onClick={toggleAlgorithmModal}
          className={`absolute bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600 transition-all duration-300 ${
            isOpen ? "opacity-100 translate-y-[-120px]" : "opacity-0 translate-y-0 pointer-events-none"
          }`}
          aria-label={t("알고리즘 설명")}
        >
          <BookOpen className="h-5 w-5" />
        </button>

        {/* 직원 추가 버튼 - 메뉴가 열렸을 때만 표시 */}
        <button
          onClick={openEmployeeModal}
          className={`absolute bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 ${
            isOpen
              ? "opacity-100 translate-y-[-80px] translate-x-[-40px]"
              : "opacity-0 translate-y-0 translate-x-0 pointer-events-none"
          }`}
          aria-label={t("직원 추가")}
        >
          <UserPlus className="h-5 w-5" />
        </button>

        {/* 업무 추가 버튼 - 메뉴가 열렸을 때만 표시 */}
        <button
          onClick={openTaskModal}
          className={`absolute bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-300 ${
            isOpen
              ? "opacity-100 translate-y-[-40px] translate-x-[-80px]"
              : "opacity-0 translate-y-0 translate-x-0 pointer-events-none"
          }`}
          aria-label={t("업무 추가")}
        >
          <ClipboardList className="h-5 w-5" />
        </button>

        {/* 메인 토글 버튼 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary-dark transition-all duration-300 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-label={isOpen ? t("메뉴 닫기") : t("메뉴 열기")}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* 알고리즘 설명 모달 */}
      {showAlgorithmModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleAlgorithmModal}></div>
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">{t("알고리즘 설명")}</h2>
              <button
                onClick={toggleAlgorithmModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <AlgorithmExplanation />
            </div>
          </div>
        </>
      )}
    </>
  )
}

