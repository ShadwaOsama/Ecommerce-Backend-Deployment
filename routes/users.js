const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth, restrictTo } = require("../middlewares/auth");
const {
  getForgotPasswordView,
  sendForgotPasswordLink,
  getResetPasswordView,
  resetThePassword,
} = require("../controllers/passwordController");
const {
  forgotPassword,
  resetPassword,
} = require("../controllers/passwordController");

const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.json(userList);
});

router.get("/:id", auth, restrictTo("Admin"), async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    res
      .status(500)
      .json({ message: "The user with the given ID was not found." });
  }
  res.status(200).json(user);
});

router.post("/", async (req, res) => {
  const newUser = new User(req.body);
  await newUser.save();

  if (!newUser) return res.status(400).json("the user cannot be created!");

  res.status(201).json({ data: { User: newUser } });
});

router.put("/:id", async (req, res) => {
  try {
    const userExist = await User.findById(req.params.id);

    if (!userExist) {
      return res.status(404).json({ message: "User not found" });
    }

    let newPassword = userExist.password;
    if (req.body.password) {
      newPassword = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUserData = {
      name: req.body.name || userExist.name,
      email: req.body.email || userExist.email,
      password: newPassword,
      phone: req.body.phone || userExist.phone,
      isAdmin: req.body.isAdmin !== undefined ? req.body.isAdmin : userExist.isAdmin,
      street: req.body.street || userExist.street,
      apartment: req.body.apartment || userExist.apartment,
      zip: req.body.zip || userExist.zip,
      city: req.body.city || userExist.city,
      country: req.body.country || userExist.country,
    };

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updatedUserData,
      { new: true }
    );

    if (!user) {
      return res.status(400).json({ message: "The user cannot be updated" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// router.post("/login", async (req, res) => {
// const user = await User.findOne({email: req.body.email})
   
//     if(!user) {
//         return res.status(400).json('The user not found');
//     }

//     if(user && bcrypt.compareSync(req.body.password, user.password)) {
//       let token= jwt.sign({data:{email:user.email,id:user._id,role:user.role}},process.env.SECRET)
       
//         res.status(200).json({user: user.email , token: token}) 
//     } else {
//        res.status(400).json('password is wrong!');
//     }

    
// })
router.post('/login', async (req, res) => {
  console.log('Login request received');

  const user = await User.findOne({ email: req.body.email }).select('-password');
  const secret = process.env.secret;

  if (!user) {
    console.log('User not found');
    return res.status(400).json({ msg: 'The user not found' });
  }
  console.log(user)
  if (user && bcrypt.compare(req.body.password, user.password)) {
    

    console.log('Password matched');
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      secret,
      { expiresIn: '1d' }
    );
    
    return res.status(200).json({ user: user, token: token });
  } else {
    console.log('Password is wrong');
    console.log("request",req.body.password);
    console.log("user",user.password);
    return res.status(400).json({ msg: 'Password is wrong!' });
  }
});



router.post("/register", async (req, res) => {
  try {
    const {
      email,
      name,
      password,
      confirmPassword,
      phone,
      postalCode,
      street,
      apartment,
      zip,
      city,
      building,
      landmark,
      country,
    } = req.body;

    // Check if user already exists
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(409).json("Email already exists");
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
    // Hash passwords
    const hashedPassword = await bcrypt.hash(password, 10);
   

    // Create user
    const createUser = await User.create({
      email,
      name,
      phone,
      postalCode,
      street,
      apartment,
      zip,
      city,
      building,
      landmark,
      country,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    res.json(createUser);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
});

router.delete("/:id", auth, (req, res) => {
  User.findByIdAndDelete(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "the user is deleted!" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "user not found!" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});

router.get("/get/count", auth, restrictTo("Admin"), async (req, res) => {
  const userCount = await User.find().count();

  if (!userCount) {
    return res.status(500).json({ success: false });
  }

  res.json({ userCount });
});

// Set up Mailtrap transport
// const authen = {
//   auth: {
//       api_key: process.env.MAILGUN_API_KEY,
//       domain: process.env.MAILGUN_DOMAIN
//   }
// };

// const transporter = nodemailer.createTransport(mg(authen));

// app.post('/forgot-password', (req, res) => {
//   // Get the user's email from the request body
//   const { email } = req.body;

//   // Generate a reset token (e.g., a random string)
//   const resetToken = generateResetToken();

//   // Store the reset token associated with the user's email in your database

//   // Send the reset password email
//   const mailOptions = {
//     from: 'hagergaber799@gmail.com',
//     to: email,
//     subject: 'Reset your password',
//     text: `Please click the following link to reset your password: http://localhost:4029/reset-password/${resetToken}`
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       console.log(error);
//       res.status(500).send('Error sending email');
//     } else {
//       console.log('Email sent: ' + info.response);
//       res.status(200).send('Email sent successfully');
//     }
//   });
// });

// function generateResetToken() {
//   // Implement your own token generation logic
//   return 'your_reset_token';
// }

// router.route("/forgot-password")
// .get(getForgotPasswordView)
// .post(sendForgotPasswordLink)

// router.route("/reset-password/:userId/:token")
// .get(getResetPasswordView)
// .post(resetThePassword)

router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);

router.post('/forgot-password', (req, res) => {
  const {email} = req.body;
  User.findOne({email: email})
  .then(user => {
      if(!user) {
          return res.send({Status: "User not existed"})
      } 
      const token = jwt.sign({id: user._id}, "jwt_secret_key", {expiresIn: "1d"})
      var transporter = nodemailer.createTransport({
          host:process.env.EMAIL_HOST,
          port:587,
          service: 'hotmail',
          auth: {
            user: process.env.Email_username,
            pass: process.env.Email_password
          }
        });
        
        var mailOptions = {
          from: `Cineflix support <${process.env.Email_username}>`,
          to:email,
          subject: 'Reset your password',
          text: `http://localhost:3000/reset_password/${user._id}/${token}`
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            return res.send({Status: "Success"})
          }
        });
  })
})


router.post('/reset-password/:id/:token', (req, res) => {
  const {id, token} = req.params
  const {password} = req.body
  console.log("token", token)
  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
      if(err) {
          return res.json({Status: "Error with token"})
      } else {
          bcrypt.hash(password, 10)
          .then(hash => {
              User.findByIdAndUpdate({_id: id}, {password: hash})
              .then(u => res.send({Status: "Success"}))
              .catch(err => res.send({Status: err}))
          })
          .catch(err => res.send({Status: err}))
      }
  })
})


module.exports = router;
