import express from 'express'
import Account from '../models/account.js'
import NFT from '../models/nft.js'
import Trade from '../models/trade.js'
import Game from '../models/game.js'
import { nftExist, addrVli, accExist, cidExist, inpVli } from "../middlewares/index.js"
import { success } from '../utils/response.js'
import { syncNFT } from '../controllers/nft.js'
import { ipfsURI, httpURL } from '../utils/index.js'

const route = 'nft'
const router = express.Router()

// middlewares 
const nftExisted = nftExist('tokenid') // nft existance check
const accountExist = accExist('address') // account existance check
const addressVli = addrVli('address') // address validator
// input vlidator of name & description
const fieldVli = (length) => {
    return (input) => {
        return input && input !== '' && input.length <= length
    }
}
const nameVli = inpVli('name', fieldVli(20)) // name validator
const descVli = inpVli('description', fieldVli(200)) // desc validator
//////////////////////////////////////////////////////////////
//                     GETs
//////////////////////////////////////////////////////////////

/**
 * 
*/
router.get('/:tokenid', nftExisted, async (req, res) => {
    const tokenid = req.tokenid
    
    await syncNFT(tokenid) // sync nft data between chain and database

    const nft = (await NFT.aggregate(
        [
            { $match: { tokenid: Number(tokenid)} },
            { $lookup: {
                from: Account.collection.name,
                localField: 'owner',
                foreignField: 'address',
                as: 'ownerInfo'
            }},
            {
                $lookup: {
                    from: Account.collection.name,
                    localField: 'tokenid',
                    foreignField: 'likes',
                    as: 'likedBy'
                }
            }
        ]
    ))[0]

    nft.trades = (await Trade.aggregate(
        [
            { 
                $match: {
                    tokenid: Number(tokenid), 
                    finished: true, 
                    cancelled: false
                }
            },
            {
                $lookup: {
                    from: Account.collection.name,
                    localField: 'seller',
                    foreignField: 'address',
                    as: 'sellerInfo'
                }
            },
            {
                $lookup: {
                    from: Account.collection.name,
                    localField: 'buyer',
                    foreignField: 'address',
                    as: 'buyerInfo'
                }
            }
        ]
    ))
    nft.games = await Game.find({ tokenid, finished: true })
    nft.currentGame = await Game.findOne({ tokenid, finished: false })
    success(res, 'ok', nft)
})

//////////////////////////////////////////////////////////////
//                      POSTs
//////////////////////////////////////////////////////////////

/**
 * create a nft
 *      - address
 *      - name
 *      - description
 *      - cid
*/
router.post('/create', addressVli, accountExist, nameVli, descVli, cidExist, async (req, res) => {
    const address = req.address
    const { name, description, cid } = req.body

    await NFT.create({
        creator: address,
        owner: address,
        name,
        description,
        cid,
        ipfsURI: ipfsURI(cid),
        httpURL: httpURL(cid)
    })
    success(res, 'ok', {})
})

/**
 * 
*/
router.post('/search', async (req, res) => {
    let {page, page_size, type, sort, key} = req.body
    page = parseInt(page)
    page_size = parseInt(page_size)
    const start = (page - 1) * page_size // start index
    const end = start + page_size // end index
    const typeFilter = {
        '0': {isMinted: true}, '1': {onSale: true}, '2': {inGame: true}
    }
    const keyFilter = () => {
        const reg = new RegExp(key)
        // search fields
        const fields = ['name', 'description', 'owner', 'creator']
        return { $or: fields.map(field => {
            const query = {}
            query[field] = reg
            return query
        })}
    }
    const sortFilter = () => {
        if(sort == 0) return { mintTime: 1}
        
        if(sort == 1) return { mintTime: -1}
        
        if(sort == 2) return { price: 1 }

        if(sort == 3) return { price: -1 }

        return {}
    }

    const filter = {
        ...typeFilter[type],
        ...keyFilter()
    }

    const nfts = await NFT.find(filter).sort(sortFilter()).skip(start).limit(end)
    // for pagination
    success(res, 'ok', nfts)
})

//////////////////////////////////////////////////////////////
//                      PUTs
//////////////////////////////////////////////////////////////

/**
* update name of nft
*/
router.put('/updname', nftExisted, nameVli, async (req, res) => {
    const tokenid = req.tokenid
    const name = req.body.name
    await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { name }}
    )
    success(res, 'ok', {})
})

/**
* update description of nft
*/
router.put('/upddesc', nftExisted, descVli, async (req, res) => {
    const tokenid = req.tokenid
    const description = req.body.description
    await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { description }}
    )
    success(res, 'ok', {})
})


export default {
    route,
    router
}