import express from "express"
import { addrVli, nftExist, adminVli } from '../middlewares/index.js'
import { success } from "../utils/response.js"
import NFT from "../models/nft.js"
import Account from '../models/account.js'
import { sendMail } from '../controllers/mail.js'
import { promises as fs } from 'fs'
import path from 'path'

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
    const logger = req.app.logger
    logger.user(`admin access ${req.address}`)
    success(res, 'ok', {})
})

router.post('/pendingnfts', addressVli, adminCheck, async (req, res) => {
    let {page, page_size, sort, key} = req.body
    page = parseInt(page)
    page_size = parseInt(page_size)
    const start = (page - 1) * page_size
    const keyFilter = () => {
        if(isNaN(key) || key == '') {
            const reg = new RegExp(key, 'i')
            const fields = ['name', 'creator']
            return { $or: fields.map(field => {
                const query = {}
                query[field] = reg
                return query
            })}
        }
        key = parseInt(key)
        return {
            id: key
        }
    }
    const sortFilter = () => {
        if(sort == 0) return { id: 1}
        
        if(sort == 1) return { id: -1}

        return {}
    }
    const filter = {
        verified: false,
        ...keyFilter()
    }
    const nfts = await NFT.find(filter).sort(sortFilter()).skip(start).limit(page_size)
    // for pagination
    success(res, 'ok', {nfts, count: await NFT.count({verified: false})})
})

//////////////////////////////////////////////////////////////
//                      POSTs
//////////////////////////////////////////////////////////////
/**
 * @param address
 * @param id - id of nft
 */
router.post('/verify', addressVli, adminCheck, async (req, res) => {
    const logger = req.app.logger
    const id = req.body.id
    const nft = await NFT.findOneAndUpdate(
        { id },
        { $set: { verified: true }}
    )

    await sendMail(nft.owner, `Your NFT ${nft.name} is now verified ! Mint it NOW !`)
    logger.admin(`verify ${id}`)
    success(res, 'ok', {})
})
 
router.post('/decline', addressVli, adminCheck, async (req, res) => {
    const logger = req.app.logger
    const id = req.body.id
    const declineMsg = req.body.declineMsg
    const nft = await NFT.findOneAndDelete({id})
    await sendMail(nft.owner, `Sorry, your NFT ${nft.name} is declined and deleted ! 
    Because, ${declineMsg}. Please try again !`)

    logger.admin(`decline ${id} ${declineMsg}`)
    success(res, 'ok', {})
})

router.post('/activiate', addressVli, adminCheck, nftExisted, async (req, res) => {
    const logger = req.app.logger
    const tokenid = req.tokenid
    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { active: true }}
    )

    await sendMail(nft.owner, `Your NFT ${nft.name} is now banned.`)
    logger.admin(`ban NFT#${tokenid}`)
    success(res, 'ok', {})
})

router.post('/inactiviate', addressVli, adminCheck, nftExisted, async (req, res) => {
    const logger = req.app.logger
    const tokenid = req.tokenid
    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { active: false }}
    )

    await sendMail(nft.owner, `Your NFT ${nft.name} is now unbanned.`)
    logger.admin(`unban NFT#${tokenid}`)
    success(res, 'ok', {})
})

router.post('/ban', addressVli, adminCheck, addrVli('targetAddress'), async (req, res) => {
    const logger = req.app.logger
    const targetAddress = req.targetAddress
    await Account.findOneAndUpdate(
        {address: targetAddress},
        { $set: { active: false }}
    )
    logger.admin(`ban Address#${targetAddress}`)
    success(res, 'ok', {})
})

router.post('/unban', addressVli, adminCheck, addrVli('targetAddress'), async (req, res) => {
    const logger = req.app.logger
    const targetAddress = req.targetAddress
    await Account.findOneAndUpdate(
        {address: targetAddress},
        { $set: { active: true }}
    )
    logger.admin(`unban Address#${targetAddress}`)
    success(res, 'ok', {})
})

// get all logs
router.post('/logs', addressVli, adminCheck, async (req, res) => {
    const files = []
    const route = path.join(path.resolve(), '/src/logs/')
    for(const file of await fs.readdir(route)) {
        files.push(file)
    }

    success(res, 'ok', files)
})

router.post('/log', addressVli, adminCheck, async (req, res) => {
    const filename = path.join(path.resolve(), `/src/logs/${req.body.filename}`)
    const data = (await fs.readFile(filename, 'utf-8')).split('\n')

    success(res, 'ok', data)
})

export default {
    route,
    router
}