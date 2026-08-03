import { WaitlistCopyHeader, WaitlistTrustList } from './WaitlistCopy'
import { ShineBorder } from '@/components/ui/shine-border'
import { getWaitlistShineColors } from '../../lib/rainbowColorPresets'

export default function PurpleSplitLayout({ isSuccess, renderForm, renderSuccess, shineColors }) {
  const resolvedShineColors = shineColors ?? getWaitlistShineColors()

  return (
    <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-border/70 md:grid md:grid-cols-[1.05fr_1fr]">
      <ShineBorder
        borderWidth={2}
        duration={12}
        shineColor={resolvedShineColors}
      />
      <div className="bg-primary px-6 py-8 sm:px-8 sm:py-10">
        <WaitlistCopyHeader
          eyebrowClassName="text-white/70"
          titleClassName="text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl"
          leadClassName="text-pretty text-base leading-relaxed text-white/85 sm:text-lg"
        />
        {!isSuccess ? (
          <div className="mt-6">
            <WaitlistTrustList inverted />
          </div>
        ) : null}
      </div>

      <div className="flex flex-col justify-center bg-card px-6 py-8 sm:px-8 sm:py-10">
        {isSuccess ? renderSuccess() : renderForm()}
      </div>
    </div>
  )
}
