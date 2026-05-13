'use client'

import { useState, useEffect } from 'react'

const MEASUREMENT_FIELDS = [
  'Weight (kg)', 'Body Fat %', 'Neck (cm)', 'Shoulders (cm)', 'Chest (cm)',
  'Waist (cm)', 'Hips (cm)', 'Left Arm (cm)', 'Right Arm (cm)', 'Left Thigh (cm)',
]

const PERFORMANCE_LIFTS = [
  { label: 'Bench Press 1RM', unit: 'kg' },
  { label: 'Deadlift 1RM', unit: 'kg' },
  { label: 'Squat 1RM', unit: 'kg' },
  { label: 'Running Pace (1km)', unit: 'min' },
]

const MAX_DIMENSION = 1920
const TARGET_BYTES = 3_500_000

async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('Failed to load image'))
    el.src = dataUrl
  })

  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  let quality = 0.85
  let blob: Blob | null = null
  for (let i = 0; i < 6; i++) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', quality)
    )
    if (!blob) break
    if (blob.size <= TARGET_BYTES) break
    quality -= 0.15
    if (quality < 0.3) break
  }
  if (!blob) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() })
}

type PerformanceLog = { exercise: string; value: number; unit: string; date: string }
type Measurement = { weightKg: number | null; bodyFatPct: number | null; measurementsJson: string | null; date: string }
type Photo = { id: string; url: string; angle: string | null; date: string; week: number | null }

