import jwt from 'jsonwebtoken'
import { User } from "../models/Users.js"

export const isAuthenticated = async(req, res, next) => {
    try {
        const { token } = req.cookies
        if (!token) {
            return res.status(400).json("login first")
        }

        const decoded = jwt.verify(token, process.env.JWT_SEC)
        req.user = await User.findById(decoded._id)
        next()
    } catch (error) {
        res.status(400).json(error)
    }
}