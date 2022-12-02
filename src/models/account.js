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
        likes: [Number], // [tokenids],
        socketid: String
     },
    {
        timestamps: true
    }
)

export default mongoose.model('Account', account)