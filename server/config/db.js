import mongoose from "mongoose";

export const connectToDB=()=> {
    mongoose.connect(process.env.DB_URL)
.then((conn)=>{
    console.log(`Connected to DB: `, conn.connection.host)
})
.catch((err)=> {
    console.log(`DB Connection Failed`)
})
}
