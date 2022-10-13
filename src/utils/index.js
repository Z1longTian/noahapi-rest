// duration time of a round
const roundDuration = 600

// admin list, store admin lists in a list and covert them into lowercase
const adminList = process.env.ADMINS.split(',').map(e => e.toLowerCase())

const isAdmin = (address) => adminList.includes(address.toLowerCase())

// convert cid to ipfs uri
const ipfsURI = (cid) => {
    return `ipfs://${cid}`
}

// convert cid to https gateway
const httpURL = (cid) => {
    return `https://ipfs.io/ipfs/${cid}`
}

export {
    ipfsURI,
    httpURL,
    isAdmin,
    roundDuration,
}