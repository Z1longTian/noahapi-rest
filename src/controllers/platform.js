import Platform from "../models/platform.js"

//
const init = async () => {
    // create a document if the platform collection doesn't have any
    if((await Platform.count()) == 0) {
        Platform.create({})
    }
}

export {
    init
}
