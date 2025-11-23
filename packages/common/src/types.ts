import { z } from "zod";

export const CreateUserSchema=z.object({
    email:z.string().min(3).max(20),
    password: z.string(),
    name: z.string(),
    photo: z.string()
})


export const SiginSchema=z.object({
    email:z.string().min(3).max(20),
    password: z.string(),

})

export const createRoomSchema=z.object({
   slug:z.string().min(3).max(10),


})