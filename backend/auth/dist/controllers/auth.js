import { TryCatch } from "../utilis/TryCatch.js";
import ErrorHandler from "../utilis/errorHandler.js";
import { sql } from "../utilis/db.js";
import bcrypt from 'bcrypt';
import getBuffer from "../utilis/buffer.js";
import axios from "axios";
import Jwt from "jsonwebtoken";
import { forgotPasswordTemplate } from "../template.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../index.js";
export const registerUser = TryCatch(async (req, res, next) => {
    const { name, email, password, phoneNumber, role, bio } = req.body;
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    if (!name || !email || !password || !phoneNumber || !role) {
        throw new ErrorHandler(400, "please fill all the details");
    }
    const existingUser = await sql `SELECT user_id FROM users WHERE email=${email}`;
    if (existingUser.length > 0) {
        throw new ErrorHandler(409, "Duplicate email address");
    }
    const hashPassword = await bcrypt.hash(password, 10);
    let registeredUser;
    if (role === "recruiter") {
        const file = req.file;
        const [user] = await sql `INSERT INTO users (name,email,password,phone_number,role) VALUES
    (${name},${email},${hashPassword},${phoneNumber},${role}) RETURNING 
    user_id,name,email,phone_number,role,created_at`;
        registeredUser = user;
    }
    else if (role === "jobseeker") {
        const file = req.file;
        if (!file) {
            throw new ErrorHandler(400, "please upload your resume  ");
        }
        const fileBuffer = getBuffer(file);
        if (!fileBuffer || !fileBuffer.content) {
            throw new ErrorHandler(500, "Failed to generate Buffer ");
        }
        // const {data}=await axios.post(`${process.env.UPLOAD_SERVICE}/api/utilsService/upload`, {
        //   buffer: fileBuffer.content,
        // });
        console.log("UPLOAD SERVICE:", process.env.UPLOAD_SERVICE);
        console.log("BUFFER LENGTH:", fileBuffer.content.length);
        let data;
        try {
            const response = await axios.post(`${process.env.UPLOAD_SERVICE}/api/utilsService/upload`, {
                buffer: fileBuffer.content,
            });
            data = response.data;
        }
        catch (err) {
            console.log("❌ AXIOS ERROR:");
            console.log("Status:", err.response?.status);
            console.log("Data:", err.response?.data);
            console.log("Message:", err.message);
            throw new ErrorHandler(500, "Upload service failed");
        }
        const [user] = await sql `INSERT INTO users (name,email,password,phone_number,role,bio,resume, resume_public_id) VALUES
    (${name},${email},${hashPassword},${phoneNumber},${role},${bio},${data.url},${data.public_id}) RETURNING 
    user_id,name,email,phone_number,role,bio,resume,created_at`;
        registeredUser = user;
    }
    const token = Jwt.sign({ id: registeredUser?.user_id }, process.env.JWT_SEC, {
        expiresIn: "15d"
    });
    res.status(201).json({
        success: true,
        user: registeredUser,
        token,
    });
});
export const LoginUser = TryCatch(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ErrorHandler(400, "please fill all the details");
    }
    const user = await sql `

SELECT u.user_id,u.name,u.email,u.password,u.phone_number,u.role,u.bio,u.resume,u.profile_pic,u.subscription,
 ARRAY_AGG(s.name) FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills us ON 
 u.user_id=us.user_id
LEFT JOIN skills s ON us.skill_id=s.skill_id
WHERE u.email= ${email} GROUP BY u.user_id;
`;
    if (user.length === 0) {
        throw new ErrorHandler(400, "invalid credentials");
    }
    const userObject = user[0];
    const matchPassword = await bcrypt.compare(password, userObject.password);
    if (!matchPassword) {
        throw new ErrorHandler(400, "invalid password");
    }
    userObject.skills = userObject.skills || [];
    delete userObject.password;
    const token = Jwt.sign({ id: userObject?.user_id }, process.env.JWT_SEC, {
        expiresIn: "15d"
    });
    res.status(201).json({
        success: true,
        user: userObject,
        token,
    });
});
export const forgetPassword = TryCatch(async (req, res, next) => {
    const { email } = req.body;
    if (!email) {
        throw new ErrorHandler(400, "please provide your email");
    }
    const users = await sql `
    SELECT user_id,email FROM users WHERE email=${email}
  `;
    if (users.length === 0) {
        return res.json({
            message: "If that email exists ,we have sent a reset link",
        });
    }
    const user = users[0];
    // ✅ FIXED ENV NAME
    const resetToken = Jwt.sign({
        email: user.email,
        type: "reset",
    }, process.env.JWT_SEC, // ✅ fixed
    { expiresIn: "15m" });
    const resetLink = `${process.env.Frontend_url}/reset/${resetToken}`;
    await redisClient.set(`forgot:${email}`, resetToken, {
        EX: 15 * 60,
    });
    const message = {
        to: email,
        subject: "Reset Your Password - hireheaven",
        html: forgotPasswordTemplate(resetLink),
    };
    console.log("Publishing mail:", message); // ✅ debug
    await publishToTopic("send-mail", message).catch((err) => {
        console.error("❌ ERROR PUBLISHING MAIL:");
        console.error("Message:", err.message);
    }); // ✅ IMPORTANT
    res.json({
        message: "If that email exists ,we have sent a reset link",
    });
});
export const resetPassword = TryCatch(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    // if (!password || password.length < 6) {
    //   throw new ErrorHandler(400, "Password must be at least 6 characters");
    // }
    let decoded;
    try {
        decoded = Jwt.verify(token, process.env.JWT_SEC);
    }
    catch (error) {
        throw new ErrorHandler(400, "Invalid or expired token");
    }
    if (decoded.type !== "reset") {
        throw new ErrorHandler(400, "Invalid token type");
    }
    const email = decoded.email.toLowerCase();
    const storedToken = await redisClient.get(`forgot:${email}`);
    if (!storedToken || storedToken !== token) {
        throw new ErrorHandler(400, "Expired token");
    }
    const users = await sql `
    SELECT user_id, password FROM users WHERE email=${email}
  `;
    if (users.length === 0) {
        throw new ErrorHandler(404, "User not found");
    }
    const user = users[0];
    const isSame = await bcrypt.compare(password, user.password);
    if (isSame) {
        throw new ErrorHandler(400, "New password cannot be same as old password");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await sql `
    UPDATE users SET password = ${hashedPassword} WHERE user_id = ${user.user_id}
  `;
    await redisClient.del(`forgot:${email}`);
    res.json({
        message: "Password reset successfully",
    });
});
