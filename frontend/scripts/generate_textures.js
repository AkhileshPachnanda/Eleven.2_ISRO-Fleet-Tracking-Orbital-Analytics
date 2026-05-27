/**
 * generate_textures.js — Downsample 8K/4K textures to 2K for the landing page.
 * Run: node scripts/generate_textures.js
 */
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const TASKS = [
  {
    src: path.join(root, 'src/assets/8k_earth_daymap.jpg'),
    dst: path.join(root, 'public/assets/textures/earth_daymap_2k.jpg'),
    width: 2048,
    quality: 80,
  },
  {
    src: path.join(root, 'src/assets/8k_earth_clouds.jpg'),
    dst: path.join(root, 'public/assets/textures/earth_clouds_2k.jpg'),
    width: 2048,
    quality: 75,
  },
  {
    src: path.join(root, 'src/assets/8081_earthbump4k.jpg'),
    dst: path.join(root, 'public/assets/textures/earth_bump_2k.jpg'),
    width: 2048,
    quality: 75,
  },
]

async function main() {
  for (const task of TASKS) {
    const basename = path.basename(task.dst)
    process.stdout.write(`  Generating ${basename}...`)

    const info = await sharp(task.src)
      .resize(task.width, task.width / 2, { fit: 'fill' }) // equirectangular = 2:1 aspect
      .jpeg({ quality: task.quality, mozjpeg: true })
      .toFile(task.dst)

    const sizeKB = (info.size / 1024).toFixed(0)
    console.log(` done (${sizeKB} KB)`)
  }

  console.log('\n✓ All 2K textures generated in public/assets/textures/')
}

main().catch(err => {
  console.error('Failed:', err)
  process.exit(1)
})
