"use client"

import { useEffect, useRef, useState } from "react"
import type { Employee } from "@/lib/types"
import { Chart, registerables } from "chart.js"

// Chart.js 컴포넌트 등록
Chart.register(...registerables)

interface AnalyticsChartsProps {
  employees: Employee[]
}

export default function AnalyticsCharts({ employees }: AnalyticsChartsProps) {
  const stressChartRef = useRef<HTMLCanvasElement>(null)
  const performanceChartRef = useRef<HTMLCanvasElement>(null)
  const stressChartInstance = useRef<Chart | null>(null)
  const performanceChartInstance = useRef<Chart | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // 다크 모드 확인
    if (typeof window !== "undefined") {
      setIsDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)

      // 다크 모드 변경 감지
      const darkModeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleDarkModeChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches)
      }

      darkModeMediaQuery.addEventListener("change", handleDarkModeChange)

      return () => {
        darkModeMediaQuery.removeEventListener("change", handleDarkModeChange)
      }
    }
  }, [])

  // 차트 정리 함수
  const cleanupCharts = () => {
    if (stressChartInstance.current) {
      stressChartInstance.current.destroy()
      stressChartInstance.current = null
    }

    if (performanceChartInstance.current) {
      performanceChartInstance.current.destroy()
      performanceChartInstance.current = null
    }
  }

  useEffect(() => {
    // 언마운트 시 정리
    return () => {
      cleanupCharts()
    }
  }, [])

  useEffect(() => {
    if (employees.length === 0 || !stressChartRef.current || !performanceChartRef.current) {
      // 직원이 없으면 차트 정리
      cleanupCharts()
      return
    }

    // 기존 차트 정리
    cleanupCharts()

    // 차트 데이터 준비
    const labels = []
    for (let i = 0; i < 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (4 - i))
      labels.push(date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" }))
    }

    // 데이터셋 색상
    const colors = [
      { bg: "rgba(59, 130, 246, 0.2)", border: "rgb(59, 130, 246)" },
      { bg: "rgba(16, 185, 129, 0.2)", border: "rgb(16, 185, 129)" },
      { bg: "rgba(249, 115, 22, 0.2)", border: "rgb(249, 115, 22)" },
      { bg: "rgba(236, 72, 153, 0.2)", border: "rgb(236, 72, 153)" },
      { bg: "rgba(139, 92, 246, 0.2)", border: "rgb(139, 92, 246)" },
    ]

    // 테마에 따른 텍스트 색상
    const textColor = isDarkMode ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"
    const gridColor = isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

    // 데이터셋 생성
    const stressDatasets = []
    const performanceDatasets = []

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i]
      const colorIndex = i % colors.length

      // 스트레스 데이터 준비
      const stressData = []
      for (let j = 0; j < 5; j++) {
        const date = new Date()
        date.setDate(date.getDate() - (4 - j))

        // 직원의 등록일 이후 데이터만 표시
        const historyPoint = employee.stressHistory.find(
          (h) =>
            h.date.getDate() === date.getDate() &&
            h.date.getMonth() === date.getMonth() &&
            h.date.getFullYear() === date.getFullYear(),
        )

        // 등록일 이후 데이터만 표시
        if (historyPoint) {
          stressData.push(historyPoint.value)
        } else {
          stressData.push(null)
        }
      }

      stressDatasets.push({
        label: employee.name,
        data: stressData,
        borderColor: colors[colorIndex].border,
        backgroundColor: colors[colorIndex].bg,
        borderWidth: 2,
        tension: 0.3,
      })

      // 성과 데이터 준비
      const performanceData = []
      for (let j = 0; j < 5; j++) {
        const date = new Date()
        date.setDate(date.getDate() - (4 - j))

        // 직원의 등록일 이후 데이터만 표시
        const historyPoint = employee.performanceHistory.find(
          (h) =>
            h.date.getDate() === date.getDate() &&
            h.date.getMonth() === date.getMonth() &&
            h.date.getFullYear() === date.getFullYear(),
        )

        if (historyPoint) {
          performanceData.push(historyPoint.value)
        } else {
          performanceData.push(null)
        }
      }

      performanceDatasets.push({
        label: employee.name,
        data: performanceData,
        borderColor: colors[colorIndex].border,
        backgroundColor: colors[colorIndex].bg,
        borderWidth: 2,
        tension: 0.3,
      })
    }

    // 스트레스 차트 생성
    const stressCtx = stressChartRef.current.getContext("2d")
    if (stressCtx) {
      stressChartInstance.current = new Chart(stressCtx, {
        type: "line",
        data: {
          labels,
          datasets: stressDatasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                font: { size: 11 },
                color: textColor,
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              ticks: { color: textColor },
              grid: { display: false },
            },
            y: {
              min: 0,
              max: 100,
              ticks: { color: textColor },
              grid: { color: gridColor },
            },
          },
        },
      })
    }

    // 성과 차트 생성
    const performanceCtx = performanceChartRef.current.getContext("2d")
    if (performanceCtx) {
      performanceChartInstance.current = new Chart(performanceCtx, {
        type: "line",
        data: {
          labels,
          datasets: performanceDatasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
              labels: {
                font: { size: 11 },
                color: textColor,
              },
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              ticks: { color: textColor },
              grid: { display: false },
            },
            y: {
              min: 0,
              max: 100,
              ticks: { color: textColor },
              grid: { color: gridColor },
            },
          },
        },
      })
    }
  }, [employees, isDarkMode])

  if (employees.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">팀 분석</h2>
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          <p className="mb-2">분석할 데이터가 없습니다.</p>
          <p className="text-sm">직원을 추가하고 업무를 할당하면 여기에 분석 차트가 표시됩니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">팀 분석</h2>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">스트레스 지수</h3>
          <div className="h-56">
            <canvas ref={stressChartRef}></canvas>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium mb-2">업무 수행 능력</h3>
          <div className="h-56">
            <canvas ref={performanceChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  )
}

