import modelIndex from "../models/modelIndex.js";
import { logActivity } from "../utils/logActivity.js";
const {User} = modelIndex;

class AdminController {
    async getUsers(req, res) {
        try {
            const users = await User.find();
            if (!users) {
                return res.status(404).send({message: "Users not found!"})
            }
            return res.status(200).send({users});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }
    async getUserById(req, res) {
        try {
            const {id} = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({message: "Users not found!"})
            }
            return res.status(200).send({user});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }
    async updateUser(req, res) {
        try {
            const {id} = req.params;
            const {role, isActive} = req.body;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({message: "Users not found!"})
            }
            user.role = role ? role : user.role;
            user.isActive = isActive ? isActive : user.isActive;
            await user.save();
            await logActivity({userId: req.user._id, type: "USER_UPDATED", payload: {user}});
            return res.status(200).send({message: "User successfully updated!", user});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }
    async deleteUser(req, res) {
        try {
            const {id} = req.params;
            const deleted = await User.findOne({_id: id});
            if (!deleted) {
                return res.status(404).send({message: "Users not found!"})
            }
            await logActivity({userId: req.user._id, type: "USER_DELETED", payload: {deleted}});
            return res.status(200).send({message: "User successfully deleted!", deleted});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Internal server error!"});
        }
    }
}

export default new AdminController();