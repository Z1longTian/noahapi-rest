import Activity from "../models/activity.js"

const recordActivity = async (activity) => {
    await Activity.create({
        ...activity
    })
}

export {
    recordActivity
}