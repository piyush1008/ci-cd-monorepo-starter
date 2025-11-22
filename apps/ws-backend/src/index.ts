import { WebSocketServer ,WebSocket} from "ws";

import * as jwt from "jsonwebtoken"
import { JWT_SECRET } from "@repo/backend-common/index";
import { prismaclient } from "@repo/db/index";




interface User{
    ws: WebSocket,
    rooms: string[],
    userId: string
}

const users:User[]=[];

const wss =new WebSocketServer({port:8081});

function checkUser(token:string):string | null{
    const decoded=jwt.verify(token, JWT_SECRET)
    console.log(decoded)
    if(typeof decoded ==="string")
    {
        return null;
    }
    if(!decoded  || !(decoded as jwt.JwtPayload).id)
    {
        return null;
    }
    return decoded.id;
}


wss.on("connection",(ws,request)=>{
    console.log("user connnected");
        ///user needs to pass the their token in the websocket server as well 
    const url=request.url;   ///ws://localhost:3000?token=12234
    if(!url)
    {
        return;
    }
    const queryParams=new URLSearchParams(url?.split('?')[1]);
    const token=queryParams?.get('token');


    // const params=new URLSearchParams(url?.split("?")[1]);
    // const token=params.get("token")
    console.log("hii there token", token)
    if(!token){
        ws.close();
        return;
    }

    const userId=checkUser(token);
    console.log('userid', userId)
    if(!userId)
    {
        ws.close();
        return null;
    }
    users.push({
        userId,
        rooms:[],
        ws
    })


    console.log("hi ii there ")

    ws.on("message",async(data)=>{
        let parsedData;
        if (typeof data !== "string") {
          parsedData = JSON.parse(data.toString());
        } else {
          parsedData = JSON.parse(data); // {type: "join-room", roomId: 1}
        }

        console.log("hello here")
        

        if(parsedData.type==="join_room")
        {
            const user=users.find(x=> x.ws===ws);

            user?.rooms.push(parsedData.roomId)
        }

         if (parsedData.type==="leave_room")   //{type:"leave_room",roomId:1}
        {
            const user=users.find(x=> x.ws===ws);
            if(!user)
            {
                return;
            }

            user.rooms=user.rooms.filter(x=> x===parsedData.roomId)

        }

         if(parsedData.type==="chat")
        {
            const roomId=parsedData.roomId;
            const  sendMsg=parsedData.chatmessage;

            console.log("sendMsg", sendMsg)


            await prismaclient.chat.create({
                data:{
                    roomId:Number(roomId),
                    message:sendMsg,
                    userId
                }
            })

            users.forEach(user=>{
                if(user.rooms.includes(roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:sendMsg,
                        roomId
                    }))
                }
            })
            

        }







    })
})