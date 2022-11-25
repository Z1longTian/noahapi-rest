import mongoose from 'mongoose'

/**
 * 
*/

const battle = mongoose.Schema(
    {
        tokenids: [Number],
        votes: Object,
        start: Number,
        end: Number,
        result: {
            type: Number,
            default: 0,
        },
        finished: {
            type: Boolean,
            default: false
        }
    }
)

export default mongoose.model('Battle', battle)