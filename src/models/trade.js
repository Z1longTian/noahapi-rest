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
            required: true
        },
        price: {
            type: Number,
            required: true
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