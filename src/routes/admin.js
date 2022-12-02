import express from "express"
import { addrVli, nftExist, adminVli } from '../middlewares/index.js'
import { success } from "../utils/response.js"
import NFT from "../models/nft.js"
import { sendMail } from '../controllers/mail.js'


const route = 'admin'
const router = express.Router()

// middlewares
const addressVli = addrVli('address') // address validation
const adminCheck = adminVli('address') // admin check
const nftExisted = nftExist('tokenid') // nft existance check

//////////////////////////////////////////////////////////////
//                      GETs
//////////////////////////////////////////////////////////////
router.get('/:address', addressVli, adminCheck, (req, res) => {
    success(res, 'ok', {})
})

router.get('/:address/pendingnfts', addressVli, adminCheck, async (req, res) => {
    const nfts = await NFT.find({ verified: false })
    success(res, 'ok', nfts)
})

//////////////////////////////////////////////////////////////
//                      POSTs
//////////////////////////////////////////////////////////////
/**
 * @param address
 * @param id - id of nft
 */
router.post('/verify', addressVli, adminCheck, async (req, res) => {
    const id = req.body.id
    const nft = await NFT.findOneAndUpdate(
        { id },
        { $set: { verified: true }}
    )

    await sendMail(nft.owner, `Your NFT ${nft.name} is now verified ! Mint it NOW !`)
    success(res, 'ok', {})
})

// TODOs 
router.post('/decline', addressVli, adminCheck, async (req, res) => {
    const id = req.body.id
    const declineMsg = req.body.declineMsg
    const nft = await NFT.findOneAndDelete({id})
    await sendMail(nft.owner, `Sorry, your NFT ${nft.name} is declined and deleted ! 
    Because, ${declineMsg}. Please try again !`)

    success(res, 'ok', {})
})

export default {
    route,
    router
}