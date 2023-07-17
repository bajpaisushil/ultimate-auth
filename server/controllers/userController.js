import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import _ from 'lodash';

const sendEmailWithNodemailer = (req, res, emailData) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: `${process.env.EMAIL_FROM}`, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      pass: `${process.env.APP_PASS}`, // MAKE SURE THIS PASSWORD IS YOUR GMAIL APP PASSWORD WHICH YOU GENERATED EARLIER
    },
    tls: {
      ciphers: "SSLv3",
    },
  });

  const info= transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      return res.json({
        message: `Email has been sent to ${emailData.to}. Follow the instruction to activate your account`,
      });
    })
    .catch((err) => console.log(`Problem sending email: ${err}`));
    return info;
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send({
      success: false,
      msg: "All Fields are required",
    });
  }
  try {
    const existingUser = await User.findOne({
      $or: [{ name: name }, { email: email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "name or Email already exists" });
    }
    const token = jwt.sign(
      { name, email, password },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Account Activation Link",
      html: `
            <h1>Please use the following link to activate your account</h1>
            <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
            `,
    };
    console.log(emailData.to);
    sendEmailWithNodemailer(req, res, emailData);
}
catch(err){
    console.log(err.message);
}
}

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      msg: "All Fields are required",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(401)
        .json({ error: "User does not exist! Kindly Signup" });
    }
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid Email or Password" });
    }
    const token = jwt.sign(
      { userId: existingUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );
    let {_id, name}=existingUser;
    return res.status(200).json({ 
        token,
        user: {_id, name, email}
     });

  } catch (error) {
    console.log(error.message);
  }
};

export const accountActivation =async (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async function (err, decoded) {
      if (err) {
        console.log("JWT Verify error: ", err);
        return res.status(401).json({
          error: "Expired Link, Signup again",
        });
      }
      const {name, email, password}=jwt.decode(token)
      const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword,
    });
    try {
      await user.save();
      return res.json({
        message: 'Signup success. Please Login'
      });
    } catch (error) {
      console.log("User save error: ", error);
      return res.status(500).json({
        error: "Failed to save user. Please try again later",
      });
    }
    });
  } else{
    return res.json({
        message: 'Something went wrong. Try again'
    })
  }
};

export const forgotPassword=async (req, res)=>{
  const {email}=req.body;
  const user=await User.findOne({email});
  const token = jwt.sign(
    { _id: user._id, name: user.name },
    process.env.RESET_PASSWORD,
    {
      expiresIn: "10m",
    }
  );
  try {
    await user.updateOne({resetPasswordLink: token});
  } catch (error) {
    console.log(error);
  }
  
  const emailData = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Password Reset Link",
    html: `
          <h1>Please use the following link to reset your password</h1>
          <h2>Link valid for 10 minutes only</h2>
          <hr />
          <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
          `,
  };
  console.log(emailData.to);
  sendEmailWithNodemailer(req, res, emailData);
}

export const resetPassword=async (req, res)=>{
  const {resetPasswordLink, newPassword}=req.body;
  if(resetPasswordLink){
    jwt.verify(resetPasswordLink, process.env.RESET_PASSWORD, async function(err, decoded){
      if(err){
        return res.status(400).json({
          error: 'Expired Link. Try again'
        })
      }
      let user=await User.findOne({resetPasswordLink})
      const newPasswordHashed=await bcrypt.hash(newPassword, 10);
      const updatedFields={
        password: newPasswordHashed,
        resetPasswordLink: ''
      }
      // console.log(user);
      user=_.extend(user, updatedFields);
      // console.log(user);
      await user.save();
        res.json({
          message: 'Great! You can now login with your new password'
        })
    })
  }
}




export const getUser = (req, res) => {};

