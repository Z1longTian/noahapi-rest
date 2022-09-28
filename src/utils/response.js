// success
const success = (res, msg, data) => {
    res.status(200).json({
        succeeded: true,
        msg,
        data
    })
}

// failure
const failure = (res, msg) => {
    res.status(200).json({
        succeeded: false,
        msg
    })
}

// response messages
const resMsg = {
    ise: 'Internal Server Error', // ise - internal server error
    unauthorized: 'Authorisation required',
    notAllowed: 'Request not allowed',
    nftExisted: 'Content already existed',
    web3AddrInvli: (target) => `Invalid address: ${target}`, // web3 Address Invli
    accNotExist: (account) => `Account: ${account}, does not exist`,
    cidExisted: (cid) => `Content: ${cid}, existed`,
    nftNotExist: (tokenid) => `NFT: ${tokenid}, does not exist`,
    inpInvalid: (field) => `${field} invalid`
}

export {
    resMsg,
    success,
    failure,
}