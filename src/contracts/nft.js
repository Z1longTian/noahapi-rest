import { ethers } from 'ethers'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()
// abi
const abiPath = path.resolve() + '/src/contracts/nft.json'
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf-8'))

// nft contract address
const address = process.env.NFT_CONTRACT.toLowerCase()
const provider = new ethers.providers.JsonRpcProvider(process.env.NODE_PROVIDER)
const contract = new ethers.Contract(address, abi, provider)

const getSysBalance = async (address) => (await contract.functions.getSysBalance(address)).toString()

const getNftInfo = async (tokenid) => formatObj(await contract.functions.nftOf(tokenid))

const getUpgradeRequirements = async (tokenid) => formatObj(await contract.functions.upgradeRequirements(tokenid))

let configs = formatObj(await contract.functions.configs())

const updateConfigs = async () => configs = formatObj(await contract.functions.configs())

const admin = (await contract.functions.getOwner())[0].toLowerCase()

const utils = ethers.utils

// format object
// remove numeric keys and change from BN to string
function formatObj(obj) {
    const newObj = {}
    for(const key of Object.keys(obj)){
        if(isNaN(key)) {
            newObj[key] = obj[key].toString()
        }
    }
    return newObj
}

export {
    contract,
    utils,
    admin,
    configs,
    getSysBalance,
    getNftInfo,
    updateConfigs,
    getUpgradeRequirements
}