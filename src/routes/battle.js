import express from 'express'
import NFT from '../models/nft.js'
import Battle from '../models/battle.js'
import { success, failure } from '../utils/response.js'
import { nftExist, addrVli, accExist, cidExist, inpVli, activeUser, activeNFT } from "../middlewares/index.js"

const route = 'battle'
const router = express.Router()

// middlewares
const nft1Exist = nftExist('tokenid1')
const nft2Exist = nftExist('tokenid2')
const nft1Active = activeNFT('tokenid1')
const nft2Active = activeNFT('tokenid2')

// get a current battle of two nfts
router.get('/:tokenid1/:tokenid2', nft1Exist, nft2Exist, nft1Active, nft2Active, async (req, res) => {
    const { tokenid1, tokenid2 } = req.params
    const tokenids = [ Number(tokenid1), Number(tokenid2)].sort()

    const battle = (await Battle.aggregate(
        [
            {
                $match: {
                    $and: [
                        { tokenids },
                        { finished: false}
                    ]
                }
            },
            {
                $lookup: {
                    from: NFT.collection.name,
                    localField: 'tokenids',
                    foreignField: 'tokenid',
                    as: 'nfts'
                }
            }
        ]
    ))

    if(battle.length > 0) {
        success(res, 'ok', battle)
        return
    } 
    failure(res, 'No Battle found')
})

/**
 * get all happening battles
 */
router.get('/', async (req, res) => {
    const battles = await Battle.aggregate([
        {
            $match: { finished: false }
        },
        {
            $lookup: {
                from: NFT.collection.name,
                localField: 'tokenids',
                foreignField: 'tokenid',
                as: 'nfts'
            }
        }
    ])
    success(res, 'ok', battles)
})

export default {
    route,
    router
}