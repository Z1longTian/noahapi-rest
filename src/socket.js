const connections = new Map()

const initIO = async (io) => {
    
    io.on('connection', (socket)=> {
        const address = socket.handshake.query.address.toLowerCase()
        connections.set(address, socket.id)
    
        socket.on('disconnect', () => connections.delete(address))
    })
    
}

export {
    initIO,
    connections
}