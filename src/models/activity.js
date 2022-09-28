import mongoose from 'mongoose'

const activity = mongoose.Schema(
    {
        address: String,
        activity: String,
        from: String,
        to: String,
        nft: Number,
        price: String,
        round: Number,
        date: Number
    }
)

export default mongoose.model('Activity', activity)