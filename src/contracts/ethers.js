import { ethers } from 'ethers'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()
// abi
const abiPath = path.resolve() + '/src/contracts/nft.json'
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'))

// nft contract address
const address = '0xd9BB32C2E5d7D681ec54c016dE171340b31b9298'
const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_PROVIDER)
const contract = new ethers.Contract(address, abi, provider)

const getSysBalance = async (address) => {
    return (await contract.functions.systemBalance(address)).toString()
}

const getNftInfo = async (tokenid) => {
    return (await contract.functions.getNftBase(tokenid))
}

const utils = ethers.utils

export {
    contract,
    utils,
    getSysBalance,
    getNftInfo,
}