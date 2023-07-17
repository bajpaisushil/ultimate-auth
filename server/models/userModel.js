import mongoose from "mongoose";

const userSchema=mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minLength: [4, 'Name should have atleast 4 character']
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
    },
    resetPasswordLink: {
        type: String,
        default: ''
    }
}, {timestamps: true})

const User=mongoose.model('User', userSchema);

export default User;
