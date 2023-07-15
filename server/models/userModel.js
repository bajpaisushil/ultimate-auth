import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'This Username is already taken']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: [5, 'Atleast 5 letters should be there in password']
    }
})

const User=mongoose.model('User', userSchema);

export default User;
