import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.resolve(__dirname, '../public')

const WIDTHS = [828, 1400, 2048]

const SOURCES = [
  { file: 'building-full.png', quality: 88, smartSubsample: false },
  { file: 'building-95-blurred.png', quality: 75 },
  { file: 'homepage-background.png', quality: 88 },
  { file: 'homepage-background-dark.png', quality: 88 },
  { file: 'homepage-background-blur.png', quality: 75 },
  { file: 'homepage-background-blur-dark.png', quality: 75 },
]

async function encodeOne(sourcePath, stem, { quality, smartSubsample = true }) {
  const webpOpts = { quality, smartSubsample }
  const image = sharp(sourcePath)
  const metadata = await image.metadata()
  const fullOut = path.join(publicDir, `${stem}.webp`)

  await image.clone().webp(webpOpts).toFile(fullOut)
  const fullStat = await stat(fullOut)
  console.log(`  ${stem}.webp (${metadata.width}x${metadata.height}) → ${formatKb(fullStat.size)}`)

  for (const width of WIDTHS) {
    if (metadata.width && metadata.width <= width) continue
    const outPath = path.join(publicDir, `${stem}-${width}.webp`)
    await image
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp(webpOpts)
      .toFile(outPath)
    const outStat = await stat(outPath)
    console.log(`  ${stem}-${width}.webp → ${formatKb(outStat.size)}`)
  }
}

function formatKb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`
}

async function main() {
  await mkdir(publicDir, { recursive: true })

  for (const source of SOURCES) {
    const { file } = source
    const sourcePath = path.join(publicDir, file)
    try {
      await stat(sourcePath)
    } catch {
      console.warn(`Skip missing source: ${file}`)
      continue
    }

    const stem = file.replace(/\.png$/i, '')
    console.log(`Encoding ${file}…`)
    await encodeOne(sourcePath, stem, source)
  }

  console.log('Done.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
