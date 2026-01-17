import { env } from '../config/env.js';
import ActiveIndex from '../models/modelIndex.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {generateResetToken, sendEmail, addMinutes, validateStrongPassword} from '../utils/ultisIndex.js';
import { logActivity } from '../utils/logActivity.js';


const {User, File} = ActiveIndex;

class UserContoller {
    async signup(req, res) {
        if (!req.body) {
            return res.status(400).send({message: 'Missing fields...'});
        }
        try {
            const {name, surname, age, email, username: usernameFromBody, password, role, isActive, tokenVersion, resetPasswordToken, resetPasswordExpires} = req.body;
            let username = usernameFromBody && usernameFromBody.trim() ? usernameFromBody.trim() : (email ? email.split('@')[0] : '');
            if (!name.trim() || !surname.trim() || !age || !role.trim() || !isActive) {
                return res.status(400).send({message: 'Missing fields...'});
            }
            const found = await User.findOne({$or: [{email}, {username}]});
            if (found) {
                return res.status(401).send({message: 'User already exists!'});
            }
            if (!validateStrongPassword(password)) {
                return res.status(401).send({message: 'Wrong password!'});
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({name, surname, age, email, username, password: hashedPassword, role, isActive, tokenVersion, resetPasswordToken, resetPasswordExpires});
            await logActivity({ userId: user._id, type: 'USER_SIGNED_UP', payload: {user} });
            return res.status(201).send({ok:true, signup: "success", user});
        } 
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Interval server error!'});
        }
    }
    
    async login(req, res) { 
        if (!req.body) {
            return res.status(400).send({message: 'Missing fields...'});
        }
        const {email, username, password} = req.body;
        if ((!email && !username) || !password) {
            return res.status(400).send({message: 'Missing fields...'});
        }
        const user = await User.findOne(email ? {email} : {username});
        if (!user) {
            return res.status(400).send({message: 'User not found!'});
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(400).send({message: 'Wrong password!'});
        }
        try {
            const token = jwt.sign(
                {id: user._id, username: user.username},
                env.JWT_SECRET,
                { expiresIn: env.JWT_EXPIRES_IN }
            );
            user.tokenVersion = 1;
            await user.save();
            await logActivity({ userId: user._id, type: 'USER_LOGGED_IN', payload: {user} });
            return res.status(200).send({ok: true, login: "success", token});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Interval server error!'});
        }
    }

    async user(req, res) {
        if (!req.user) {
            return res.status(401).send({message: "Must be authorized!"});
        }
        try {
            const user = await User.findById(req.user.id).populate("role");
            return res.status(200).send({got_user: true, user})
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Interval server error!'});
        }
    }

