import mongoose from 'mongoose'

const account = mongoose.Schema(
    {
        address: {
            type: String,
            required: true
        },
        name: {
            type: String,
            default: 'unnamed'
        },
        active: {
            type: Boolean,
            default: true
        },
        join: { // join time
            type: Number,
        },
        likes: [Number], // [tokenids],
        
    }
)

export default mongoose.model('Account', account)