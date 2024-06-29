const {Category} = require('../models/category');
const { Product } = require("../models/product");
const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require("../middlewares/auth");


router.get('/search', async (req, res) => {
    try {
        console.log('gggggggg')
      const { name } = req.query;
  
      if (!name) {
        return res.status(400).json({ message: 'Category name is required' });
      }
  
      // Fetch the category by name
      const category = await Category.findOne({ name });
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Fetch the products that belong to the category
      const products = await Product.find({ category: category._id });
  
      res.json(products);
    } catch (error) {
      console.error('Error fetching category or products:', error);
      res.status(500).json({ message: error.message });
    }
  });

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).json(categoryList);
})

router.get('/:id', async(req,res)=>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({message: 'The category with the given ID was not found.'})
    } 
    res.status(200).json(category);
})



router.post('/', async (req,res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    })
    category = await category.save();

    if(!category)
    return res.status(400).json('the category cannot be created!')

    res.json(category);
})


router.patch('/:id',async (req, res)=> {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon || category.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!category)
    return res.status(400).json('the category cannot be created!')

    res.json(category);
})

router.delete('/:id',auth,restrictTo('user'), (req, res)=>{
    Category.findByIdAndDelete(req.params.id).then(category =>{
        if(category) {
            return res.status(200).json({success: true, message: 'the category is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "category not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get('/:categoryName/products', async (req, res) => {
    try {
      // Fetch the category by name
      const category = await Category.findOne({ name: req.params.categoryName });
  
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
  
      // Fetch the products that belong to the category
      const products = await Product.find({ category: category.id });
  
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });


  
module.exports =router;