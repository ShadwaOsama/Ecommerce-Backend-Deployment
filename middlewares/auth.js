// const jwt = require('jsonwebtoken')
// let {promisify} = require('util')


// async function auth(req, res, next) {
//     let { authorization } = req.headers;
  
//     if (!authorization) {
//       return res.status(401).json({ message: 'Unauthenticated, you must login first' });
//     }
  
//     // Ensure the token starts with "Bearer "
//     if (!authorization.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Invalid token format' });
//     }
  
//     // Remove "Bearer " from the authorization header to get the token
//     const token = authorization.split(' ')[1];
  
//     try {
//       // Verify the token
//       const decoded = await promisify(jwt.verify)(token, process.env.secret);
//       console.log(decoded);
//       req.id = decoded.userId;
//       req.role = decoded.role;
//       next();
//     } catch (err) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//   }
// function restrictTo(...roles){
//     return(req,res,next)=>{
//         if(!roles.includes(req.role)){
//             return res.status(403).json({message:'you dont have permission to perform this action'})
//         }
//         next()
//     }
// }

// module.exports={auth,restrictTo}




const jwt = require("jsonwebtoken");

// function auth(req, res, next) {
//     let token = req.headers.authorization;
//     if (!token) {
//       return res.status(401).json({ message: "Please login" });
//     }
  
//     token = token.split(' ')[1]; // Extract token from 'Bearer <token>'
  
//     try {
//       let decode = jwt.verify(token, process.env.secret);
//       req.body.userId = decode.data.id;
//       next();
//     } catch (error) {
//       console.error("Token verification error:", error);
//       res.status(401).json({ message: "Invalid or expired token" });
//     }
// }

function auth(req,res,next){
  let {authorization} =req.headers;
  if(!authorization){
    return  res.json({message:"Please login"})
  }
  try{
      let decode = jwt.verify(authorization,process.env.SECRET);
      // req.id=decode.data.id;
     //  req.role=decode.data.role;
      req.user = decode.data; 
      next()
  }   catch(error){
      res.json({message: error.message});
  } 

}

function restrictTo(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res
        .status(401)
        .json({ message: "You are not authorized to view this resource" });
    }
    next();
  };
}
module.exports = { auth, restrictTo };

// const jwt = require('jsonwebtoken')
// let {promisify} = require('util')

// async function auth(req,res,next){
//     let{authorization}=req.headers
//     if(! authorization){
//         return res.status(401).json({message:'unauthenticated,you must login first'})
//     }
//        let decoded=await promisify(jwt.verify)(authorization,process.env.secret)
//        console.log(decoded)
//        req.id=decoded.userId
//        req.role=decoded.role
//     next()
// }

// function restrictTo(...roles){
//     return(req,res,next)=>{
//         if(!roles.includes(req.role)){
//             return res.status(403).json({message:'you dont have permission to perform this action'})
//         }
//         next()
//     }
// }

// module.exports={auth,restrictTo}
