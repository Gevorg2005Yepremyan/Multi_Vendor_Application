import ActiveIndex from "../models/modelIndex.js";
const {Role} = ActiveIndex;

class RoleController {
    async addRole(req, res) {
        if (!req.body) {
            return res.status(400).send({message: "Missing fields..."});
        }
        try {
            const {name} = req.body;
            if (!name) {
                return res.status(401).send({message: ""})
            }
            const role = await Role.create({name});
            return res.status(201).send({success: true, role});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Interval server error!"});
        }
    }

    async showRole(req, res) {
        if (!req.params) {
            return res.status(400).send({message: "Missing fields..."});
        }
        try {
            const {id} = req.params;
            const role = await Role.findById(id);
            return res.status(201).send({Found: true, role});     
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Interval server error!"});
        }
    }

    async showRoles(req, res) {
        try {
            const roles = await Role.find();
            return res.status(200).send({message: "The role list", roles});
        } 
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Interval server error!"});
        }
    }

    async deleteRole(req, res) {
        if (!req.params) {
            return res.status(400).send({message: "Missing fields..."});
        }
        try {
            const {id} = req.params;
            const role = await Role.deleteOne({_id: id});
            return res.status(201).send({Deleted: true, role});     
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: "Interval server error!"});
        }
    }
}

export default new RoleController();