import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

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
        message: `Email has been sent to your email. Follow the instruction to activate your account`,
      });
    })
    .catch((err) => console.log(`Problem sending email: ${err}`));
    return info;
};

export const signup = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).send({
      success: false,
      msg: "All Fields are required",
    });
  }
  try {
    const existingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Username or Email already exists" });
    }
    const token = jwt.sign(
      { username, email, password },
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
        .status(400)
        .json({ message: "User does not exist! Kindly Signup" });
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
    return res.status(200).json({ 
        token,
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
      const {username, email, password}=jwt.decode(token)
      const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
    });
     user.save();
     return res.json({
        message: 'Signup success. Please Signin'
     })
    });
  } else{
    return res.json({
        message: 'Something went wrong. Try again'
    })
  }
};

export const getUser = (req, res) => {};
