import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

const app = express();

app.use(express.json({limit: '30mb'}))
app.use(express.urlencoded({ limit: '30mb', extended: true }))
app.use(cors({
    origin: [
        process.env.ALLOWED_ORGIN_DEV!,
        process.env.ALLOWED_ORGIN_PROD!
    ]
}))
app.use(helmet())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(morgan('combined', {stream: logStream}))


const PORT = Number(process.env.PORT) || 3400
app.listen(PORT, '0.0.0.0', () => console.log('\x1b[32m',`\n[APP] server is running on port: ${PORT}.`))