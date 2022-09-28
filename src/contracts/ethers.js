import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'
import { mint, sell, cancel, buy, start, vote, end } from '../controllers/nft.js'

// abi
const abiPath = path.resolve() + '/src/contracts/nft.json'
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'))

// nft contract address
const address = '0x17bD008Ec4BdC05109Ce247d9D8B907BF21fEDDa'
const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_PROVIDER)
const contract = new ethers.Contract(address, abi, provider)

const getSysBalance = async (address) => {
    return (await contract.functions.systemBalance(address)).toString()
}

const getNftInfo = async (tokenid) => {
    return await contract.functions.getNftBase(tokenid)
}

// events
contract.on('Mint', async (address, tokenid, id) => {
    await mint(address.toLowerCase(), tokenid.toString(), id.toString())
})

contract.on('AddOrder', async (seller, tokenid, price) => {
    await sell(seller.toLowerCase(), tokenid.toString(), price.toString())
})

contract.on('CancelOrder', async (seller, tokenid, time) => {
    await cancel(seller.toLowerCase(), tokenid.toString(), time.toString())
})

contract.on('FinishOrder', async (buyer, tokenid, price) => {
    await buy(buyer.toLowerCase(), tokenid.toString(), price.toString())
})

contract.on('StartGame', async (tokenid, time) => {
    await start(tokenid.toString(), time.toString())
})

contract.on('GameOver', async (tokenid, type, reward, scale, approves, defuses) => {
    await end(tokenid.toString(), type.toString(), reward.toString(), scale, approves, defuses)    
})

contract.on('Vote', async (voter, tokenid, type, start) => {
    await vote(voter.toLowerCase(), tokenid.toString(), type.toString(), start.toString())
})

// Todos
contract.on('Upgrade', async (address, tokenid, id) => {
    
})

contract.on('Burn', async (address, tokenid, id) => {
    
})

const utils = ethers.utils

export {
    utils,
    getSysBalance,
    getNftInfo
}