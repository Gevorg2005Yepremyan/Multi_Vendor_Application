import ActiveIndex from "../models/modelIndex.js"
const {Activity} = ActiveIndex;

export const logActivity = async ({userId, type, payload={}}) => {
    try {
        const activity = new Activity({userId, type, payload});
        await activity.save();
    }
    catch (err) {
        console.error('Failed to log activity:', err);
    }
}