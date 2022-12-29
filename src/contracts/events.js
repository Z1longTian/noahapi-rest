import { mint, upgrade, valueTransfer, burn, tradeList, tradeUnlist, tradePurchase, 
lobbyJoin, lobbyExit, battleStart, battleVote, battleEnd, update } from '../controllers/nft.js'
import { contract } from './nft.js'
import { logger } from '../loggers/winston.js'

// events
contract.on('Mint', (address, tokenid, id, time) => {
    mint(address.toLowerCase(), tokenid.toString(), id.toString(), time.toString())
})

contract.on('Upgrade', (tokenid, level, time) => {
    upgrade(tokenid.toString(), level.toString(), time.toString())
})

contract.on('ValueTransfer', (from, to, time) => {
    valueTransfer(from.toString(), to.toString(), time.toString())
})

contract.on('Burn', (tokenid, time) => {
    burn(tokenid.toString(), time.toString())
})

contract.on('UpdateConfigs', () => {
    update()
})

// Trade events
contract.on('TradeList', (seller, tokenid, price, time) => {
    tradeList(seller.toLowerCase(), tokenid.toString(), price.toString(), time.toString())
})

contract.on('TradeUnlist', (seller, tokenid, time) => {
    tradeUnlist(seller.toLowerCase(), tokenid.toString(), time.toString())
})

contract.on('TradePurchase', (seller, buyer, tokenid, price, time) => {
    tradePurchase(seller.toLowerCase(), buyer.toLowerCase(), tokenid.toString(), price.toString(), time.toString())
})

// Battle events
contract.on('LobbyJoin', (tokenid, time) => {
    lobbyJoin(tokenid.toString(), time.toString())
})

contract.on('LobbyExit', (tokenid, time) => {
    lobbyExit(tokenid.toString(), time.toString())
})

contract.on('BattleStart', (tokenid1, tokenid2, time) => {
    battleStart(tokenid1.toString(), tokenid2.toString(), time.toString())
})

contract.on('BattleVote', (tokenid, voter, time) => {
    battleVote(tokenid.toString(), voter.toLowerCase(), time.toString())
})

contract.on('BattleEnd', (tokenid1, tokenid2, typa, reward, time) => {
    battleEnd(tokenid1.toString(), tokenid2.toString(), typa.toString(), reward.toString(), time.toString())
})

logger.info('Listening to chain events')

export {}