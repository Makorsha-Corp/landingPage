export const DEFAULT_RAINBOW_COLOR_PRESET = 'brand'

/** @type {Array<{ id: string, label: string, colors: Record<1|2|3|4|5, string>, shineColors: string[] }>} */
export const RAINBOW_COLOR_PRESET_LIST = [
  {
    id: 'brand',
    label: 'Brand',
    colors: {
      1: '#9568B8',
      2: '#A07CFE',
      3: '#C4A8E8',
      4: '#9B87C4',
      5: '#B794F6',
    },
    shineColors: ['#9568B8', '#A07CFE', '#C4A8E8'],
  },
  {
    id: 'magicui',
    label: 'MagicUI',
    colors: {
      1: 'oklch(66.2% 0.225 25.9)',
      2: 'oklch(60.4% 0.26 302)',
      3: 'oklch(69.6% 0.165 251)',
      4: 'oklch(80.2% 0.134 225)',
      5: 'oklch(90.7% 0.231 133)',
    },
    shineColors: ['#ff6b6b', '#a07cfe', '#4ecdc4'],
  },
  {
    id: 'warm',
    label: 'Warm',
    colors: {
      1: '#ff6b35',
      2: '#f7931e',
      3: '#ffd23f',
      4: '#ff8c42',
      5: '#e85d04',
    },
    shineColors: ['#ff6b35', '#f7931e', '#ffd23f'],
  },
  {
    id: 'cool',
    label: 'Cool',
    colors: {
      1: '#3b82f6',
      2: '#06b6d4',
      3: '#8b5cf6',
      4: '#0ea5e9',
      5: '#6366f1',
    },
    shineColors: ['#3b82f6', '#06b6d4', '#8b5cf6'],
  },
  {
    id: 'pastel',
    label: 'Pastel',
    colors: {
      1: 'oklch(78% 0.12 25)',
      2: 'oklch(75% 0.1 302)',
      3: 'oklch(80% 0.08 251)',
      4: 'oklch(85% 0.07 225)',
      5: 'oklch(88% 0.1 133)',
    },
    shineColors: ['#f9a8d4', '#c4b5fd', '#a5f3fc'],
  },
]

const presetById = Object.fromEntries(RAINBOW_COLOR_PRESET_LIST.map((preset) => [preset.id, preset]))

export function getRainbowColorPreset(id) {
  return presetById[id] ?? presetById[DEFAULT_RAINBOW_COLOR_PRESET]
}

export function getWaitlistShineColors(id = DEFAULT_RAINBOW_COLOR_PRESET) {
  return getRainbowColorPreset(id).shineColors
}

export function clearRainbowColorPresetOverrides() {
  for (let i = 1; i <= 5; i += 1) {
    document.documentElement.style.removeProperty(`--color-${i}`)
  }
}

export function applyRainbowColorPreset(id = DEFAULT_RAINBOW_COLOR_PRESET) {
  if (id === 'magicui') {
    clearRainbowColorPresetOverrides()
    return
  }

  const preset = getRainbowColorPreset(id)
  for (let i = 1; i <= 5; i += 1) {
    document.documentElement.style.setProperty(`--color-${i}`, preset.colors[i])
  }
}
