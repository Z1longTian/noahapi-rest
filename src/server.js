import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { connectDB } from './db/index.js'
import { } from './contracts/events.js'
import { init } from './controllers/platform.js'
import { errHandler, apiProtect } from './middlewares/index.js'
import { routes } from './utils/importRoutes.js' // routes
import { initIO } from './socket.js'
import { logger } from './loggers/winston.js'
import morganMiddleware from './loggers/morgan.js'

dotenv.config()

// database connection
await connectDB()

// initialise app
const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: '*'
    }
})

global.io = io 
// CORS - enable cross origin resources
app.use(cors())

// register logger
app.use(morganMiddleware)
app.logger = logger

// body parser
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// error handler and api protection
app.use(errHandler)
// app.use(apiProtect) // should be uncommented in production

// register all routes
for (const route of routes){
    app.use(route.route, route.router)
}

await init()
await initIO(io)

export default server
