import User  from '../models/user.js';
import { GoogleGenAI } from '@google/genai';


import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import {json} from "express";
import { asyncHandler } from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import UserProfile from '../models/UserProfile.js';


const generateAccessAndRefereshTokens = async(userId) =>{
    try{
        const user = await User.findById(userId)    
        const accessToken = user.generateAccessToken() 
        console.log(accessToken)
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken   
        await user.save({ validateBeforeSave: false })   
     return {accessToken, refreshToken}  
    }

    catch(error) {
        console.log(error);
        throw new ApiError(500, "something went wrong while generating access token & refresh token",error) 
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    
    const { name, email, password, role } = req.body; 
    
    if([name, email, password, role].some(field => field?.trim() === "")) { 
        throw new ApiError(400, "All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'This email is already registered. Please use a different email or try logging in.' });
    }
    
    
    const user = await User.create({ name, email, password, role }); 
    
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }
    
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

   const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax" 
};

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                }
            )
        );
});



















export const createOrUpdateProfile = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    console.log("userId from JWT:", userId);

    if (!userId) {
        throw new ApiError(401, "Unauthorized: No user ID provided.");
    }


    const updatedProfile = await UserProfile.findOneAndUpdate(
        { userId: userId }, 
        { ...req.body, userId: userId }, 
        {
            new: true, 
            upsert: true, 
            runValidators: true 
        }
    );

    if (!updatedProfile) {
        throw new ApiError(404, "Profile could not be found or created.");
    }

    res.status(200).json(new ApiResponse(200, updatedProfile, "Profile updated successfully."));
});
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
    if(!email){
    throw new ApiError(400, "email is required")
  }
  
    let user = await User.findOne({ email });
    
    
    
    
    
    
    
    
    
    

        if (!user) {
       throw  new ApiError(404,"User does not exist")
    }
      const isPasswordValid = await user.matchPassword(password)
    if(!isPasswordValid){   
        throw new ApiError(401, "Invalid credentials")
    }
    
        const {accessToken,refreshToken}= await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

       const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax" 
};





     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie( "refreshToken", refreshToken, options)
     .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken, refreshToken
            }
        )
     )




});


 export const registerCounselor = asyncHandler(async (req, res) => {
  const { name, email, password, role, specializations, bio, availability } = req.body;
        if([name,email, password ].some((field)=>
    field?.trim() === "")) {
        throw new ApiError(400, "all fields are required")
    }
    let existedUser = await User.findOne({ email });
    if(existedUser){
        throw new ApiError(409, " user with this email or userName  already exists")
    }

  const user = await User.create({ name, email, password, role: "counselor" });
  const createdUser = await User.findById(user._id).select("-password -refreshToken")

      if(!createdUser){
        throw new ApiError(500, "something went wrong while registering user")
      }

  const counselor = await Counselor.create({
    user: user._id,
    specializations,
    bio,
    availability
  });

  res.status(201).json(new ApiResponse(201, { user, counselor }, "Counselor registered successfully"));
});

export const logoutUser = asyncHandler(async (req, res) => {
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { 
                 refreshToken: 1   
            },
        },
        {
            new: true, 
        }
    );

    
    const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax" 
};

    
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export const getProfile = asyncHandler(  async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await UserProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) });

    if (!profile) {
      console.log("No profile found for userId:", userId);
      return res.status(404).json({ message: 'Profile not found' });
    }

    console.log("Fetched profile from DB:", profile);
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export const refreshAccessToken = asyncHandler(async(req, res) => {
const incomingRefreshToken = req.cookies.
refreshToken || req.body.refreshToken 

if(!incomingRefreshToken){
    throw new ApiError(401, "unauthorized request")
}
try {
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    )


    const user = await User.findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401, "Invalid refresh token")
    }
    
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
    }
    
        const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax" 
};
    
         const {accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
    
         return res.status(200)
         .cookie("accessToken", accessToken, options)
         .cookie("refreshToken", refreshToken, options)
         .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: refreshToken},
                "Access token is refreshed"
            )
         )
} catch (error) {
    throw new ApiError(401, error?.message || 
        "Invalid refresh token"
    )
}
})































const ai = new GoogleGenAI({});


export const generateRoadmap = asyncHandler(async (req, res) => {

    const userId = req.user._id;


    const userProfile = await UserProfile.findOne({ userId: userId });

    if (!userProfile) {
        throw new ApiError(404, "Please complete your profile to generate a roadmap.");
    }


    const profileText = `
        User Profile:
        - Current Grade/Level: ${userProfile.grade}
        - Stream: ${userProfile.stream}
        - Strong Subjects: ${userProfile.strongSubjects.join(', ')}
        - Interests: ${userProfile.interests.join(', ')}
        - Career Goals: ${userProfile.careerGoals}
        - Hobbies: ${userProfile.hobbies.join(', ')}
    `;

    const prompt = `
        Based on the following student profile, act as a professional career counselor. 
        Generate a detailed, step-by-step 3-year career roadmap. 
        The roadmap must include:
        1. Short-Term Goals (6 months): Focus on skill development and research.
        2. Mid-Term Goals (1-2 years): Focus on college applications, entrance exams, and networking.
        3. Long-Term Goals (3 years): Focus on early career steps or graduation preparation.

        Format the response clearly and concisely for easy reading.
        ${profileText}
    `;


    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt
    });

    const roadmapText = response.text;


    res.status(200).json(new ApiResponse(200, { roadmap: roadmapText }, "Career roadmap generated successfully."));
});