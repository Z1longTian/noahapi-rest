import Account from "../models/account.js"
import crypto from 'crypto'

const sendMail = async (address, content) => {
    await Account.findOneAndUpdate(
        { address },
        { $push: {
            mails: {
                id: crypto.randomUUID(),
                content,
                read: false,
                date: Date.now()
            }
        }}
    )
}

export {
    sendMail
}