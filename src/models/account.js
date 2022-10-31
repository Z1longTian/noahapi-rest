import mongoose from 'mongoose'

const account = mongoose.Schema(
    {
        address: {
            type: String,
            required: true
        },
        nickname: {
            type: String,
            default: 'unnamed'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        likes: [Number], // [tokenids],
        bets: [Number],
        mails: [Object] // { mailid, content, date, read }
    },
    {
        timestamps: true
    }
)

export default mongoose.model('Account', account)