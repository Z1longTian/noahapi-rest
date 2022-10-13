import express from "express"
import { addrVli, accExist, nftExist, adminVli } from '../middlewares/index.js'
import { success, failure } from "../utils/response.js"

const route = 'admin'
const router = express.Router()

// middlewares
const accountExist = accExist('address') // account existance check
const addressVli = addrVli('address') // address validation
const adminCheck = adminVli('address') // admin check

//////////////////////////////////////////////////////////////
//                      GETs
//////////////////////////////////////////////////////////////
router.get('/:address', addrVli, adminVli, (req, res) => {
    success(res, 'ok', {})
})

export default {
    route,
    router
}