import { User } from "../models/Users.js"
import { sendMail } from "../utils/sendMail.js"
import { sendToken } from "../utils/sendToken.js"
import cloudinary from 'cloudinary'
import fs from 'fs'
export const register = async(req, res) => {
    try {
        const { name, email, password } = req.body
        const avatar = req.files.avatar.tempFilePath


        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ success: false, message: "user already exist" })
        }

        const mycloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "todoapp"
        })
        fs.rmSync("./tmp", { recursive: true })
        const otp = Math.floor(Math.random() * 100000)
        user = await User.create({ name, email, password, avatar: { public_id: mycloud.public_id, url: mycloud.secure_url }, otp, otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000) })
        await sendMail(email, "verify your account", `your OTP is ${otp}`)
        sendToken(res, user, 200, "OTP send to your email")
    } catch (error) {
        res.status(400).json(error)
    }
}

export const verify = async(req, res) => {
    try {
        const otp = Number(req.body.otp)
        const user = await User.findById(req.user._id)

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: "invalid otp" })
        }
        user.verified = true
        user.otp = null
        user.otp_expiry = null
        await user.save()
        sendToken(res, user, 200, "account verified")
    } catch (error) {
        res.status(400).json(error)
    }
}

export const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Please enter all fields" });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Email or Password" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid Email or Password" });
        }

        sendToken(res, user, 200, "Login Successful");
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logout = async(req, res) => {
    try {
        res.status(200).cookie("token", null, {
            expires: new Date(Date.now())
        }).json({ success: true, message: "logout successfully" })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const addTask = async(req, res) => {
    try {
        const { title, description } = req.body
        const user = await User.findById(req.user._id)
        user.tasks.push({
            title,
            description,
            completed: false,
            createdAt: new Date(Date.now())
        })
        await user.save()
        res.status(200).json({ success: true, message: "task added successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const removeTask = async(req, res) => {
    try {
        const { taskId } = req.params
        const user = await User.findById(req.user._id)
        user.tasks = user.tasks.filter((task) => task._id.toString() !== taskId.toString())
        await user.save()
        res.status(200).json({ success: true, message: "task removed successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateTask = async(req, res) => {
    try {
        const { taskId } = req.params
        const user = await User.findById(req.user._id)
        user.taky = user.tasks.find((task) => task._id.toString() !== taskId.toString())
        user.taky.completed = !user.taky.completed
        await user.save()
        res.status(200).json({ success: true, message: "task updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id)

        sendToken(res, user, 201, `welcome back ${user.name}`)

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProfile = async(req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const avatar = req.files.avatar.tempFilePath
        const { name } = req.body
        if (name) user.name = name
        if (avatar) {
            await cloudinary.v2.uploader.destroy(user.avatar.public_id)
            const mycloud = await cloudinary.v2.uploader.upload(avatar)
            fs.rmSync("./tmp", { recursive: true })
            user.avatar = {
                public_id: mycloud.public_id,
                url: mycloud.secure_url
            }
        }
        await user.save()
        return res.status(200).json({ success: true, message: "profile updated succesfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePassword = async(req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password")

        const { oldPassword, newPassword } = req.body
        if (!oldPassword || !newPassword) {
            return res.status(500).json({ success: false, message: "enter fields" });
        }
        const isMatch = await user.comparePassword(oldPassword)
        if (!isMatch) {
            return res.status(500).json({ success: false, message: "password not found" });
        }

        user.password = newPassword
        await user.save()

        return res.status(500).json({ success: true, message: "password updated succesfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const forgotPassword = async(req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(500).json({ success: false, message: "invalid email" });
        }

        const otp = Math.floor(Math.random() * 100000)
        user.resetPasswordOtp = otp
        user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000
        await user.save()
        await sendMail(email, "reset password", `your OTP is ${otp}`)





        return res.status(500).json({ success: true, message: "otp send to user succesfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const resetPassword = async(req, res) => {
    try {
        const { otp, newPassword } = req.body
        const user = await User.findOne({ resetPasswordOtp: otp, resetPasswordOtpExpiry: { $gt: Date.now() } }).select("+password")
        if (!user) {
            return res.status(500).json({ success: false, message: "invalid otp or expired" });
        }

        user.password = newPassword
        user.resetPasswordOtp = null
        user.resetPasswordOtpExpiry = null
        await user.save()






        return res.status(500).json({ success: true, message: "password updated succesfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};