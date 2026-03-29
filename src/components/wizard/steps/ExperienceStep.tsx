'use client'

import { useWizard } from '@/lib/context/WizardContext'

const EXPERIENCE_LABELS: Record<number, string> = {
  1: 'Newcomer',
  2: 'Newcomer',
  3: 'Junior',
  4: 'Junior',
  5: 'Junior',
  6: 'Mid-Level',
  7: 'Mid-Level',
  8: 'Mid-Level',
  9: 'Senior',
  10: 'Senior',
  11: 'Senior',
  12: 'Expert',
  13: 'Expert',
  14: 'Expert',
  15: 'Veteran',
  16: 'Veteran',
  17: 'Veteran',
  18: 'Master',
  19: 'Master',
  20: 'Master',
  21: 'Legend',
  22: 'Legend',
  23: 'Legend',
  24: 'Legend',
  25: 'Legend'
}

export function ExperienceStep() {
  const { state, setExperienceDesigner, setExperienceFreelance } = useWizard()

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-xl font-bold text-zinc-900">Experience Levels</h3>
        <p className="text-sm text-zinc-500">How long have you been designing and freelancing?</p>
      </div>

      <div className="space-y-10">
        {/* Designer Experience */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
              Designer Experience
            </label>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-600">{state.experienceDesigner}</span>
              <span className="text-sm font-bold text-zinc-400">/ 25</span>
            </div>
          </div>

          <div className="relative pt-2">
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={state.experienceDesigner}
              onChange={(e) => setExperienceDesigner(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium text-zinc-400">Entry</span>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                {EXPERIENCE_LABELS[state.experienceDesigner]}
              </span>
              <span className="text-xs font-medium text-zinc-400">Expert</span>
            </div>
          </div>
        </div>

        {/* Freelance Experience */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-bold text-zinc-700 uppercase tracking-wider">
              Freelance Experience
            </label>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-blue-600">{state.experienceFreelance}</span>
              <span className="text-sm font-bold text-zinc-400">/ 25</span>
            </div>
          </div>

          <div className="relative pt-2">
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={state.experienceFreelance}
              onChange={(e) => setExperienceFreelance(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium text-zinc-400">Newcomer</span>
              <span className="text-sm font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                {EXPERIENCE_LABELS[state.experienceFreelance]}
              </span>
              <span className="text-xs font-medium text-zinc-400">Veteran</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mt-6">
        <p className="text-xs text-zinc-500 italic leading-relaxed">
          Designer Experience affects your base technical rate, while Freelance Experience adjusts your project management and overhead multiplier.
        </p>
      </div>
    </div>
  )
}
