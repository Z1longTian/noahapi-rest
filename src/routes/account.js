import express from "express"
import { success } from "../utils/response.js"
import { inpVli, addrVli, accExist, nftExist } from '../middlewares/index.js'
import { getSysBalance } from "../contracts/ethers.js"
import Account from "../models/account.js"
import NFT from "../models/nft.js"
import Activity from "../models/activity.js"

const route = 'account'
const router = express.Router()

// middlewares
const accountExist = accExist('address') // account existance check
const addressVli = addrVli('address') // address validation
const nftExisted = nftExist('tokenid') // nft existance check
// nickname validation function
const nnameVli = (length) => {
    return (input) => {
        return input && input !== '' && input.length <= length
    }
}
const nicknameVli = inpVli('nickname', nnameVli(20)) // nickname vlidation

//////////////////////////////////////////////////////////////
//                     GETs
//////////////////////////////////////////////////////////////

/**
 * get details of an account
 */
router.get('/:address', addressVli, accountExist, async (req, res) => {
    const address = req.address
    const account = (await Account.aggregate(
        [
            { $match: { address } },
            { $lookup: {
                from: NFT.collection.name,
                localField: 'likes',
                foreignField: 'tokenid',
                as: 'likes'
            }},
            { $lookup: {
                from: NFT.collection.name,
                localField: 'evaluatings',
                foreignField: 'tokenid',
                as: 'evaluatings'
            }},
        ]
    ))[0]
    const activities = await Activity.aggregate(
        [
            { $match: {address} },
            { $lookup: {
                from: Account.collection.name,
                localField: 'from',
                foreignField: 'address',
                as: 'from'
            }},
            { $lookup: {
                from: Account.collection.name,
                localField: 'to',
                foreignField: 'address',
                as: 'to'
            }},
            { $lookup: {
                from: NFT.collection.name,
                localField: 'nft',
                foreignField: 'tokenid',
                as: 'nft'
            }}
        ]
    ).sort({date: -1})
    activities.forEach(activity => {
        if(activity.from.length === 0) activity.from = null
        if(activity.to.length === 0) activity.to = null
        activity.nft = activity.nft[0]
    })
    account.activities = activities
    const nfts = await NFT.find({owner: address})
    account.nfts = {
        mynfts: nfts.filter((nft) => nft.isMinted),
        created: await NFT.find({creator: address, isMinted: true}),
        listed: nfts.filter((nft) => nft.onSale),
        pending: nfts.filter((nft) => !nft.isVerified || !nft.isMinted),
    }
    success(res, 'OK', account)
})

/**
 * get system balance of the address
 */
router.get('/:address/balance', addressVli, async (req, res) => {
    success(res, 'ok', await getSysBalance(req.address))
})

//////////////////////////////////////////////////////////////
//                      POSTs
//////////////////////////////////////////////////////////////

/**
 * connect user
 */
router.post('/connect', addressVli, async (req, res) => {
    const address = req.address
    // if account not found
    if(!await Account.exists({ address })){
        // create a new account
        await Account.create({
            address: address
        })
    }

    success(res, 'ok', {})
})

/**
 *  like an nft
 */
router.post('/like', addressVli, accountExist, nftExisted, async (req, res) => {
    const address = req.address
    const tokenid = req.tokenid
    // didn't add check of existance of tokenid in likes
    // since addToSet won't do anything if tokenid already exists
    await Account.findOneAndUpdate(
        { address },
        { $addToSet: { likes: tokenid } }
    )
    success(res, 'ok', {})
})

/**
 * unlike an nft
 */
router.post('/unlike', addressVli, accountExist, nftExisted, async (req, res) => {
    const address = req.address
    const tokenid = req.tokenid
    // didn't add check of existance of tokenid in likes
    // since pull won't do anything if tokenid is not in likes
    await Account.findOneAndUpdate(
        { address },
        { $pull: { likes: tokenid } }
    )
    success(res, 'ok', {})
})

/**
 * mark a mail as read for a user
 */
router.post('/markread', addressVli, accountExist, async (req, res) => {
    const address = req.address
    const mailid = req.body.mailid
    await Account.findOneAndUpdate(
        { address },
        { $set: { 'mails.$[element].read': true }},
        { arrayFilters:[ {'element.id': mailid}]}
    )
    success(res, 'ok', {})
})

/**
 * mark all unread mails as read for a user
 */
router.post('/markallread', addressVli, accountExist, async (req, res) => {
    const address = req.address
    await Account.findOneAndUpdate(
        { address },
        { $set: {'mails.$[element].read': true}},
        { arrayFilters: [{'element.read': false}]}
    )
    success(res, 'ok', {})
})

/**
 * delete a mail for a user
 */
router.post('/deletemail', addressVli, accountExist, async (req, res) => {
    const address = req.address
    const mailid = req.body.mailid
    await Account.findOneAndUpdate(
        { address },
        { $pull: { mails: { id: mailid } } }
    )
    success(res, 'ok', {})
})

/**
 * delete all read mails for a user
 */
router.post('/deleteallread', addressVli, accountExist, async (req, res) => {
    const address = req.address
    await Account.findOneAndUpdate(
        { address },
        { $pull: { mails: { read: true}}}
    )
    success(res, 'ok', {})
})

//////////////////////////////////////////////////////////////
//                      PUTs
//////////////////////////////////////////////////////////////

router.put('/updnickname', addressVli, nicknameVli, accountExist, async (req, res) => {
    const address = req.address
    const nickname = req.body.nickname
    await Account.findOneAndUpdate(
        { address },
        { $set: { nickname }}
    )
    success(res, 'ok', {})
})

export default {
    route,
    router
}