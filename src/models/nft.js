import mongoose from 'mongoose'
import AutoIncrementFactory from 'mongoose-sequence'

/**
 * 
 */

const nft = mongoose.Schema(
    {
        // info
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
        views: {
            type: Number,
            default: 0
        },
        amount: {
            type: Number,
            default: 0
        },
        level: {
            type: Number,
            default: 1
        },
        // cid ipfs http
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
        // current bet info
        upVoters:{
            type: [String]
        },
        downVoters: {
            type: [String]
        },
        currentAmount: {
            type: Number,
            default: 0
        },
        
        round: {
            type: Number,
            default: 0
        },
        start: {
            type: Number,
        },
        // current trade info
        price: {
            type: Number,
            default: null
        },
        tradeStart: {
            type: Number,
        },
        // nft status
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