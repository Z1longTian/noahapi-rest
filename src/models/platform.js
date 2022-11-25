import mongoose from 'mongoose'

const platform = mongoose.Schema(
    {
        annoucement: {
            type: String,
            default: ''
        },
        indexNFT: Number,
        constants: Object
    }
)

export default mongoose.model('Platform', platform)