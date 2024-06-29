const express = require('express');
const router = express.Router();
const { Offer } = require('../models/offer');
const { Product } = require('../models/product');



router.get(`/`, async (req, res) =>{
    const currentOffers = await Offer.find();

    if(!currentOffers) {
        res.status(500).json({success: false})
    } 
    res.status(200).json(currentOffers);
})


router.post('/', async (req,res)=>{
    const { productId, discountPercentage, startDate, endDate } = req.body;

    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);
    let offer = new Offer({
        product: productId,
      discountPercentage,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    })
    offer = await offer.save();

    if(!offer)
    return res.status(400).json('the category cannot be created!')

    res.json(offer);
})


module.exports = router;






