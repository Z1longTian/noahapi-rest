import Activity from "../models/activity.js"

/**
 * @param {object} activity {
 *      activity - activitiy name,
 *      links - [ {
 *          type: tokenid || address || price || fight || level
 *          value, 
 *          label: link label 
 *      } ]
 *      date - activitiy happended date
 * } 
 */
const recordActivity = (activity) => {
    Activity.create({
        ...activity
    })
}

export {
    recordActivity
}