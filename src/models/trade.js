import mongoose from "mongoose"

/**
 * 
 */

const trade = mongoose.Schema(
    {
        tokenid: {
            type: Number,
            required: true
        },
        seller: {
            type: String,
            required: true
        },
        buyer: {
            type: String,
            default:  null
        },
        price: {
            type: Number,
            required: true
        },
        finished: {
            type: Boolean,
            default: false
        },
        cancelled: {
            type: Boolean,
            default: false
        },
        start: {
            type: Number,
            default: null
        },
        end: {
            type: Number,
            default: null
        }
    }
)

export default mongoose.model('Trade', trade)