import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        clientCoach: {
          include: { coach: { select: { id: true, name: true } } },
        },
        onboarding: true,
        checkIns: { orderBy: { date: 'desc' }, take: 14 },
        workoutPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        nutritionPlans: { orderBy: { createdAt: 'desc' }, take: 1 },
        measurements: { orderBy: { date: 'desc' }, take: 5 },
        progressPhotos: { orderBy: { date: 'desc' }, take: 6 },
        performanceLogs: { orderBy: { date: 'desc' }, take: 10 },
      },
    })

    if (!client || client.role !== 'client') {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Calculate stats
    const last7 = client.checkIns.slice(0, 7)
    const trainedDays = last7.filter((ci) => ci.trained).length
    const avgMood = last7.filter((ci) => ci.mood).length > 0
      ? +(last7.reduce((a, ci) => a + (ci.mood || 0), 0) / last7.filter((ci) => ci.mood).length).toFixed(1)
      : null
    const avgEnergy = last7.filter((ci) => ci.energy).length > 0
      ? +(last7.reduce((a, ci) => a + (ci.energy || 0), 0) / last7.filter((ci) => ci.energy).length).toFixed(1)
      : null
    const avgSleep = last7.filter((ci) => ci.sleepHours).length > 0
      ? +(last7.reduce((a, ci) => a + (ci.sleepHours || 0), 0) / last7.filter((ci) => ci.sleepHours).length).toFixed(1)
      : null
    const nutritionCompliance = last7.filter((ci) => ci.nutritionCompliance === 'full').length
    const streakDays = (() => {
      let streak = 0
      for (const ci of client.checkIns) {
        const dayDiff = Math.floor((Date.now() - new Date(ci.date).getTime()) / (1000 * 60 * 60 * 24))
        if (dayDiff === streak) streak++
        else break
      }
      return streak
    })()

    // Mood trend (last 7 days)
    const moodTrend = last7.map((ci) => ({
      date: ci.date,
      mood: ci.mood,
      energy: ci.energy,
      trained: ci.trained,
      nutrition: ci.nutritionCompliance,
      sleep: ci.sleepHours,
      sleepQuality: ci.sleepQuality,
      weightKg: ci.weightKg,
      steps: ci.steps,
      stressLevel: ci.stressLevel,
      workoutName: ci.workoutName,
      workoutPerformance: ci.workoutPerformance,
    })).reverse()

    // Red flags
    const redFlags: string[] = []
    if (avgMood !== null && avgMood < 5) redFlags.push('Low average mood this week')
    if (avgSleep !== null && avgSleep < 6) redFlags.push('Insufficient sleep average')
    if (trainedDays < 3 && last7.length >= 5) redFlags.push('Low training frequency')
    if (nutritionCompliance < 3 && last7.length >= 5) redFlags.push('Poor nutrition compliance')
    const lastCI = client.checkIns[0]
    if (lastCI) {
      const daysSince = Math.floor((Date.now() - new Date(lastCI.date).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSince >= 3) redFlags.push(`No check-in for ${daysSince} days`)
    }
    // Stress check
    const stressEntries = last7.filter((ci) => ci.stressLevel != null)
    if (stressEntries.length > 0) {
      const avgStress = +(stressEntries.reduce((a, ci) => a + (ci.stressLevel || 0), 0) / stressEntries.length).toFixed(1)
      if (avgStress >= 7) redFlags.push(`High average stress (${avgStress}/10)`)
    }
    // Off-plan meals check
    const offPlanCount = last7.filter((ci) => ci.offPlanMeals && ci.offPlanMeals.length > 0).length
    if (offPlanCount >= 3) redFlags.push(`Off-plan meals logged ${offPlanCount} times this week`)

    // Wins
    const wins: string[] = []
    if (streakDays >= 7) wins.push(`${streakDays}-day check-in streak`)
    if (trainedDays >= 4) wins.push('Strong training consistency this week')
    if (avgMood !== null && avgMood >= 8) wins.push('High mood and motivation')
    if (nutritionCompliance >= 5) wins.push('Excellent nutrition compliance')
    // Steps win
    const stepEntries = last7.filter((ci) => ci.steps != null)
    if (stepEntries.length > 0) {
      const avgSteps = Math.round(stepEntries.reduce((a, ci) => a + (ci.steps || 0), 0) / stepEntries.length)
      if (avgSteps >= 10000) wins.push(`Averaging ${avgSteps.toLocaleString()} steps/day`)
    }
    // Low stress win
    if (stressEntries.length > 0) {
      const avgStress = +(stressEntries.reduce((a, ci) => a + (ci.stressLevel || 0), 0) / stressEntries.length).toFixed(1)
      if (avgStress <= 3) wins.push('Low stress levels this week')
    }

    return NextResponse.json({
      id: client.id,
      name: client.name,
      email: client.email,
      country: client.country,
      createdAt: client.createdAt,
      coach: client.clientCoach[0]?.coach || null,
      tier: client.clientCoach[0]?.tier || 'unassigned',
      onboarding: client.onboarding,
      stats: {
        trainedDays,
        totalCheckIns: last7.length,
        avgMood,
        avgEnergy,
        avgSleep,
        nutritionCompliance,
        streakDays,
      },
      moodTrend,
      redFlags,
      wins,
      recentCheckIns: client.checkIns,
      currentWorkout: client.workoutPlans[0] || null,
      currentNutrition: client.nutritionPlans[0] || null,
      measurements: client.measurements,
      photos: client.progressPhotos,
      performanceLogs: client.performanceLogs,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
