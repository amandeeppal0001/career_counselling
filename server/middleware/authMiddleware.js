import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import  User  from "../models/user.js";


 const verifyJWT = asyncHandler(async(req, res, next) => {

    console.log(req.cookies);
    console.log("=== JWT VERIFICATION DEBUG ===");
    console.log("Cookies received:", req.cookies);
    console.log("Headers:", req.headers);
    try {
         const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    console.log("Token found:", token ? "YES" : "NO");

         if (!token){
            console.log("❌ No token found in cookies or headers");
            throw new ApiError(401,"Unauthorized request")
         }


        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log("Token decoded successfully:", decodedToken);
        const user = await User.findById(decodedToken?._id).select
        ("-password -refreshToken")

        if (!user){

            console.log("❌ User not found for token");
            throw new ApiError(401,"Invalid Access Token")
        }
         console.log("✅ User authenticated:", user._id);
        req.user = user;
        next()
    } catch (error) {
         console.log("❌ JWT verification failed:", error.message);
        throw new ApiError(401, error?.message || "Invalid access token")
    }

})


export default verifyJWT










































