import { Router } from "express"
import { registerUser, verifyUser } from "../controllers/authcontroller";



const router = Router();
// sbse phle jo  bhi  reqst aaygyi voh edr hit kregi bhai 
router.post(
    "/register",
    registerUser
)
router.post("/verify-code", verifyUser);

export default router;