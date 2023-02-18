import mongoose from 'mongoose'

const activity = mongoose.Schema(
    {
        address: String,
        activity: String,
        links: [Object],
        date: Number
    }
)

export default mongoose.model('Activity', activity)