import Activity from "../models/activity.js"

const recordActivity = (activity) => {
    Activity.create({
        ...activity
    })
}

export {
    recordActivity
}