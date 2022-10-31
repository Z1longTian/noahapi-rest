import mongoose from "mongoose"

/**
 * 
 */

const game = mongoose.Schema(
    {
        tokenid: {
            type: Number,
            required: true
        },
        start: {
            type: Number,
            required: true
        },
        typa: {
            type: Number,
            default: 0
        },
        upVoters: {
            type: [String]
        },
        downVoters: {
            type: [String]
        },
        round: {
            type: Number,
            default: 0
        }
    }
)

export default mongoose.model('Game', game)