import * as winston from 'winston'
import 'winston-daily-rotate-file'
import path from 'path'

const levels = {
    error: 0,
    info: 1,
    user: 2,
    admin: 3,
    http: 4,
}

const transport = new winston.transports.DailyRotateFile({
    level: 'http',
    dirname: `${path.resolve()}/src/logs`,
    filename: '%DATE%.log',
})

const errorTransport = new winston.transports.File({
    level: 'error',
    dirname: `${path.resolve()}/src/logs`,
    filename: 'errors.log'
})

const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
    winston.format.printf(
        info => `${info.timestamp} ${info.level} ${info.message}`
    )
)

const logger = winston.createLogger({
    levels,
    format,
    transports: [
        transport,
        errorTransport,
    ]
})

export {
    logger
}