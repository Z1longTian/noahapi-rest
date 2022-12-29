import mongoose from "mongoose"
import { logger } from "../loggers/winston.js"

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        logger.info('Database successfully connected')
    } catch(err) {
        logger.error(err)
        process.exit(1)
    }
}

export {
    connectDB
}