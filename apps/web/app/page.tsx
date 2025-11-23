"use client";

import { useRouter } from "next/navigation";
import { useState } from "react"

export default function Home(){

  const [roomId, setRoomId]=useState("");
  const router=useRouter();
  return(
    <div className="flex w-screen h-screen justify-center items-center">
      <div>
        hello
        <input className="border-1 rounded-xl p-1" value={roomId} onChange={(e)=>{
            setRoomId(e.target.value)
        }} type="text" placeholder="Room id"></input>

        <button className="border-1 rounded-xl p-1 hover:bg-gray-500" onClick={()=>{
            router.push("/room/"+roomId)
        }}>Join Room</button>

        Hii piyush
      </div>
    </div>
  )
}