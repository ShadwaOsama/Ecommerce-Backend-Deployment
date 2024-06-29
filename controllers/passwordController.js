// const asyncHandler = require("express-async-handler")
const { User } = require("../models/user");
const sendEmail = require("./email");
const crypto = require("crypto");
const signToken = require("./signToken");

// const jwt = require("jsonwebtoken")
// const bcrypt = require("bcryptjs")
// const nodemailer=require("nodemailer")

// module.exports.getForgotPasswordView= asyncHandler((req,res) =>{
//     res.render('forgot-password')
// })

// module.exports.sendForgotPasswordLink= asyncHandler(async (req,res) =>{
//     const user = await User.findOne({email: req.body.email})
//     if(!user) {
//         return res.status(400).json('The user not found');
//     }

//     const secret = process.env.JWT_SECRET_KEY + user.password;
//         const token = jwt.sign(
//             {
//                 email: user.email,
//                 id:user.id,
//             },
//             secret,
//             {expiresIn : '1d'}
//         )
//         const link =`http://localhost:4029/password/reset-password/${user._id}/${token}`;

//         const transporter = nodemailer.createTransport({
//                 service: 'gmail',
//                 auth: {
//                   user:process.env.USER_EMAIL,
//                   pass:process.env.USER_PASS
//                 }
//               });

//               const mailOptions = {
//                 from:process.env.USER_EMAIL,
//                 to: user.email,
//                 subject: 'Reset Password Link',
//                 html:`<div>
//                 <h4>click on the link to reset password</h4>
//                 <p>${link}</p>
//                 </div>`
//               };

//               transporter.sendMail(mailOptions,function(error,success){
//                 if(error){
//                     console.log(error)
//                 }else{
//                     console.log("Email sent: " + success.response)
//                 }
//               });

//               res.send("link-send")

// })

// module.exports.getResetPasswordView= asyncHandler(async (req,res) =>{
//     const user = await User.findById(req.params.userId)
//     if(!user) {
//         return res.status(400).json('The user not found');
//     }

//     const secret = process.env.JWT_SECRET_KEY + user.password;

//     try{
//         jwt.verify(req.params.token, secret)
//         res.render('reset-password', {email: user.email})

//     }catch(error){
//         console.log(error)
//         res.json({message:"Error"})

//     }

// })

// module.exports.resetThePassword= asyncHandler(async (req,res) =>{
//     const user = await User.findById(req.params.userId)
//     if(!user) {
//         return res.status(400).json('The user not found');
//     }

//     const secret = process.env.JWT_SECRET_KEY + user.password;

//     try{
//         jwt.verify(req.params.token, secret)
//         const salt = await bcrypt.genSalt(10)
//         req.body.password= await bcrypt.hash(req.body.password,salt)
//         user.password=req.body.password

//         await user.save()
//         res.render('success-password')

//     }catch(error){
//         console.log(error)
//         res.json({message:"Error"})

//     }

// })

// const asyncErrorHandler = require('./asyncHandler');

// module.exports.forgotPassword= async(req,res,next)=>{
//     const user =await User.findOne({email:req.body.email})

//     if(!user){
//         const error = new CustomError('we could not find the user',404)
//         next(error)
//     }

//     const resetToken =user.createResetPasswordToken()
//     await user.save({validateBeforeSave:false})

// }

// module.exports.forgotPassword = async (req, res, next) => {
//     try {
//       const user = await User.findOne({ email: req.body.email });

//       if (!user) {
//         const error = new CustomError('we could not find the user', 404);
//         return next(error);
//       }

//       const resetToken = user.createResetPasswordToken();
//       await user.save({ validateBeforeSave: false });
//       const restUrl = `http://localhost:4029/api/users/resetPassword/${resetToken}`
//       const message = `we haver a password reset request to the below link \n\n${restUrl}\n\n`
//       try{
//         await sendEmail({
//           email:user.email,
//           subject:'Password change request received',
//           message:message
//          })

//          res.status(200).json({
//           status:'success',
//           message:'password reset link send to the user email'
//          })

//       }catch(err){
//         user.passwordResetToken= undefined;
//         user.passwordResetTokenExpires= undefined;
//         user.save({validateBeforeSave:false})
//         return next()

//       }

//       // Send the reset password email or do any other necessary actions
//       res.status(200).json({
//         status: 'success',
//         message: 'Reset password instructions have been sent to your email',
//       });
//     } catch (err) {
//       next(err);
//     }
//   };

// module.exports.resetPassword=(req,res,next) =>{

// }

module.exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      const error = new CustomError("We could not find the user", 404);
      return next(error);
    }

    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `http://localhost:4029/api/users/resetPassword/${resetToken}`;
    const message = `We have a password reset request to the below link:\n\n${resetUrl}\n\n`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password change request received",
        message: message,
      });

      res.status(200).json({
        status: "success",
        message: "Password reset link sent to the user email",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return next(err);
    }
  } catch (err) {
    next(err);
  }
};

// module.exports.resetPassword= async(req,res,next) =>{
//   const token = crypto.createHash('sha256').update(req.params.token).digest('hex')
//    const user=await User.findOne({passwordResetToken:token,passwordResetTokenExpires:{$gt:Date.now()}})
//    if(!user){
//     const error = new CustomError('token is invalid or has expired',400)
//     next(error)
//    }

//    user.password= req.body.password;
//    user.confirmPassword=req.body.confirmPassword;
//    user.passwordResetToken=undefined;
//    user.passwordResetTokenExpires-undefined;
//    user.passwordChangedAt=Date.now();
//    user.save();
//    const loginToken = signToken(user._id)
//    res.status(200).json({
//     status:'success',
//     token:loginToken
//    })
//   }

module.exports.resetPassword = async (req, res, next) => {
  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new CustomError("Token is invalid or has expired", 400);
    return next(error);
  }

  // Check if the email address has changed
  const emailChanged = user.email !== req.body.email;

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.email = req.body.email;
  user.passwordResetToken = null;
  user.passwordResetTokenExpires = null;
  user.passwordChangedAt = Date.now();

  try {
    // Only run the email validation if the email has changed
    if (emailChanged) {
      await user.save();
    } else {
      // Save the user without running the email validation
      await user.save({ validateBeforeSave: false });
    }

    const loginToken = signToken(user._id);
    res.status(200).json({
      status: "success",
      token: loginToken,
    });
  } catch (err) {
    next(err);
  }
};

// module.exports.updatePassword = async(req, res, next) =>{
//   const user = await User.findById(req.user._id).select('+password')
//   if()
// }
