import express from 'express';
import { connectToDB } from './config/db.js';
import { config } from 'dotenv';
import userRoutes from './routes/userRoute.js';
import bodyParser from 'body-parser';
const app=express();
config();
connectToDB();
app.use(bodyParser.json());
app.use('/ping', (req, res)=>{
    res.json(`<h1>Pong</h1>`)
});
app.use('/user', userRoutes);



app.listen(process.env.PORT, ()=>{
    console.log(`Server running on Port: ${process.env.PORT}`);
})
