import Button from '../components/ui/Button'

export const DEFAULT_HERO_CAMERA = {
  fx: 0.5,
  fy: 0.49,
  scale: 0.84,
}

const PAN_STEP = 0.02
const SCALE_STEP = 0.02
const FX_MIN = 0.2
const FX_MAX = 0.8
const FY_MIN = 0.2
const FY_MAX = 0.8
const SCALE_MIN = 0.4
const SCALE_MAX = 1

const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-white/60'
const dpadBtnCls =
  'flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-black/30 text-sm font-medium text-white transition-colors hover:bg-white/10'

export function normalizeHeroCamera(camera) {
  return {
    fx: clamp(camera?.fx ?? DEFAULT_HERO_CAMERA.fx, FX_MIN, FX_MAX),
    fy: clamp(camera?.fy ?? DEFAULT_HERO_CAMERA.fy, FY_MIN, FY_MAX),
    scale: clamp(camera?.scale ?? DEFAULT_HERO_CAMERA.scale, SCALE_MIN, SCALE_MAX),
  }
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

function round3(n) {
  return Math.round(n * 1000) / 1000
}

export default function Homepage2HeroCameraControls({ camera, onChange, onReset }) {
  const safe = normalizeHeroCamera(camera)

  const nudge = (dFx, dFy) => {
    onChange({
      ...safe,
      fx: round3(clamp(safe.fx + dFx, FX_MIN, FX_MAX)),
      fy: round3(clamp(safe.fy + dFy, FY_MIN, FY_MAX)),
    })
  }

  const nudgeScale = (delta) => {
    onChange({
      ...safe,
      scale: round3(clamp(safe.scale + delta, SCALE_MIN, SCALE_MAX)),
    })
  }

  return (
    <div className="w-56 space-y-3 rounded-2xl border border-white/20 bg-black/50 p-4 shadow-2xl backdrop-blur-md ring-2 ring-primary/50">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/80">
          Factory pan
        </p>
        <p className="mt-1 text-[11px] leading-snug text-white/55">
          Move the factory on the hero screen. Story stops keep their normal framing.
        </p>
      </div>

      <div>
        <span className={labelCls}>Position</span>
        <div className="inline-grid grid-cols-3 gap-1">
          <div className="h-9 w-9" />
          <button type="button" className={dpadBtnCls} onClick={() => nudge(0, PAN_STEP)} aria-label="Move factory up">
            ↑
          </button>
          <div className="h-9 w-9" />
          <button type="button" className={dpadBtnCls} onClick={() => nudge(PAN_STEP, 0)} aria-label="Move factory left">
            ←
          </button>
          <div className="flex h-9 w-9 flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-black/20 text-[9px] leading-tight text-white/70">
            <span>{safe.fx.toFixed(2)}</span>
            <span>{safe.fy.toFixed(2)}</span>
          </div>
          <button type="button" className={dpadBtnCls} onClick={() => nudge(-PAN_STEP, 0)} aria-label="Move factory right">
            →
          </button>
          <div className="h-9 w-9" />
          <button type="button" className={dpadBtnCls} onClick={() => nudge(0, -PAN_STEP)} aria-label="Move factory down">
            ↓
          </button>
          <div className="h-9 w-9" />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="hero-camera-scale">
          Size ({safe.scale.toFixed(2)})
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`${dpadBtnCls} shrink-0`}
            onClick={() => nudgeScale(-SCALE_STEP)}
            aria-label="Zoom out factory"
          >
            −
          </button>
          <input
            id="hero-camera-scale"
            type="range"
            min={SCALE_MIN}
            max={SCALE_MAX}
            step={SCALE_STEP}
            value={safe.scale}
            onChange={(e) => onChange({ ...safe, scale: Number(e.target.value) })}
            className="w-full accent-primary"
          />
          <button
            type="button"
            className={`${dpadBtnCls} shrink-0`}
            onClick={() => nudgeScale(SCALE_STEP)}
            aria-label="Zoom in factory"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onReset} variant="outline" size="xs" className="border-white/30 text-white hover:bg-white/10">
          Reset
        </Button>
      </div>
    </div>
  )
}
