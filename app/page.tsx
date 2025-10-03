"use client"

import { useState } from "react"
import { QuestionnaireForm } from "@/components/questionnaire-form"
import { LifeGrid } from "@/components/life-grid"

export type LifeData = {
  name: string
  birthDay: number
  birthMonth: number
  birthYear: number
  currentAge: number
  lifeExpectancy: number
  sleepHours: number
  workStartAge: number
  workEndAge: number
  workHoursPerWeek: number
  studyStartAge: number
  studyEndAge: number
  studyHoursPerWeek: number
  leisureHoursPerWeek: number
  sportsHoursPerWeek: number
  familyHoursPerWeek: number
  travelWeeksPerYear: number
}

export default function Home() {
  const [lifeData, setLifeData] = useState<LifeData | null>(null)
  const [showGrid, setShowGrid] = useState(false)

  const handleComplete = (data: LifeData) => {
    setLifeData(data)
    setShowGrid(true)
  }

  const handleReset = () => {
    setShowGrid(false)
    setLifeData(null)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background">
      {!showGrid ? (
        <QuestionnaireForm onComplete={handleComplete} />
      ) : (
        <LifeGrid data={lifeData!} onReset={handleReset} />
      )}
    </main>
  )
}
