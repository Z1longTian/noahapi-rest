import mongoose from 'mongoose'

const mail = mongoose.Schema(
    {
        address: String,
        content: String,
        date: Number,
        read: {
            type: Boolean,
            default: false
        }
    }
)

export default mongoose.model('Mail', mail)