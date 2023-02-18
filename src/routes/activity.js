import express from "express"
import Activity from "../models/activity.js"
import { success } from "../utils/response.js"
import { addrVli, accExist, activeUser } from '../middlewares/index.js'

const route = 'activity'
const router = express.Router()

// middlewares
const accountExist = accExist('address') // account existance check
const addressVli = addrVli('address') // address validation
const activeAcc = activeUser('address')

router.get('/:address', addressVli, accountExist, activeAcc, async (req, res) => {
    const address = req.address
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
})

export default {
    route,
    router
}