import server from './src/server.js'
import { logger } from './src/loggers/winston.js'

const PORT = process.env.PORT || 3000

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`)
    logger.info(`Server running on port: ${PORT}`)
})
