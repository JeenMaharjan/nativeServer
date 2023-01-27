import express from 'express'
import { addTask, forgotPassword, getMyProfile, login, logout, register, removeTask, resetPassword, updatePassword, updateProfile, updateTask, verify } from '../controller/user.js'
import { isAuthenticated } from '../middleware/auth.js'

const router = express.Router()

router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(logout)
router.route("/me").get(isAuthenticated, getMyProfile)
router.route("/verify").post(isAuthenticated, verify)
router.route("/updateprofile").put(isAuthenticated, updateProfile)
router.route("/updatepassword").put(isAuthenticated, updatePassword)
router.route("/newtask").post(isAuthenticated, addTask)
router.route("/forgotpassword").post(forgotPassword)
router.route("/resetPassword").put(resetPassword)
router.route("/task/:taskId").get(isAuthenticated, updateTask).delete(isAuthenticated, removeTask)

export default router