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
        value: {
            type: String,
            default: '0'
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
        // battle info
        votes: [String],
        pool: {
            type: Number,
            default: 0
        },
        fight: {
            type: Number,
            default: 0
        },
        start: {
            type: Number,
        },
        // current trade info
        price: {
            type: String,
            default: '0'
        },
        tradeStart: {
            type: Number,
        },
        // nft status
        listed: {
            type: Boolean,
            default: false
        },
        battling: {
            type: Boolean,
            default: false
        },
        inLobby: {
            type: Boolean,
            default: false
        },
        verified: {
            type: Boolean,
            default: false
        },
        minted: {
            type: Boolean,
            default: false
        },
        active: {
            type: Boolean,
            default: true
        }
    }
)

// plugin for auto incrementing a field
const AutoIncrement = AutoIncrementFactory(mongoose)

nft.plugin(AutoIncrement, {inc_field: 'id'})

export default mongoose.model('NFT', nft)