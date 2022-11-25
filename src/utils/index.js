import { admin } from "../contracts/nft.js"

const isAdmin = (address) => admin === address

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
}