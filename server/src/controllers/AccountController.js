import ActiveIndex from "../models/modelIndex.js";
const {User} = ActiveIndex;

class AccountController {
    async searchUsers(req, res) {
        if (!req.body) {
            return res.status(400).send({message: "Missing fields..."});
        }
        try {
            const {text} = req.params;
            const users = await User.find({
                name: {$regex: new RegExp(`^${text}`, "i")}
            }).select("password").populate('role');
            if (!users) {
                return res.status(404).send({message: "User not found"});
            }
            return res.status(200).send({users});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Interval server error!"})
        }
    }

    async searchLoginedOrLogoutedUsers(req, res) {
        if (!req.body) {
            return res.status(400).send({message: "Missing fields..."});
        }
        try {
            const {tokenVersion} = req.params;
            if (tokenVersion !== 1 || tokenVersion !== 0) {
                return res.status(400).send({message: "tokenVersion parameter is wrong!"});
            }
            const users = await User.find({
                tokenVersion: {$regex: new RegExp(`^${tokenVersion}`, "i")}
            }).select("password").populate('role');
            if (!users) {
                return res.status(404).send({message: "User not found"});
            }
            return res.status(200).send({users});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Interval server error!"})
        }
    }

    async searchProfile(req, res) {
        if (!req.body) {
            return res.status(400).send({message: "Missing fields..."});
        }
        try {
            const {phone, avatarUrl} = req.params;
            const users = await User.find({
                profile: {
                    phone: {$regex: new RegExp(`^${phone}`, "i")}
                }
            }).select("-password").populate('role');
            if (!users) {
                const usersAvatar = await User.find({
                    profile: {
                        avatarUrl: {$regex: new RegExp(`^${avatarUrl}`, "i")}
                    }
                }).select("-password").populate('role');
                if (!usersAvatar) {
                    return res.status(404).send({message: "User not found"});
                }
                users = usersAvatar;
            }
            return res.status(200).send({users});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Interval server error!"})
        }
    }

    async filterUsers(req, res) {
        if (!req.body) {
            return res.status(400).send({message: "Missing fields..."});
        }
        try {
            const {age} = req.params;
            const users = await User.find({
                age: {$regex: new RegExp(`^${age}`, "i")}
            }).select("-password").populate('role');
            if (!users) {
                return res.status(404).send({message: "User not found"});
            }
            return res.status(200).send({users});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Interval server error!"})
        }
    }
}

export default new AccountController();