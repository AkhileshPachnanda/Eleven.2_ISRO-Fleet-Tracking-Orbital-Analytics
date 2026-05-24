import dotenv from 'dotenv'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './middleware/logger.js'
import { corsMiddleware } from './middleware/cors.js'
import { rateLimiter } from './middleware/rateLimit.js'
import { errorHandler } from './middleware/errorHandler.js'
import healthRouter from './routes/health.js'
import tleRouter from './routes/tle.js'
import groqRouter from './routes/groq.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
const PORT = process.env.PORT || 3001

// Middleware — runs on every request in this order
app.use(logger)          // log the request
app.use(corsMiddleware)  // add CORS headers
app.use(rateLimiter)     // check rate limit
app.use(express.json())  // parse JSON request bodies

// Routes
app.use('/api/health', healthRouter)
app.use('/api/tle',    tleRouter)
app.use('/api/groq',   groqRouter)

// 404 handler — no route matched
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// Error handler — must be last
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   ISRO Mission Control Backend     ║
  ║   Status: NOMINAL                  ║
  ║   Port:   ${PORT}                     ║
  ╚════════════════════════════════════╝
  `)
})
