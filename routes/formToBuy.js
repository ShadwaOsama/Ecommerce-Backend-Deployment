const {Form} = require('../models/formToBuy');
const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require("../middlewares/auth");




router.get(`/`, async (req, res) =>{
    const userList = await Form.find().select('-passwordHash');

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.json(userList);
})

router.get('/:id',auth,restrictTo('Admin'), async(req,res)=>{
    const user = await Form.findById(req.params.id).select('-passwordHash');

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).json(user);
})

router.post('/', async(req, res) => {
const newUser= new Form(req.body);
await newUser.save();

if(!newUser)
return res.status(400).json('the user cannot be created!')

   res.status(201).json({data:{User:newUser}});
})


 module.exports =router;