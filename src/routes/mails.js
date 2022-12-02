import express from "express"
import Mail from "../models/mail.js"
import { addrVli, accExist, activeUser } from '../middlewares/index.js'
import { success } from "../utils/response.js"
import { sendMail } from "../controllers/mail.js"

const route = 'mail'
const router = express.Router()

// middlewares
const accountExist = accExist('address') // account existance check
const addressVli = addrVli('address') // address validation
const activeAcc = activeUser('address')

//////////////////////////////////////////////////////////////
//                         GETs                             //
//////////////////////////////////////////////////////////////
/**
 * get all mails of an account
 */
router.get('/:address', addressVli, accountExist, activeAcc, async (req, res) => {
    success(res, 'ok', await Mail.find({address: req.address}))
})

//////////////////////////////////////////////////////////////
//                           POSTs                          //
//////////////////////////////////////////////////////////////
/**
* mark a mail as read
*/
router.post('/read', addressVli, accountExist, activeAcc, async (req, res) => {
    await Mail.findOneAndUpdate(
        { address: req.address, _id: req.body._id },
        { $set: {read: true} }
    )
    success(res, 'ok', {})
})

/**
* mark all mails as read 
*/
router.post('/readall', addressVli, accountExist, activeAcc, async (req, res) => {
    await Mail.updateMany(
        { address: req.address, read: false },
        { $set: {read: true} }
    )
    success(res, 'ok', {})
})
//////////////////////////////////////////////////////////////
//                           DELETEs                        //
//////////////////////////////////////////////////////////////
/**
* delete a mail
*/
router.delete('/delete', addressVli, accountExist, activeAcc, async (req, res) => {
    await Mail.findOneAndDelete({
        address: req.address,
        _id: req.body._id
    })
    success(res, 'ok', {})
})

/**
* delete all read mails 
*/
router.delete('/deleteread', addressVli, accountExist, activeAcc, async (req, res) => {
    await Mail.deleteMany({
        address: req.address,
        read: true
    })
    success(res, 'ok', {})
})

// test for sockets
router.post('/to', async(req, res) => {
    const address = req.body.address.toLowerCase()
    await sendMail(address, 'this is a test')
    success(res, 'ok', {})
})
export default {
    route, 
    router
}