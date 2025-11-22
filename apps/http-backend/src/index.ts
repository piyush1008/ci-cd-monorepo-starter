import express from "express";
import cors from "cors"
const app=express();
import bcrypt from "bcrypt"

import * as jwt from "jsonwebtoken";
import { authMiddleware } from "./auth.js";
import { JWT_SECRET } from "@repo/backend-common/index";

import {CreateUserSchema,SiginSchema,createRoomSchema} from "@repo/common/types"
import { prismaclient } from "@repo/db/index";

// import {prismaclient} from "@repo/db/index"




app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    return res.json({
        message: "server is running"
    })
})


app.post("/signup",async(req,res)=>{
    try {

        const data=CreateUserSchema.safeParse(req.body);
        if(!data.success)
        {
            return res.json({
                message: "Incorrect inputs"
            })
        }
        console.log("hiti here")
        const {email, password,name,photo}=req.body;
        //check in the db whether the user already exist or not 

        console.log("hii there ")
        const existingUser=await prismaclient.user.findFirst({
            where:{
                email,
                password
            }   
        })

        if(existingUser)
        {
            return res.status(401).json({
                message:"user already exist"
            })
        }

        const hashpassword=await bcrypt.hash(password,10);


        const newuser=await prismaclient.user.create({
            data:{
                email,
                password:hashpassword,
                name,
                photo

            }
        })


        


        //save the user details in the db

        return res.status(200).json({
            message:"User signup successfully",
            id:newuser.id
        })



    } catch (error:any) {
        return res.status(500).json({
            message: error.message
        })
    }
})



app.post("/signin",async(req,res)=>{
    try {
        const data=SiginSchema.safeParse(req.body);
        if(!data.success)
        {
            return res.json({
                message: "Incorrect inputs"
            })
        }
        const {email, password}=req.body;
 

        console.log("email is ", email);
        console.log("password is ", password)

        const exisitinguser=await prismaclient.user.findFirst({
            where:{
                email
            }
        })

        if(!exisitinguser)
        {
            return res.status(401).json({
                message:"user does not exist"
            })
        }
        
        const hashpassword=await bcrypt.compare(password,exisitinguser?.password);

        if(!hashpassword)
        {
            return res.status(404).json({
                message:"Please provide the valid credentials"
            })
        }

        const token=jwt.sign({id:exisitinguser.id},JWT_SECRET);

        return res.status(200).json({
            message:"user signin successfully",
            token
        })


        //save the user details in the db



    } catch (error:any) {
        return res.status(500).json({
            message: error.message
        })
    }
})
//create the room
app.post("/room",authMiddleware,async(req,res)=>{
    try {
        const parsedata=createRoomSchema.safeParse(req.body);
        if(!parsedata.success)
        {
            return res.json({
                message: "Incorrect inputs"
            })
        }
        // const {slug}=req.body;
    
         //@ts-ignore
         const userId=req.userId;
    
       const room= await prismaclient.room.create({
            data:{
                slug:parsedata.data.slug,
                adminId:userId
            }
        })
    
    
        return res.status(200).json({
            message:"room  is created successfully",
            roomid: room.id
        })
    } catch (error:any) {
        return res.status(500).json({
            message:error.message
        })
    }
})

//getting last 50 chats
app.get("/chats/:roomId",authMiddleware,async(req,res)=>{
    try {
        const roomID=parseInt(req.params.roomId)

        //@ts-ignore
        const userId=req.userId;

       const messages= await prismaclient.chat.findMany({
            where:{
                roomId:roomID
            },
            orderBy:{
                id:"desc"
            },
            take:50

        })

        return res.json({
            messages
        })
    } catch (error) {
        
    }
})


//get the roomid 
app.get("/room/:slug",authMiddleware,async(req,res)=>{
    try {
        const slug=req.params.slug

        //@ts-ignore
        const userId=req.userId;

       const room= await prismaclient.room.findFirst({
            where:{
                slug
            }
        })

        return res.json({
            id:room?.id
        })
    } catch (error) {
        
    }
})

app.listen(8000);