import express from "express"
import { failure, resMsg, success } from "../utils/response.js"
import { inpVli, addrVli, accExist, nftExist, activeUser, activeNFT } from '../middlewares/index.js'
import { getSysBalance } from "../contracts/nft.js"
import Account from "../models/account.js"
import NFT from "../models/nft.js"
import Activity from "../models/activity.js"

const route = 'account'
const router = express.Router()

// middlewares
const accountExist = accExist('address') // account existance check
const addressVli = addrVli('address') // address validation
const nftExisted = nftExist('tokenid') // nft existance check
const activeAcc = activeUser('address')
const activeNft = activeNFT('tokenid')
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
 * get details of an account - TESTED
 */
router.get('/:address', addressVli, accountExist, activeAcc, async (req, res) => {
    const address = req.address
    const account = (await Account.aggregate(
        [
            { $match: { address } },
            { $lookup: {
                from: NFT.collection.name,
                localField: 'likes',
                foreignField: 'tokenid',
                as: 'likes'
            }}
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
    const nfts = (await NFT.find({owner: address})).filter((nft) => nft.active)
    account.nfts = {
        mynfts: nfts.filter((nft) => nft.minted),
        created: await NFT.find({creator: address, minted: true}),
        listed: nfts.filter((nft) => nft.listed),
        inLobby: nfts.filter((nft) => nft.inLobby),
        battling: nfts.filter((nft) => nft.battling),
        pending: nfts.filter((nft) => !nft.verified || !nft.minted),
    }
    success(res, 'OK', account)
})

/**
 * get system balance of the address - TESTED
 */
router.get('/:address/balance', addressVli, accountExist, activeAcc, async (req, res) => {
    success(res, 'ok', await getSysBalance(req.address))
})

//////////////////////////////////////////////////////////////
//                           POSTs                          //
//////////////////////////////////////////////////////////////

/**
 * connect user - TESTED
 */
router.post('/connect', addressVli, async (req, res) => {
    const address = req.address
    const account = await Account.findOne({address})
    // if account not found
    if(!account){
        // create a new account
        await Account.create({
            address: address
        })
    } else{
        if(!account.active) {
            failure(res, resMsg.accBanned(address))
            return
        }
    }
    success(res, 'ok', {})
})

/**
 *  like an nft
 */
router.post('/like', addressVli, accountExist, activeAcc, nftExisted, activeNft, async (req, res) => {
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
router.post('/unlike', addressVli, accountExist, activeAcc, nftExisted, activeNft, async (req, res) => {
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
router.post('/markread', addressVli, accountExist, activeAcc, async (req, res) => {
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
router.post('/markallread', addressVli, accountExist, activeAcc, async (req, res) => {
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
router.post('/deletemail', addressVli, accountExist, activeAcc, async (req, res) => {
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
router.post('/deleteallread', addressVli, accountExist, activeAcc, async (req, res) => {
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

router.put('/updname', addressVli, nicknameVli, accountExist, activeAcc, async (req, res) => {
    const address = req.address
    const nickname = req.body.nickname
    await Account.findOneAndUpdate(
        { address },
        { $set: { name: nickname }}
    )
    success(res, 'ok', {})
})

export default {
    route,
    router
}