import NFT from "../models/nft.js"
import { getNftInfo, utils, configs, updateConfigs } from "../contracts/nft.js"
import { recordActivity } from "./activity.js"
import { sendMail } from './mail.js'
import Trade from "../models/trade.js"
import Account from '../models/account.js'
import Battle from "../models/battle.js"
import { logger } from "../loggers/winston.js"
// get nft data from chain and sync it to nft in database
const syncNFT = async (tokenid) => {
    const nft = await getNftInfo(tokenid)
    await NFT.findOneAndUpdate(
        { tokenid },
        { 
            $inc: { views: 1 },
            $set: {
                owner: nft.owner.toLowerCase(),
                value: nft.value,
                level: nft.level,
                fight: nft.fight,
                start: nft.start,
                pool: nft.pool,
                price: nft.price,
                listed: nft.listed,
                battling: nft.battling,
                inLobby: nft.inLobby,
            }
        }
    )
}

// mint
const mint = async (address, tokenid, id, time) => {
    await NFT.findOneAndUpdate(
        { id },
        { $set: {
            tokenid,
            owner: address,
            minted: true,
            value: configs.mintAmount// change 0.3 to mintAmount
        }}
    )

    // recordActivity({
    //     address,
    //     activity: 'Mint',
    //     from: null,
    //     to: null,
    //     nft: tokenid,
    //     price: null,
    //     round: null,
    //     date: time
    // })
    logger.user(`mint ${id} => ${tokenid}`)
}

const update = async () => {
    await updateConfigs()
}

// list
const tradeList = async (seller, tokenid, price, time) => {
    await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { price, tradeStart: time, listed: true }}
    )

    // recordActivity({
    //     address: seller,
    //     activity: 'Listing',
    //     from: null,
    //     to: null,
    //     nft: tokenid,
    //     price,
    //     round: null,
    //     date: time
    // })
    logger.user(`list account@${seller} NFT#${tokenid} ${utils.formatEther(price)}bnb`)
}
// unlist 
const tradeUnlist = async (seller, tokenid, time) => {
    await NFT.findOneAndUpdate(
        { tokenid },
        { $set: {listed: false}}
    )

    // recordActivity({
    //     address: seller,
    //     activity: 'Unlist',
    //     from: null,
    //     to: null,
    //     nft: tokenid,
    //     price: null,
    //     round: null,
    //     date: time,
    // })
    logger.user(`unlist account@${seller} NFT#${tokenid}`)
}

const tradePurchase = async (seller, buyer, tokenid, price, time) => {
    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { owner: buyer, listed: false }}
    )

    // record the trade info
    Trade.create({ seller, buyer, price, tokenid, start: nft.tradeStart, end: time})
    logger.user(`purchase seller@${seller} buyer@${buyer} NFT#${tokenid} at ${utils.formatEther(price)}bnb`)

    // record seller activity
    // recordActivity({
    //     address: seller,
    //     activity: 'Sold',
    //     from: null,
    //     to: buyer,
    //     nft: tokenid,
    //     price,
    //     round: null,
    //     date: time
    // })

    // buyer activity
    // recordActivity({
    //     address: buyer,
    //     activity: 'Purchase',
    //     from: seller,
    //     to: null,
    //     nft: tokenid,
    //     price,
    //     round: null,
    //     date: time
    // })

    // const reward = (parseFloat(price) * 0.85).toString()
    // send mail to seller
    // await sendMail(seller, 
    //     `Your trade on NFT #${tokenid} is successfully completed at price ${utils.formatUnits(price)} BNB.
    //      You earned ${utils.formatUnits(reward)} BNB from this trade.`
    // )
}

const lobbyJoin = async (tokenid, time) => {
    await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { inLobby: true } }
    )
    logger.user(`join NFT#${tokenid}`)

}

const lobbyExit = async (tokenid, time) => {
    await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { inLobby: false } }
    )
    logger.user(`exit NFT#${tokenid}`)
}

const battleStart = async (tokenid1, tokenid2, time) => {
    const tokenids = [tokenid1, tokenid2].sort()
    const nft1 = await NFT.findOneAndUpdate(
        { tokenid: tokenid1 },
        { $set: { battling: true, start: time, inLobby: false}, $inc: { fight: 1 }}
    )
    const nft2 = await NFT.findOneAndUpdate(
        { tokenid: tokenid2 },
        { $set: { battling: true, start: time, inLobby: false}, $inc: { fight: 1 }}
    )
    Battle.create({
        tokenids,
        tokenid1,
        tokenid2,
        start: time
    })
    logger.user(`battle NFT#${tokenid1} NFT#${tokenid2}`)

    // recordActivity({
    //     address: nft1.owner,
    //     activity: 'Start Battle',
    //     from: null,
    //     to: null,
    //     nft: tokenid1,
    //     price: null,
    //     fight: nft1.fight + 1,
    //     date: time
    // })

    // recordActivity({
    //     address: nft2.owner,
    //     activity: 'Start Battle',
    //     from: null,
    //     to: null,
    //     nft: tokenid2,
    //     price: null,
    //     fight: nft2.fight,
    //     date: time
    // })
}

