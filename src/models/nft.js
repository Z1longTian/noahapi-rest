import mongoose from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

/**
 * 
 */

const nft = mongoose.Schema(
    {
        creator: {
            type: String,
            required: true
        },
        owner: {
            type: String,
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        tokenid: {
            type: Number,
            default: 0
        },
        cid: {
            type: String,
            default: null
        },
        ipfsURI: {
            type: String,
            default: null
        },
        httpURL: {
            type: String,
            default: null
        },
        amount: {
            type: Number,
            default: 0
        },
        currentAmount: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
        },
        round: {
            type: Number,
            default: 0
        },
        start: {
            type: Number,
        },
        views: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            default: null
        },
        onSale: {
            type: Boolean,
            default: false
        },
        inGame: {
            type: Boolean,
            default: false
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isMinted: {
            type: Boolean,
            default: false
        },
        mintTime: {
            type: Number,
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }
)

// plugin for auto incrementing a field
const AutoIncrement = AutoIncrementFactory(mongoose)

nft.plugin(AutoIncrement, {inc_field: 'id'})

export default mongoose.model('NFT', nft)