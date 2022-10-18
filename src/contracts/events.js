import { mint, sell, cancel, buy, start, vote, end, upgrade, burn } from '../controllers/nft.js'
import { contract } from './ethers.js'


// events
contract.on('Mint', (address, tokenid, id) => {
    mint(address.toLowerCase(), tokenid.toString(), id.toString())
})

contract.on('AddOrder', (seller, tokenid, price) => {
    sell(seller.toLowerCase(), tokenid.toString(), price.toString())
})

contract.on('CancelOrder', (seller, tokenid, time) => {
    cancel(seller.toLowerCase(), tokenid.toString(), time.toString())
})

contract.on('FinishOrder', (buyer, tokenid, price) => {
    buy(buyer.toLowerCase(), tokenid.toString(), price.toString())
})

contract.on('StartGame', (tokenid, round) => {
    start(tokenid.toString(), round.toString())
})

contract.on('GameOver', (tokenid, type, reward, approves, defuses, round) => {
    end(tokenid.toString(), type.toString(), reward.toString(), round.toString())    
})

contract.on('Vote', (voter, tokenid, type, start) => {
    vote(voter.toLowerCase(), tokenid.toString(), type.toString(), start.toString())
})

contract.on('Upgrade', (tokenid) => {
    upgrade(tokenid.toString())
})

contract.on('Burn', (tokenid, dieTokenid) => {
    burn(tokenid.toString(), dieTokenid.toString())
})

console.log('Listening chain events')

export {}