const battleVote = async (tokenid, voter, time) => {

    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $push: {votes: voter}}
    )
    logger.user(`vote voter@${voter} NFT#${tokenid}`)
    // recordActivity({
    //     address: voter,
    //     activity: 'Vote',
    //     from: null,
    //     to: null,
    //     nft: tokenid,
    //     price: null,
    //     round: nft.fight,
    //     date: time
    // })

    // send mail to seller
    // await sendMail(voter, 
    //     `Thanks for participating the round ${nft.round} of bet of NFT#${tokenid}, 
    //     You will receive the result of this round when it is finished via mails.`
    // )
}

const battleEnd = async (tokenid1, tokenid2, typa, reward, time) => {
    const tokenids = [tokenid1, tokenid2].sort()
    const nft1 = await NFT.findOneAndUpdate(
        { tokenid: tokenid1 },
        { $set: { battling: false, votes: []}}
    )

    const nft2 = await NFT.findOneAndUpdate(
        { tokenid: tokenid2 },
        { $set: { battling: false, votes: []}}
    )
    const votes = {}
    votes[tokenid1] = nft1.votes
    votes[tokenid2] = nft2.votes
    const battle = await Battle.findOneAndUpdate(
        { tokenids, finished: false},
        { $set: {
            votes,
            result: typa,
            end: time,
            finished: true
        }}
    )
    logger.user(`end NFT#${tokenid1} NFT#${tokenid2} winner:${typa}`)

    // recordActivity({
    //     address: nft.owner,
    //     activity: 'End Battle',
    //     from: null,
    //     to: null,
    //     nft: tokenid,
    //     price: null,
    //     round: round,
    //     date: Date.now()
    // })

    // if(type == 3) {
    //     await Account.updateMany(
    //         { address: winVoters.concat(loseVoters)},
    //         { $push: {
    //             mails: {
    //                 id: crypto.randomUUID(),
    //                 content: `The round ${nft.round} of NFT#${tokenid} appears to be a draw, reward is returned to you`,
    //                 read: false,
    //                 date: Date.now()
    //             }
    //         }}
    //     )
    // } else {
    //     await Account.updateMany(
    //         { address:  winVoters},
    //         { $push: {
    //             mails: {
    //                 id: crypto.randomUUID(),
    //                 content: `Congratulations! Your vote on the round ${nft.round} of NFT#${tokenid} is successful, 
    //                 you earned ${utils.formatUnits(reward)} BNB from this round`,
    //                 read: false,
    //                 date: Date.now()
    //             }
    //         }}
    //     )
    //     await Account.updateMany(
    //         { address: loseVoters},
    //         { $push: {
    //             mails: {
    //                 id: crypto.randomUUID(),
    //                 content: `Unfortunately! Your vote on the round ${nft.round} of NFT#${tokenid} is failed`,
    //                 read: false,
    //                 date: Date.now()
    //             }
    //         }}
    //     )
    // }
}

// Todos
const upgrade = async (tokenid) => {
    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $inc: { level: 1 }}
    )
    logger.user(`upgrade NFT#${tokenid}`)


    // recordActivity({
    //     address: nft.owner,
    //     activity: 'NFT Upgrade',
    //     from: null,
    //     to: null,
    //     nft: tokenid,
    //     price: null,
    //     round: null,
    //     date: Date.now()
    // })
}

const valueTransfer = async (tokenid, dieTokenid) => {
    logger.user(`transfer from NFT#${dieTokenid} to NFT#${tokenid}`)
    // later record activity
    
    // recordActivity({
    //     address: nft.owner,
    //     activity: 'Value Transfer',
    //     from: null,
    //     to: null,
    //     nft: dieTokenid,
    //     price: null,
    //     round: null,
    //     date: Date.now()
    // })
}

// todo delete nft
const burn = async (tokenid) => {
    logger.user(`burn NFT#${tokenid}`)
}

export {
    syncNFT,
    mint,
    upgrade,
    valueTransfer,
    burn,
    update,
    //
    tradeList,
    tradeUnlist,
    tradePurchase,
    //
    lobbyJoin,
    lobbyExit,
    battleStart,
    battleVote,
    battleEnd,
}
