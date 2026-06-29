import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import { clerkMiddleware } from '@clerk/express'
import clerkWebhooks from './controller/clerkWebhooks.js'

await connectDB();

const app = express()
app.use(cors())


// Middleware
app.use(express.json())
app.use(clerkMiddleware())

// API to listen clerk webhook
app.use('/api/clerk', clerkWebhooks)

app.get('/', (req, res) => res.send('API WORKING'));

const POPT = process.env.POPT || 3000
app.listen(POPT, () => console.log(`Server is Runing on PORT:${POPT}`))