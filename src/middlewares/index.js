import Account from '../models/account.js'
import NFT from '../models/nft.js'
import { failure, resMsg } from '../utils/response.js'
import { utils } from '../contracts/ethers.js'
// import { adminList } from '../utils/index.js'

// simple api key protection
const apiProtect = (req, res, next) => {
    // get key from header
    const key = req.header('x-api-key')
    if(key !== process.env.API_KEY) {
        failure(res, resMsg.notAllowed)
        return
    } 
    next()
}

// error handlers
const errHandler = (err, req, res, next) => {
    const code = res.statusCode ? res.statusCode : 500

    res.status(500).json({
        msg: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    })
}

// address validation
const addrVli = (field) => {
    return async (req, res, next) => {
        const address = req.body[field] || req.params[field]
        if(!utils.isAddress(address)){
            failure(res, resMsg.web3AddrInvli(address))
            return
        }
        // append address to req
        req[field] = address.toLowerCase()
        next()
    }
}

// account existance check
const accExist = (field) => {
    return async (req, res, next) => {
        const address = req[field]
        if(!await Account.exists({ address })){
            failure(res, resMsg.accNotExist(address))
            return
        }
        next()
    }
}

// cid existance check
const cidExist = async (req, res, next) => {
    const cid = req.body['cid'] || req.params['cid']
    if(await NFT.exists({ cid })){
        failure(res, resMsg.nftExisted)
        return
    }
    next()
}

// nft existance check
const nftExist = (field) => {
    return async (req, res, next) => {
        const tokenid = req.body[field] || req.params[field]
        if(!await NFT.exists({ tokenid })){
            failure(res, resMsg.nftNotExist(tokenid))
            return
        }
        req[field] = tokenid
        next()
    }
}

// input validation, [validate function]
const inpVli = (field, vliFn) => {
    return async (req, res, next) => {
        const param = req.body[field] || req.params[field]
        if(!vliFn(param)){
            failure(res, resMsg.inpInvalid(field))
            return
        }
        next()
    }
}

// admin validation
const adminVli = (field) => {
    return async (req, res, next) => {
        const address = req.body[field] || req.params[field]
        if(!admins.includes(address)){
            failure(res, resMsg.unauthorized)
            return
        }
        next()        
    }
}

export {
    errHandler,
    accExist,
    inpVli,
    addrVli,
    adminVli,
    nftExist,
    cidExist,
    apiProtect
}