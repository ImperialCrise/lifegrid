"use client"

import type React from "react"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RotateCcw, Languages, TrendingUp, Clock, Calendar, Heart, ChevronDown } from "lucide-react"
import type { LifeData } from "@/app/page"
import { translations, type Language } from "@/lib/translations"

type Props = {
  data: LifeData
  onReset: () => void
}

type Category = {
  id: string
  labelKey: keyof typeof translations.fr
  color: string
}

type DisplayMode = "normal" | "life"

const CATEGORIES: Category[] = [
  { id: "lived", labelKey: "lived", color: "rgb(99, 102, 241)" }, // Indigo
  { id: "sleep", labelKey: "sleep", color: "rgb(139, 92, 246)" }, // Purple
  { id: "study", labelKey: "study", color: "rgb(236, 72, 153)" }, // Pink
  { id: "work", labelKey: "work", color: "rgb(251, 146, 60)" }, // Orange
  { id: "retirement", labelKey: "retirement", color: "rgb(34, 197, 94)" }, // Green
  { id: "leisure", labelKey: "leisure", color: "rgb(14, 165, 233)" }, // Sky blue
  { id: "sports", labelKey: "sports", color: "rgb(234, 179, 8)" }, // Yellow
  { id: "family", labelKey: "family", color: "rgb(244, 114, 182)" }, // Light pink
  { id: "travel", labelKey: "travel", color: "rgb(168, 85, 247)" }, // Purple-pink
]