export default function ProgressPage() {
  const [tab, setTab] = useState<'photos' | 'measurements' | 'performance'>('photos')
  const [photos, setPhotos] = useState<Photo[]>([])
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>([])

  // Measurement form state
  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({})
  const [measurementSaving, setMeasurementSaving] = useState(false)
  const [measurementMsg, setMeasurementMsg] = useState('')

  // Performance form state
  const [perfValues, setPerfValues] = useState<Record<string, string>>({})
  const [perfSaving, setPerfSaving] = useState(false)
  const [perfMsg, setPerfMsg] = useState('')

  // Photo upload state
  const [uploading, setUploading] = useState(false)
  const [photoMsg, setPhotoMsg] = useState('')

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(data => {
      if (data.photos) setPhotos(data.photos)
      if (data.measurements) setMeasurements(data.measurements)
      if (data.performanceLogs) setPerformanceLogs(data.performanceLogs)

      // Pre-fill performance with latest values
      if (data.performanceLogs?.length > 0) {
        const latest: Record<string, string> = {}
        for (const log of data.performanceLogs) {
          if (!latest[log.exercise]) latest[log.exercise] = String(log.value)
        }
        setPerfValues(latest)
      }
    }).catch(() => {})
  }, [])

  const getLatestForLift = (exercise: string) => {
    const log = performanceLogs.find(l => l.exercise === exercise)
    return log ? `${log.value}` : '—'
  }

  const saveMeasurements = async () => {
    setMeasurementSaving(true)
    setMeasurementMsg('')
    try {
      const extraMeasurements: Record<string, number> = {}
      for (const field of MEASUREMENT_FIELDS) {
        const val = measurementValues[field]
        if (val && !isNaN(parseFloat(val)) && field !== 'Weight (kg)' && field !== 'Body Fat %') {
          extraMeasurements[field] = parseFloat(val)
        }
      }

      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: measurementValues['Weight (kg)'] || null,
          bodyFatPct: measurementValues['Body Fat %'] || null,
          measurements: Object.keys(extraMeasurements).length > 0 ? extraMeasurements : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setMeasurementMsg('Measurements saved!')
        setMeasurementValues({})
      } else {
        setMeasurementMsg(data.error || 'Failed to save')
      }
    } catch {
      setMeasurementMsg('Network error. Please try again.')
    }
    setMeasurementSaving(false)
  }

  const savePerformance = async () => {
    setPerfSaving(true)
    setPerfMsg('')
    try {
      const logs = PERFORMANCE_LIFTS
        .filter(lift => perfValues[lift.label] && parseFloat(perfValues[lift.label]) > 0)
        .map(lift => ({
          exercise: lift.label,
          value: parseFloat(perfValues[lift.label]),
          unit: lift.unit,
        }))

      if (logs.length === 0) {
        setPerfMsg('Enter at least one value')
        setPerfSaving(false)
        return
      }

      const res = await fetch('/api/performance-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs }),
      })
      const data = await res.json()
      if (data.success) {
        setPerfMsg('Performance logged!')
      } else {
        setPerfMsg(data.error || 'Failed to save')
      }
    } catch {
      setPerfMsg('Network error. Please try again.')
    }
    setPerfSaving(false)
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setPhotoMsg('')
    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('file', compressed)
      const res = await fetch('/api/progress-photos', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setPhotoMsg('Photo uploaded!')
        if (data.photo) setPhotos(prev => [data.photo, ...prev])
      } else {
        setPhotoMsg(data.error || 'Upload failed')
      }
    } catch {
      setPhotoMsg('Network error. Please try again.')
    }
    setUploading(false)
  }

  return (
    <div className="py-16">
      <h1 className="heading-lg mb-8">Progress</h1>

      <div className="flex gap-4 mb-8 border-b border-white/[0.06]">
        {(['photos', 'measurements', 'performance'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-headline font-semibold uppercase tracking-wider transition-colors capitalize ${
              tab === t ? 'text-brand-bronze border-b-2 border-brand-bronze' : 'text-brand-cream/40 hover:text-brand-cream/60'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'photos' && (
        <div>
          {/* Upload */}
          <div className="border-2 border-dashed border-white/[0.06] rounded-2xl p-8 text-center mb-8 hover:border-brand-bronze/40 transition-colors cursor-pointer">
            <input type="file" accept="image/*" className="hidden" id="photoUpload" onChange={handlePhotoUpload} disabled={uploading} />
            <label htmlFor="photoUpload" className="cursor-pointer">
              <span className="text-3xl block mb-2">📷</span>
              <p className="text-sm text-brand-cream/50 font-body">
                {uploading ? 'Uploading...' : 'Tap to upload a progress photo'}
              </p>
              <p className="text-xs text-brand-cream/30 font-body mt-1">Front, back, or side — consistency is key</p>
            </label>
          </div>

          {photoMsg && (
            <div className={`mb-4 p-3 rounded-lg text-sm font-body ${photoMsg.includes('error') || photoMsg.includes('failed') ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'}`}>
              {photoMsg}
            </div>
          )}

          {/* Photo grid */}
          {photos.length > 0 ? (
            <>
              <h3 className="text-xs text-brand-cream/40 font-headline uppercase tracking-wider mb-3">Your Photos</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-[3/4] apple-card-static overflow-hidden relative">
                    <img src={photo.url} alt={photo.angle || 'Progress photo'} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 p-2">
                      <span className="text-[10px] text-brand-cream/70 font-body">
                        {photo.angle && `${photo.angle} · `}
                        {new Date(photo.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xs text-brand-cream/40 font-headline uppercase tracking-wider mb-3">No photos yet</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {['Front', 'Side', 'Back'].map((label) => (
                  <div key={label} className="aspect-[3/4] apple-card-static flex flex-col items-center justify-center">
                    <span className="text-2xl mb-2 opacity-20">◉</span>
                    <span className="text-[10px] text-brand-cream/30 font-body">{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'measurements' && (
        <div className="max-w-lg">
          <p className="text-sm text-brand-cream/50 font-body mb-6">Log your measurements to track visual changes over time.</p>

          {measurements.length > 0 && (
            <div className="mb-6 apple-card-static p-8">
              <p className="text-xs text-brand-cream/40 font-body mb-2">
                Last logged: {new Date(measurements[0].date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {measurements[0].weightKg && <p className="text-sm text-brand-cream/60 font-body">Weight: {measurements[0].weightKg} kg</p>}
              {measurements[0].bodyFatPct && <p className="text-sm text-brand-cream/60 font-body">Body Fat: {measurements[0].bodyFatPct}%</p>}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {MEASUREMENT_FIELDS.map((field) => (
                <div key={field}>
                  <label className="label-sm mb-1">{field}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="brand-input !py-2.5"
                    placeholder="—"
                    value={measurementValues[field] || ''}
                    onChange={(e) => setMeasurementValues(prev => ({ ...prev, [field]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            {measurementMsg && (
              <p className={`text-sm font-body ${measurementMsg.includes('error') || measurementMsg.includes('Failed') ? 'text-red-400' : 'text-green-400'}`}>
                {measurementMsg}
              </p>
            )}
            <button type="button" onClick={saveMeasurements} disabled={measurementSaving} className="btn-primary !text-sm">
              {measurementSaving ? 'Saving...' : 'Save Measurements'}
            </button>
          </div>
        </div>
      )}

      {tab === 'performance' && (
        <div className="max-w-lg">
          <p className="text-sm text-brand-cream/50 font-body mb-6">Track your key lifts and performance benchmarks.</p>
          <div className="space-y-4">
            {PERFORMANCE_LIFTS.map((lift) => (
              <div key={lift.label} className="apple-card-static p-6 flex items-center justify-between">
                <div>
                  <p className="font-body text-sm text-brand-cream">{lift.label}</p>
                  <p className="text-xs text-brand-cream/40 font-body">Last: {getLatestForLift(lift.label)}</p>
                </div>
                <input
                  type="number"
                  step="0.5"
                  className="brand-input !w-24 !py-2 text-center"
                  placeholder={lift.unit}
                  value={perfValues[lift.label] || ''}
                  onChange={(e) => setPerfValues(prev => ({ ...prev, [lift.label]: e.target.value }))}
                />
              </div>
            ))}
            {perfMsg && (
              <p className={`text-sm font-body ${perfMsg.includes('error') || perfMsg.includes('Failed') || perfMsg.includes('Enter') ? 'text-red-400' : 'text-green-400'}`}>
                {perfMsg}
              </p>
            )}
            <button type="button" onClick={savePerformance} disabled={perfSaving} className="btn-primary !text-sm">
              {perfSaving ? 'Saving...' : 'Save Performance'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
