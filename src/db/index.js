import mongoose from "mongoose"

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database successfully connected')
    } catch(err) {
        console.log(err)
        process.exit(1)
    }
}

export {
    connectDB
}