import express from "express"
import Platform from "../models/platform.js"
import { configs } from "../contracts/nft.js"
import { success } from "../utils/response.js"
import { inpVli } from "../middlewares/index.js"

const route = 'platform'
const router = express.Router()

// middlewares
const annoucementLen = (length) => {
    return (input) => input && input !== '' && input.length <= length
}

const annoucementVli = inpVli('annoucement', annoucementLen(200))

// gets
router.get('/configs', (req, res) => {
    success(res, 'ok', configs)
})

//
router.get('/annoucement', async (req, res) => {
    success(res, 'ok', (await Platform.findOne()).annoucement)
})

// puts
// jwt auth needed
router.put('/annoucement', annoucementVli, async (req, res) => {
    console.log(req.body)
    const annoucement = req.body.annoucement
    await Platform.findOneAndUpdate(
        { $set:{ annoucement } }
    )
    success(res, 'ok', {})
})

// deletes
router.delete('/annoucement', async (req, res) => {
    await Platform.findOneAndUpdate(
        {
            $set: {
                annoucement: ''
            }
        }
    )
    success(res, 'ok', {})
})


export default {
    route,
    router
}