import NFT from "../models/nft.js"
import { getNftInfo, utils } from "../contracts/ethers.js"
import { recordActivity } from "./activity.js"
import { sendMail } from './account.js'
import Trade from "../models/trade.js"
import Game from '../models/game.js'
import Account from '../models/account.js'
import crypto from 'crypto'

// get nft data from chain and sync it to nft in database
const syncNFT = async (tokenid) => {
    const nft = await getNftInfo(tokenid)
    await NFT.findOneAndUpdate(
        { tokenid },
        { $inc: { views: 1 }},
        { 
            $set: {
                amount: nft.amount.toString(),
                currentAmount: nft.currentAmount.toString(),
                start: nft.startTime.toString(),
                inGame: nft.isRunning,
                onSale: nft.isOnSelling,
                round: nft.round.toString()
            }
        },
        
    )
}

// mint
const mint = async (address, tokenid, id) => {
    await NFT.findOneAndUpdate(
        { id },
        { $set: {
            tokenid,
            owner: address,
            isMinted: true,
            amount: utils.parseUnits('1', 'ether'),
            mintTime: Date.now()
        }}
    )

    await recordActivity({
        address,
        activity: 'Mint',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: null,
        date: Date.now()
    })
}

// add order
const sell = async (seller, tokenid, price) => {
    await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { price }}
    )

    await Trade.create({ seller, price, tokenid, start: Date.now()})

    await recordActivity({
        address: seller,
        activity: 'Listing',
        from: null,
        to: null,
        nft: tokenid,
        price,
        round: null,
        date: Date.now()
    })
}

const cancel = async (seller, tokenid, time) => {
    await Trade.fineOndAndUpdate(
        { tokenid, finished: false},
        { $set: { finished: true, cancelled: true, end: time}}
    )
    await recordActivity({
        address: seller,
        activity: 'Unlist',
        from: null,
        to: null,
        nft: tokenid,
        price,
        round: null,
        date: time
    })
}

const buy = async (buyer, tokenid, price) => {
    const time = Date.now()
    const trade = await Trade.findOneAndUpdate(
        { tokenid, finished: false},
        { $set: { buyer, price, finished: true, end: time}}
    )

    // record seller activity
    await recordActivity({
        address: trade.seller,
        activity: 'Sold',
        from: null,
        to: buyer,
        nft: tokenid,
        price,
        round: null,
        date: time
    })

    // buyer activity
    await recordActivity({
        address: buyer,
        activity: 'Purchase',
        from: trade.seller,
        to: null,
        nft: tokenid,
        price,
        round: null,
        date: time
    })

    // send mail to seller
    await sendMail(trade.seller, 
        `Your trade on NFT #${tokenid} is successfully completed at price ${utils.formatUnits(price)} BNB.
         You earned ${utils.formatUnits(price * 0.85)} BNB from this trade.`
    )
}

const start = async (tokenid, time) => {
    const nft = await NFT.findOne({tokenid})
    await Game.create({tokenid, start: time, round: nft.round + 1})

    await recordActivity({
        address: nft.owner,
        activity: 'Start Evaluation',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: nft.round+1,
        date: time
    })
}

const vote = async (voter, tokenid, typa, start) => {
    await Account.findOneAndUpdate(
        { address: voter },
        { $push: {evaluating: tokenid }}
    )
    let game
    if(typa == '1') {
        game = await Game.findOneAndUpdate(
            { tokenid, finished: false},
            { $push: { upVoters: voter }}
        )
    } else if(typa == '2') {
        game = await Game.findOneAndUpdate(
            { tokenid, finished: false},
            { $push: { downVoters: voter }}
        )
    }

    await recordActivity({
        address: voter,
        activity: 'Vote',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: game.round,
        date: Date.now()
    })

    // send mail to seller
    await sendMail(voter, 
        `Thanks for participating the round ${game.round} of evaluation of NFT#${tokenid}, 
        You will receive the result of this round when it is finished via mails.`
    )
}

const end = async (tokenid, type, reward, scale, approves, defuses) => {
    const game = await Game.findOneAndUpdate(
        { tokenid, finished: false},
        { $set: { finished: true, typa: type }}
    )

    const nft = await NFT.findOne({ tokenid })

    await recordActivity({
        address: nft.owner,
        activity: 'End Evaluation',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: game.round,
        date: Date.now()
    })
    let winVoters = game.upVoters
    let loseVoters = game.downVoters
    if(type == 2) {
        winVoters = game.downVoters
        loseVoters = game.upVoters
    }
    // draw
    if(type == 3) {
        await Account.updateMany(
            { address: { $in: (winVoters.concat(loseVoters))}},
            { $push: {
                mails: {
                    id: crypto.randomUUID(),
                    content: `The round ${game.round} of NFT#${tokenid} appears to be a draw, reward is returned to you`,
                    read: false,
                    date: Date.now()
                }
            }}
        )
    } else {
        await Account.updateMany(
            { address: { $in: winVoters}},
            { $push: {
                mails: {
                    id: crypto.randomUUID(),
                    content: `Congratulations! Your vote on the round ${game.round} of NFT#${tokenid} is successful, 
                    you earned ${utils.formatUnits(price)} BNB from this round`,
                    read: false,
                    date: Date.now()
                }
            }}
        )
        await Account.updateMany(
            { address: { $in: loseVoters}},
            { $push: {
                mails: {
                    id: crypto.randomUUID(),
                    content: `Unfortunately! Your vote on the round ${game.round} of NFT#${tokenid} is failed`,
                    read: false,
                    date: Date.now()
                }
            }}
        )
    }
    // remove evaluating
    await Account.updateMany(
        { address: { $in: (winVoters.concat(loseVoters))}},
        { $pull: { evaluating: tokenid }}
    )
}

export {
    syncNFT,
    mint,
    sell,
    cancel,
    buy,
    start,
    vote,
    end
}
