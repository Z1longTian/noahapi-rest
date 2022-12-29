import morgan from "morgan"
import { logger } from './winston.js'

const stream = {
    write: message => logger.http(message.substring(0,message.lastIndexOf('\n')))
}

const morganMiddleware = morgan(
    "[:remote-addr] :method :url :status :response-time ms - :res[content-length]",
    { stream }
)

export default morganMiddleware