import Mail from "../models/mail.js"
import { connections } from '../socket.js'

const sendMail = async (address, content) => {
    await Mail.create({
        address,
        content,
        date: Date.now(),
    })
    global.io.to(connections.get(address)).emit('fetchMails')
}

export {
    sendMail
}