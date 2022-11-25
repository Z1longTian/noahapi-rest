import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './db/index.js'
import { } from './contracts/events.js'
import { init } from './controllers/platform.js'
import { errHandler, apiProtect } from './middlewares/index.js'
import { routes } from './utils/importRoutes.js' // routes



dotenv.config()

// database connection
await connectDB()

// initialise app
const app = express()

// CORS - enable cross origin resources
app.use(cors())

// body parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// error handler and api protection
app.use(errHandler)
app.use(apiProtect) // should be uncommented in production

// register all routes
for (const route of routes){
    app.use(route.route, route.router)
}

await init()

export default app
