"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronRight, ChevronLeft, Sparkles, Languages } from "lucide-react"
import type { LifeData } from "@/app/page"
import { translations, type Language } from "@/lib/translations"

type Props = {
  onComplete: (data: LifeData) => void
}

export function QuestionnaireForm({ onComplete }: Props) {
  const [step, setStep] = useState(0)
  const [language, setLanguage] = useState<Language>("fr")
  const t = translations[language]

  const [formData, setFormData] = useState<Partial<LifeData>>({
    sleepHours: 8,
    workStartAge: 22,
    workEndAge: 65,
    workHoursPerWeek: 40,
    studyStartAge: 5,
    studyEndAge: 22,
    studyHoursPerWeek: 35,
    birthDay: undefined,
    birthMonth: undefined,
    birthYear: undefined,
    leisureHoursPerWeek: 20,
    sportsHoursPerWeek: 3,
    familyHoursPerWeek: 10,
    travelWeeksPerYear: 2,
  })

  const questions = [
    {
      id: "intro",
      title: t.formTitle,
      description: t.formDescription,
      fields: [],
    },
    {
      id: "basic",
      title: t.basicTitle,
      description: t.basicDescription,
      fields: [
        { name: "name", label: t.firstName, type: "text", placeholder: "Marie" },
        { name: "birthDay", label: t.birthDay, type: "number", placeholder: "15", min: "1", max: "31" },
        { name: "birthMonth", label: t.birthMonth, type: "number", placeholder: "6", min: "1", max: "12" },
        { name: "birthYear", label: t.birthYear, type: "number", placeholder: "1990" },
      ],
    },
    {
      id: "life",
      title: t.lifeTitle,
      description: t.lifeDescription,
      fields: [{ name: "lifeExpectancy", label: t.lifeExpectancy, type: "number", placeholder: "85" }],
    },
    {
      id: "sleep",
      title: t.sleepTitle,
      description: t.sleepDescription,
      fields: [{ name: "sleepHours", label: t.sleepHours, type: "number", placeholder: "8", step: "0.5" }],
    },
    {
      id: "study",
      title: t.studyTitle,
      description: t.studyDescription,
      fields: [
        { name: "studyStartAge", label: t.studyStartAge, type: "number", placeholder: "5" },
        { name: "studyEndAge", label: t.studyEndAge, type: "number", placeholder: "22" },
        { name: "studyHoursPerWeek", label: t.studyHoursPerWeek, type: "number", placeholder: "35" },
      ],
    },
    {
      id: "work",
      title: t.workTitle,
      description: t.workDescription,
      fields: [
        { name: "workStartAge", label: t.workStartAge, type: "number", placeholder: "22" },
        { name: "workEndAge", label: t.workEndAge, type: "number", placeholder: "65" },
        { name: "workHoursPerWeek", label: t.workHoursPerWeek, type: "number", placeholder: "40" },
      ],
    },
    {
      id: "leisure",
      title: t.leisureTitle,
      description: t.leisureDescription,
      fields: [
        { name: "leisureHoursPerWeek", label: t.leisureHoursPerWeek, type: "number", placeholder: "20" },
        { name: "sportsHoursPerWeek", label: t.sportsHoursPerWeek, type: "number", placeholder: "3" },
        { name: "familyHoursPerWeek", label: t.familyHoursPerWeek, type: "number", placeholder: "10" },
        { name: "travelWeeksPerYear", label: t.travelWeeksPerYear, type: "number", placeholder: "2" },
      ],
    },
  ]

  const currentQuestion = questions[step]

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      if (formData.birthDay && formData.birthMonth && formData.birthYear) {
        const birthDate = new Date(formData.birthYear, formData.birthMonth - 1, formData.birthDay)
        const today = new Date()
        const age = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        formData.currentAge = age
      }
      onComplete(formData as LifeData)
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "name" ? value : value === "" ? undefined : Number.parseFloat(value),
    }))
  }

  const isStepValid = () => {
    if (step === 0) return true
    return currentQuestion.fields.every((field) => {
      const value = formData[field.name as keyof LifeData]
      return value !== undefined && value !== null && value !== ""
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-2">
        <CardHeader className="space-y-3 pb-6 p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {t.step} {step + 1} {t.of} {questions.length}
              </span>
            </div>
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-6 sm:w-8 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-xl sm:text-3xl font-bold text-balance">{currentQuestion.title}</CardTitle>
          <CardDescription className="text-sm sm:text-base text-pretty">{currentQuestion.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-12 p-3 sm:p-6">
          {step === 0 ? (
            <div className="py-6 text-center space-y-3">
              <div className="text-4xl sm:text-6xl font-bold text-primary">52 × 80</div>
              <p className="text-sm sm:text-lg text-muted-foreground text-balance">4 160 {t.weeksToLive}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentQuestion.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-sm sm:text-base">
                    {field.label}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    step={field.step}
                    min={field.min || "0"}
                    max={field.max}
                    value={
                      formData[field.name as keyof LifeData] === undefined
                        ? ""
                        : String(formData[field.name as keyof LifeData])
                    }
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="text-base sm:text-lg h-10 sm:h-12"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={step === 0}
              className="gap-2 bg-transparent text-sm sm:text-base h-9 sm:h-10"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t.previous}</span>
            </Button>
            <Button onClick={handleNext} disabled={!isStepValid()} className="gap-2 text-sm sm:text-base h-9 sm:h-10">
              {step === questions.length - 1 ? t.viewGrid : t.next}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-accent transition-all shadow-lg border-2 border-border text-sm font-medium"
        >
          <Languages className="h-4 w-4" />
          {language === "fr" ? "EN" : "FR"}
        </button>
      </div>
    </div>
  )
}