export function LifeGrid({ data, onReset }: Props) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("normal")
  const [hoveredCell, setHoveredCell] = useState<{ index: number; category: string } | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const gridRef = useRef<HTMLDivElement>(null)
  const [language, setLanguage] = useState<Language>("fr")
  const t = translations[language]

  const [scrollY, setScrollY] = useState(0)
  const [showScrollHint, setShowScrollHint] = useState(true)
  const [showInsight, setShowInsight] = useState(false)
  const [insightPhase, setInsightPhase] = useState<"stat" | "moral">("stat")

  const currentWeekPosition = useMemo(() => {
    if (!data.birthDay || !data.birthMonth || !data.birthYear) return null

    const birthDate = new Date(data.birthYear, data.birthMonth - 1, data.birthDay)
    const today = new Date()
    const diffTime = today.getTime() - birthDate.getTime()
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))

    return diffWeeks
  }, [data.birthDay, data.birthMonth, data.birthYear])

  const gridData = useMemo(() => {
    const weeks = 52
    const years = data.lifeExpectancy
    const totalCells = weeks * years

    const totalWeeks = data.lifeExpectancy * 52
    const sleepWeeks = Math.round((data.sleepHours / 24) * totalWeeks)
    const studyWeeks = Math.round(((data.studyEndAge - data.studyStartAge) * 52 * data.studyHoursPerWeek) / (24 * 7))
    const workWeeks = Math.round(((data.workEndAge - data.workStartAge) * 52 * data.workHoursPerWeek) / (24 * 7))
    const retirementWeeks = (data.lifeExpectancy - data.workEndAge) * 52
    const leisureWeeks = Math.round((data.leisureHoursPerWeek / (24 * 7)) * totalWeeks)
    const sportsWeeks = Math.round((data.sportsHoursPerWeek / (24 * 7)) * totalWeeks)
    const familyWeeks = Math.round((data.familyHoursPerWeek / (24 * 7)) * totalWeeks)
    const travelWeeks = data.travelWeeksPerYear * data.lifeExpectancy

    if (displayMode === "normal") {
      const grid: string[] = new Array(totalCells).fill("future")
      let currentIndex = 0

      for (let i = 0; i < sleepWeeks && currentIndex < totalCells; i++) {
        grid[currentIndex++] = "sleep"
      }
      for (let i = 0; i < studyWeeks && currentIndex < totalCells; i++) {
        grid[currentIndex++] = "study"
      }
      for (let i = 0; i < workWeeks && currentIndex < totalCells; i++) {
        grid[currentIndex++] = "work"
      }
      for (let i = 0; i < retirementWeeks && currentIndex < totalCells; i++) {
        grid[currentIndex++] = "retirement"
      }
      for (let i = 0; i < leisureWeeks && currentIndex < totalCells; i++) {
        grid[currentIndex++] = "leisure"
      }
      for (let i = 0; i < sportsWeeks && currentIndex < totalCells; i++) {
        grid[currentIndex++] = "sports"
      }
      for (let i = 0; i < familyWeeks && currentIndex < totalCells; i++) {
        grid[currentIndex++] = "family"
      }
      for (let i = 0; i < travelWeeks && currentIndex < totalCells; i++) {
        grid[currentIndex++] = "travel"
      }

      return grid
    } else if (displayMode === "life") {
      const grid: string[] = new Array(totalCells).fill("future")
      const livedWeeks = currentWeekPosition !== null ? currentWeekPosition : data.currentAge * 52
      for (let i = 0; i < livedWeeks && i < totalCells; i++) {
        grid[i] = "lived"
      }
      return grid
    }

    return new Array(totalCells).fill("future")
  }, [data, displayMode, currentWeekPosition])

  const hoveredBlockIndices = useMemo(() => {
    if (!hoveredCell || displayMode !== "normal") return new Set<number>()

    const indices = new Set<number>()
    const category = hoveredCell.category

    for (let i = 0; i < gridData.length; i++) {
      if (gridData[i] === category) {
        indices.add(i)
      }
    }

    return indices
  }, [hoveredCell, gridData, displayMode])

  const getCellColor = (category: string) => {
    const cat = CATEGORIES.find((c) => c.id === category)
    if (!cat) return "rgb(229, 231, 235)"
    return cat.color
  }

  const stats = useMemo(() => {
    const totalWeeks = data.lifeExpectancy * 52
    const livedWeeks = currentWeekPosition || data.currentAge * 52
    const sleepWeeks = Math.round((data.sleepHours / 24) * totalWeeks)
    const studyWeeks = Math.round(((data.studyEndAge - data.studyStartAge) * 52 * data.studyHoursPerWeek) / (24 * 7))
    const workWeeks = Math.round(((data.workEndAge - data.workStartAge) * 52 * data.workHoursPerWeek) / (24 * 7))
    const retirementWeeks = (data.lifeExpectancy - data.workEndAge) * 52
    const leisureWeeks = Math.round((data.leisureHoursPerWeek / (24 * 7)) * totalWeeks)
    const sportsWeeks = Math.round((data.sportsHoursPerWeek / (24 * 7)) * totalWeeks)
    const familyWeeks = Math.round((data.familyHoursPerWeek / (24 * 7)) * totalWeeks)
    const travelWeeks = data.travelWeeksPerYear * data.lifeExpectancy

    return {
      totalWeeks,
      livedWeeks,
      remainingWeeks: totalWeeks - livedWeeks,
      sleepWeeks,
      sleepYears: (sleepWeeks / 52).toFixed(1),
      studyWeeks,
      studyYears: (studyWeeks / 52).toFixed(1),
      workWeeks,
      workYears: (workWeeks / 52).toFixed(1),
      retirementWeeks,
      retirementYears: (retirementWeeks / 52).toFixed(1),
      leisureWeeks,
      leisureYears: (leisureWeeks / 52).toFixed(1),
      sportsWeeks,
      sportsYears: (sportsWeeks / 52).toFixed(1),
      familyWeeks,
      familyYears: (familyWeeks / 52).toFixed(1),
      travelWeeks,
      travelYears: (travelWeeks / 52).toFixed(1),
      livedPercentage: ((livedWeeks / totalWeeks) * 100).toFixed(1),
      sleepPercentage: ((sleepWeeks / totalWeeks) * 100).toFixed(1),
      workPercentage: ((workWeeks / totalWeeks) * 100).toFixed(1),
      leisurePercentage: ((leisureWeeks / totalWeeks) * 100).toFixed(1),
    }
  }, [data, currentWeekPosition])

  const insight = useMemo(() => {
    const categories = [
      { name: "sleep", weeks: stats.sleepWeeks, label: t.sleep },
      { name: "work", weeks: stats.workWeeks, label: t.work },
      { name: "family", weeks: stats.familyWeeks, label: t.family },
      { name: "travel", weeks: stats.travelWeeks, label: t.travel },
      { name: "leisure", weeks: stats.leisureWeeks, label: t.leisure },
      { name: "sports", weeks: stats.sportsWeeks, label: t.sports },
    ].sort((a, b) => b.weeks - a.weeks)

    // Find first comparison where category N > category N+1
    for (let i = 0; i < categories.length - 1; i++) {
      if (categories[i].weeks > categories[i + 1].weeks) {
        return {
          higher: categories[i].label,
          lower: categories[i + 1].label,
        }
      }
    }

    return {
      higher: categories[0].label,
      lower: categories[1].label,
    }
  }, [stats, t])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setScrollY(scrollPosition)

      if (scrollPosition > 100) {
        setShowScrollHint(false)
      }

      if (scrollPosition > 500 && !showInsight) {
        setShowInsight(true)
        setInsightPhase("stat")

        // Show moral after 3 seconds
        setTimeout(() => {
          setInsightPhase("moral")
        }, 3000)

        // Hide overlay after 6 seconds
        setTimeout(() => {
          setShowInsight(false)
        }, 6000)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [showInsight])

  const getCategoryStats = (category: string) => {
    const categoryMap: Record<string, { weeks: number; label: string }> = {
      lived: { weeks: stats.livedWeeks, label: t.lived },
      sleep: { weeks: stats.sleepWeeks, label: t.sleep },
      study: { weeks: stats.studyWeeks, label: t.study },
      work: { weeks: stats.workWeeks, label: t.work },
      retirement: { weeks: stats.retirementWeeks, label: t.retirement },
      leisure: { weeks: stats.leisureWeeks, label: t.leisure },
      sports: { weeks: stats.sportsWeeks, label: t.sports },
      family: { weeks: stats.familyWeeks, label: t.family },
      travel: { weeks: stats.travelWeeks, label: t.travel },
      future: { weeks: stats.remainingWeeks, label: t.future },
    }
    return categoryMap[category] || { weeks: 0, label: "Unknown" }
  }

  const handleMouseMove = (e: React.MouseEvent, index: number, category: string) => {
    if (!gridRef.current) return

    const gridRect = gridRef.current.getBoundingClientRect()
    const mouseX = e.clientX
    const mouseY = e.clientY

    setHoveredCell({ index, category })
    setTooltipPos({ x: mouseX, y: mouseY })
  }

  const brackets = useMemo(() => {
    if (displayMode !== "normal") return []

    const result: { category: string; startRow: number; endRow: number; color: string; side: "left" | "right" }[] = []
    let currentCategory = gridData[0]
    let startIndex = 0

    for (let i = 1; i <= gridData.length; i++) {
      if (i === gridData.length || gridData[i] !== currentCategory) {
        const startRow = Math.floor(startIndex / 52)
        const endRow = Math.floor((i - 1) / 52)
        if (currentCategory !== "future") {
          result.push({
            category: currentCategory,
            startRow,
            endRow,
            color: getCellColor(currentCategory),
            side: "left",
          })
        }
        if (i < gridData.length) {
          currentCategory = gridData[i]
          startIndex = i
        }
      }
    }

    for (let i = 1; i < result.length; i++) {
      const prev = result[i - 1]
      const curr = result[i]

      if (curr.startRow <= prev.endRow + 2) {
        curr.side = prev.side === "left" ? "right" : "left"
      }
    }

    return result
  }, [gridData, displayMode])

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 relative">
      {showScrollHint && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <div className="bg-gray-400/30 backdrop-blur-sm rounded-full p-3">
            <ChevronDown className="h-6 w-6 text-gray-600" />
          </div>
        </div>
      )}

      {showInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
          <div className="relative z-10 max-w-2xl mx-auto px-6 text-center space-y-8">
            {insightPhase === "stat" && (
              <div className="animate-in fade-in duration-1000">
                <p className="text-2xl md:text-4xl font-bold text-foreground leading-relaxed">
                  {t.insightStat.replace("{higher}", insight.higher).replace("{lower}", insight.lower)}
                </p>
              </div>
            )}
            {insightPhase === "moral" && (
              <div className="animate-in fade-in duration-1000 space-y-4">
                <p className="text-xl md:text-3xl font-semibold text-primary">{t.insightMoral1}</p>
                <p className="text-lg md:text-2xl text-muted-foreground italic">{t.insightMoral2}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-3 md:space-y-4">
        <Card className="border-2">
          <CardHeader className="p-3 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl md:text-3xl font-bold">
                  {t.lifeOf} {data.name}
                </CardTitle>
                <CardDescription className="text-xs md:text-base">
                  {stats.livedWeeks.toLocaleString()} {t.weeksLived} {stats.totalWeeks.toLocaleString()} (
                  {stats.livedPercentage}%)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onReset} className="gap-2 bg-transparent h-9 text-sm">
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.restart}</span>
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          <Card className="border-2 bg-gradient-to-br from-indigo-500/10 to-indigo-600/5">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <p className="text-xs font-medium text-muted-foreground">{t.lived}</p>
              </div>
              <p className="text-xl md:text-2xl font-bold text-indigo-600">{stats.livedPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.livedWeeks.toLocaleString()} {t.weeks}
              </p>
              <p className="text-xs text-muted-foreground">
                {(stats.livedWeeks / 52).toFixed(1)} {t.years}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-purple-500/10 to-purple-600/5">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-600" />
                <p className="text-xs font-medium text-muted-foreground">{t.sleep}</p>
              </div>
              <p className="text-xl md:text-2xl font-bold text-purple-600">{stats.sleepPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.sleepWeeks.toLocaleString()} {t.weeks}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.sleepYears} {t.years}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-orange-600" />
                <p className="text-xs font-medium text-muted-foreground">{t.work}</p>
              </div>
              <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.workPercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.workWeeks.toLocaleString()} {t.weeks}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.workYears} {t.years}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-sky-500/10 to-sky-600/5">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-sky-600" />
                <p className="text-xs font-medium text-muted-foreground">{t.leisure}</p>
              </div>
              <p className="text-xl md:text-2xl font-bold text-sky-600">{stats.leisurePercentage}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.leisureWeeks.toLocaleString()} {t.weeks}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.leisureYears} {t.years}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-3 md:gap-4">
          <Card className="border-2 overflow-hidden">
            <CardContent className="p-2 sm:p-3 md:p-4">
              <div className="overflow-x-auto">
                <div className="flex gap-2 sm:gap-4 w-fit mx-auto">
                  <div className="relative" style={{ width: "40px", minHeight: `${data.lifeExpectancy * 14}px` }}>
                    {brackets
                      .filter((b) => b.side === "left")
                      .map((bracket, idx) => {
                        const height = (bracket.endRow - bracket.startRow + 1) * 14
                        const top = bracket.startRow * 14
                        return (
                          <div
                            key={idx}
                            className="absolute left-0 flex items-center"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                            }}
                          >
                            <svg width="40" height={height} className="overflow-visible">
                              <path
                                d={`M 35 0 L 10 0 Q 5 0 5 5 L 5 ${height - 5} Q 5 ${height} 10 ${height} L 35 ${height}`}
                                fill="none"
                                stroke={bracket.color}
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                        )
                      })}
                  </div>

                  <div
                    ref={gridRef}
                    className="grid gap-[2px] w-fit relative"
                    style={{
                      gridTemplateColumns: `repeat(52, minmax(0, 1fr))`,
                    }}
                  >
                    {gridData.map((category, i) => {
                      const isHovered = hoveredCell?.index === i || hoveredBlockIndices.has(i)
                      const isCurrentWeek = currentWeekPosition === i

                      return (
                        <div
                          key={i}
                          className="w-2 h-2 sm:w-3 sm:h-3 cursor-pointer relative transition-all duration-500 ease-out"
                          style={{
                            backgroundColor: getCellColor(category),
                            borderRadius: "3px",
                            transform: isHovered ? "scale(1.1)" : "scale(1)",
                            boxShadow: isHovered
                              ? `0 0 20px ${getCellColor(category)}, 0 0 40px ${getCellColor(category)}40`
                              : "none",
                            zIndex: isHovered ? 10 : isCurrentWeek ? 5 : 1,
                          }}
                          onMouseMove={(e) => handleMouseMove(e, i, category)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {isCurrentWeek && (
                            <div className="absolute inset-0 border-2 border-white rounded-sm animate-pulse" />
                          )}
                        </div>
                      )
                    })}
                  </div>

                  <div className="relative" style={{ width: "40px", minHeight: `${data.lifeExpectancy * 14}px` }}>
                    {brackets
                      .filter((b) => b.side === "right")
                      .map((bracket, idx) => {
                        const height = (bracket.endRow - bracket.startRow + 1) * 14
                        const top = bracket.startRow * 14
                        return (
                          <div
                            key={idx}
                            className="absolute right-0 flex items-center"
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                            }}
                          >
                            <svg width="40" height={height} className="overflow-visible">
                              <path
                                d={`M 5 0 L 30 0 Q 35 0 35 5 L 35 ${height - 5} Q 35 ${height} 30 ${height} L 5 ${height}`}
                                fill="none"
                                stroke={bracket.color}
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 md:space-y-4">
            <Card className="border-2">
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="text-sm md:text-base">{t.displayMode}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 md:p-4 pt-0">
                <button
                  onClick={() => setDisplayMode("normal")}
                  className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${
                    displayMode === "normal" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-sm">{t.normalMode}</div>
                  <div className="text-xs text-muted-foreground">{t.normalModeDesc}</div>
                </button>
                <button
                  onClick={() => setDisplayMode("life")}
                  className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${
                    displayMode === "life" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-semibold text-sm">{t.livedTime}</div>
                  <div className="text-xs text-muted-foreground">{t.livedTimeDesc}</div>
                </button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="text-sm md:text-base">{t.legend}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-3 md:p-4 pt-0">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
                    <Label className="flex-1 text-xs md:text-sm">{t[cat.labelKey]}</Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setLanguage(language === "fr" ? "en" : "fr")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card hover:bg-accent transition-all shadow-lg border-2 border-border text-sm font-medium"
        >
          <Languages className="h-4 w-4" />
          {language === "fr" ? "EN" : "FR"}
        </button>
      </div>

      {hoveredCell && (
        <div
          className="fixed pointer-events-none z-50 transition-all duration-200"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 100}px`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="relative bg-popover text-popover-foreground px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-2xl border-2 border-border">
            <div className="font-bold text-xs md:text-sm mb-1">{getCategoryStats(hoveredCell.category).label}</div>
            <div className="text-xs text-muted-foreground mb-1">
              {getCategoryStats(hoveredCell.category).weeks.toLocaleString()} {t.totalWeeks}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.week} {(hoveredCell.index % 52) + 1}, {t.year} {Math.floor(hoveredCell.index / 52) + 1}
            </div>
            {currentWeekPosition === hoveredCell.index && (
              <div className="text-xs font-bold text-primary mt-2 animate-pulse">⭐ {t.youAreHere}</div>
            )}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-popover border-r-2 border-b-2 border-border rotate-45" />
          </div>
        </div>
      )}
    </div>
  )
}