    async uploadProfile(req, res) {
        if (!req.user) {
            return res.status(401).send({message: "Must be authorized!"});
        }
        try {
            const {id} = req.user;
            const {phone, bio} = req.body;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({message: "User not found!"});
            }

            const fileDoc = await File.create({
                ownerType: 'user',
                ownerId: req.user._id,
                url: `/backend/src/public/uploads/${req.file.filename}`,
                mime: req.file.mimetype,
                size: req.file.size
            });

            user.profile = {
                phone,
                avatarUrl: fileDoc.url,
                bio
            }

            await user.save();
            await logActivity({ userId: req.user._id, type: 'USER_PROFILE_UPLOADED', payload: {phone, fileId: fileDoc._id, bio} });
            return res.status(200).send({profile_uploaded: true, profile: user.profile});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Interval server error!'});
        }
    }

    async changeProfile(req, res) {
        if (!req.user) {
            return res.status(401).send({message: "Must be authorized!"});
        }
        try {
            const {id} = req.user;
            const {phone, avatarUrl, bio} = req.body;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({message: "User not found!"});
            }

            const fileDoc = await File.create({
                ownerType: 'user',
                ownerId: req.user._id,
                url: `/backend/src/public/uploads/${req.file.filename}`,
                mime: req.file.mimetype,
                size: req.file.size
            });

            user.profile.phone = phone ? phone : user.profile.phone;
            user.profile.avatarUrl = fileDoc.url ? fileDoc.url : user.profile.avatarUrl;
            user.profile.bio = bio ? bio : user.profile.bio;
            await user.save();
            await logActivity({ userId: req.user._id, type: 'USER_PROFILE_UPDATED', payload: user.profile});
            return res.status(200).send({profile_updated: true, profile: user.profile});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Interval server error!'});
        }
    }

    async switchActivity(req, res) {
        if (!req.user) {
            return res.status(401).send({message: "Must be authorized!"});
        }
        try {
            const {id} = req.user;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({message: "User not found!"});
            }
            user.isActive = !user.isActive;
            await user.save();
            return res.status(200).send({activity_switched: true, user});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Interval server error!'});
        }
    }
    
    async changeUser(req, res) {
        if (!req.user) {
            return res.status(401).send({message: "Must be authorized!"});
        }
        try {
            const {id} = req.user;
            const {name, surname, age, email, username, password, role, isActive} = req.body;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({message: "User not found!"});
            }
            user.name = name ? name : user.name;
            user.surname = surname ? surname : user.surname;
            user.age = age ? age : user.age;
            user.email = email ? email : user.email;
            user.username = username ? username : user.username;
            user.password = password ? password : user.password;
            user.role = role ? role : user.role;
            user.isActive = isActive ? isActive : user.isActive;
            await user.save();
            await Activity({ userId: req.user._id, type: 'USER_UPADTED', payload: { changes: user } });
            return res.status(200).send({user_updated: true, user});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Interval server error!'});
        }
    }

    async forgotPassword(req, res) {
        if (!req.user) {
            return res.status(400).send({message: 'Missing fields...'});
        }
        try {
            const {email} = req.user;
            const user = await User.findOne({email});
            if (!user) {
                return res.status(404).send({message: "User not found!"});
            }
            const {resetToken, hashedToken} = generateResetToken();
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = addMinutes(new Date, 60);
            await user.save();

            const resetUrl = `${env.APP_URL}/reset-password?token=${resetToken}&id=${user._id}`;
            const message = `<p>You requested to reset your password. Click the link below (expires in 1 hour):</p>
                <a href="${resetUrl}">Reset password</a>
                <p>If you didn't request this, ignore this email.</p>
            `
            await sendEmail({to: user.email, subject: 'Password Reset', html: message});
            return res.status(200).send({reset_email_sent: true, resetToken});
        }
        catch (err) {
            console.log(err);
            return res.status(500).send({message: 'Interval server error!'});
        }
    }

    async changePassword(req, res) {
        if (!req.body || !req.user) {
            return res.status(400).send({ message: 'Missing fields...' });
        }
        try {
            const { email, resetToken, newPassword } = req.body;
            const user = await User.findOne({ email: email.trim() });
            if (!user) {
                return res.status(404).send({ message: "User not found!" });
            }
            if (user.resetPasswordToken !== resetToken || user.resetPasswordExpires < new Date()) {
                return res.status(400).send({ message: "Invalid or expired reset token!" });
            }
            if (!validateStrongPassword(newPassword) || await bcrypt.compare(newPassword, user.password)) {
                return res.status(400).send({ message: "Wrong or same password!" });
            }

            user.password = await bcrypt.hash(newPassword, 10);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;

            await user.save();
            await logActivity({ userId: req.user._id, type: 'USER_PASSWORD_UPDATED', payload: {password} });
            return res.status(200).send({ password_changed: true });
        } 
        catch (err) {
            console.log(err);
            return res.status(500).send({ message: 'Internal server error!' });
        }
    }

    async logout(req, res) {
        if (!req.user) {
            return res.status(401).send({ message: "Must be authorized!" });
        }
        try {
            const { id } = req.user;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send({ message: "User not found!" });
            }
            if (user.tokenVersion === 0 || !user.tokenVersion) {
                return res.status(400).send({ message: "User already logged out!" });
            }
            user.tokenVersion = 0;
            await user.save();
            await logActivity({ userId: user._id, type: 'USER_LOGGED_OUT', payload: {user} });
            return res.status(200).send({ logged_out: true });
        } catch (err) {
            console.log(err);
            return res.status(500).send({ message: 'Internal server error!' });
        }
    }
}
export default new UserContoller();