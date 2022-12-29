import express from "express"
import { failure, resMsg, success } from "../utils/response.js"
import { inpVli, addrVli, accExist, nftExist, activeUser, activeNFT } from '../middlewares/index.js'
import { getSysBalance } from "../contracts/nft.js"
import Account from "../models/account.js"
import NFT from "../models/nft.js"
import Activity from "../models/activity.js"
import Mail from "../models/mail.js"
import { sendMail } from "../controllers/mail.js"

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
//                         GETs                             //
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
    account.mails = await Mail.find({address})
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
router.get('/:address/balance', addressVli, async (req, res) => {
    success(res, 'ok', await getSysBalance(req.address))
})

//////////////////////////////////////////////////////////////
//                           POSTs                          //
//////////////////////////////////////////////////////////////

/**
 * connect user - TESTED
 */
router.post('/connect', addressVli, async (req, res) => {
    const logger = req.app.logger
    const address = req.address
    const account = await Account.findOne({address})
    // if account not found
    if(!account){
        // create a new account
        await Account.create({
            address: address
        })
        await sendMail(address, 'Welcome to Noah')
        logger.user(`register ${address}`)
    } else{
        if(!account.active) {
            failure(res, resMsg.accBanned(address))
            return
        }
        await sendMail(address, 'You have logged in successfully')
        logger.user(`login ${address}`)
    }
    
    success(res, 'ok', {})
})

/**
 *  like an nft
 */
router.post('/like', addressVli, accountExist, activeAcc, nftExisted, activeNft, async (req, res) => {
    const logger = req.app.logger
    const address = req.address
    const tokenid = req.tokenid
    // didn't add check of existance of tokenid in likes
    // since addToSet won't do anything if tokenid already exists
    await Account.findOneAndUpdate(
        { address },
        { $addToSet: { likes: tokenid } }
    )
    logger.user(`like ${address} ${tokenid}`)
    success(res, 'ok', {})
})

/**
 * unlike an nft
 */
router.post('/unlike', addressVli, accountExist, activeAcc, nftExisted, activeNft, async (req, res) => {
    const logger = req.app.logger
    const address = req.address
    const tokenid = req.tokenid
    // didn't add check of existance of tokenid in likes
    // since pull won't do anything if tokenid is not in likes
    await Account.findOneAndUpdate(
        { address },
        { $pull: { likes: tokenid } }
    )
    logger.user(`unlike ${address} ${tokenid}`)
    success(res, 'ok', {})
})

//////////////////////////////////////////////////////////////
//                      PUTs
//////////////////////////////////////////////////////////////

router.put('/updname', addressVli, nicknameVli, accountExist, activeAcc, async (req, res) => {
    const logger = req.app.logger
    const address = req.address
    const nickname = req.body.nickname
    const account = await Account.findOneAndUpdate(
        { address },
        { $set: { name: nickname }}
    )
    logger.user(`edit-name ${address} from ${account.name} to ${nickname}`)
    success(res, 'ok', {})
})


export default {
    route,
    router
}