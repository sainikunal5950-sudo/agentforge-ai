import { Router } from "express"
import { registerUser } from "../controllers/authcontroller";



const router = Router();
// sbse phle jo  bhi  reqst aaygyi voh edr hit kregi bhai 
router.post(
    "/register",
    registerUser
)

export default router;