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
        { 
            $inc: { views: 1 },
            $set: {
                owner: nft.owner.toLowerCase(),
                amount: nft.amount.toString(),
                currentAmount: nft.currentAmount.toString(),
                start: nft.startTime.toString(),
                inGame: nft.isRunning,
                onSale: nft.isOnSelling,
                round: nft.round.toString(),
                level: nft.level.toString()
            }
        }
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
            amount: utils.parseUnits('0.3', 'ether')
        }}
    )

    recordActivity({
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
        { $set: { price, tradeStart: Date.now(), onSale: true }}
    )

    recordActivity({
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
    await NFT.findOneAndUpdate(
        { tokenid },
        { $set: {onSale: false}}
    )

    recordActivity({
        address: seller,
        activity: 'Unlist',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: null,
        date: Date.now()
    })
}

const buy = async (buyer, tokenid, price) => {

    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { owner: buyer, onSale: false }}
    )

    // record the trade info
    Trade.create({ seller: nft.owner, buyer, price, tokenid, start: nft.tradeStart, end: Date.now()})

    // record seller activity
    recordActivity({
        address: nft.owner,
        activity: 'Sold',
        from: null,
        to: buyer,
        nft: tokenid,
        price,
        round: null,
        date: Date.now()
    })

    // buyer activity
    recordActivity({
        address: buyer,
        activity: 'Purchase',
        from: nft.owner,
        to: null,
        nft: tokenid,
        price,
        round: null,
        date: Date.now()
    })

    const reward = (parseFloat(price) * 0.85).toString()
    // send mail to seller
    await sendMail(nft.owner, 
        `Your trade on NFT #${tokenid} is successfully completed at price ${utils.formatUnits(price)} BNB.
         You earned ${utils.formatUnits(reward)} BNB from this trade.`
    )
}

const start = async (tokenid, round) => {
    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { inGame: true, start: Date.now(), round }}
    )

    recordActivity({
        address: nft.owner,
        activity: 'Start Bet',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: round,
        date: Date.now()
    })
}

const vote = async (voter, tokenid, typa, start) => {
    await Account.findOneAndUpdate(
        { address: voter },
        { $push: { bets: tokenid }}
    )

    const result = () => {
        if (typa == '1') return { upVoters: voter}
        return { downVoters: voter }
    }

    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $push: result()}
    )

    recordActivity({
        address: voter,
        activity: 'Vote',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: nft.round,
        date: Date.now()
    })

    // send mail to seller
    await sendMail(voter, 
        `Thanks for participating the round ${nft.round} of bet of NFT#${tokenid}, 
        You will receive the result of this round when it is finished via mails.`
    )
}

const end = async (tokenid, type, reward, round) => {
    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $set: { inGame: false}}
    )
    
    Game.create({
        tokenid,
        start: nft.start,
        typa: type,
        round: nft.round,
        upVoters: nft.upVoters,
        downVoters: nft.downVoters
    })

    recordActivity({
        address: nft.owner,
        activity: 'Reveal Bet',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: round,
        date: Date.now()
    })
    let winVoters = nft.upVoters
    let loseVoters = nft.downVoters
    if(type == 2) {
        winVoters = nft.downVoters
        loseVoters = nft.upVoters
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
    // remove bettings
    await Account.updateMany(
        { address: { $in: (winVoters.concat(loseVoters))}},
        { $pull: { bets: tokenid }}
    )
}

// Todos
const upgrade = async (tokenid) => {
    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $inc: { level: 1 }}
    )

    recordActivity({
        address: nft.owner,
        activity: 'NFT Upgrade',
        from: null,
        to: null,
        nft: tokenid,
        price: null,
        round: null,
        date: Date.now()
    })
}

const burn = async (tokenid, dieTokenid) => {
    const dieNFT = await NFT.findOneAndUpdate(
        { tokenid: dieTokenid },
        { $set: { amount: 0 }}
    )
    const nft = await NFT.findOneAndUpdate(
        { tokenid },
        { $inc: { amount: dieNFT.amount }}
    )

    recordActivity({
        address: nft.owner,
        activity: 'Value Transfer',
        from: null,
        to: null,
        nft: dieTokenid,
        price: null,
        round: null,
        date: Date.now()
    })
}

export {
    syncNFT,
    mint,
    sell,
    cancel,
    buy,
    start,
    vote,
    end,
    upgrade,
    burn
}
