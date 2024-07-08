
const {Order} = require('../models/order');
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const express = require('express');
const { OrderItem } = require('../models/order-item');
const {User} = require('../models/user')
const router = express.Router();
const { auth, restrictTo } = require("../middlewares/auth");

// router.post('/add', auth, async (req, res) => {
//     try {
//         const orderItems = req.body.orderItems; // Assuming orderItems are provided in the request body

//         // Step 1: Create Order Items
//         const createdOrderItems = await Promise.all(
//             orderItems.map(async (orderItem) => {
//                 let newOrderItem = new OrderItem({
//                     quantity: orderItem.quantity,
//                     product: orderItem.product
//                 });
//                 newOrderItem = await newOrderItem.save();
//                 return newOrderItem._id;
//             })
//         );

//         // Step 2: Calculate Total Price
//         const totalPrices = await Promise.all(
//             createdOrderItems.map(async (orderItemId) => {
//                 const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
//                 return orderItem.product.price * orderItem.quantity;
//             })
//         );
//         const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

//         // Step 3: Create Order
//         let order = new Order({
//             orderItems: createdOrderItems,
//             shippingAddress1: req.body.shippingAddress1,
//             shippingAddress2: req.body.shippingAddress2,
//             city: req.body.city,
//             zip: req.body.zip,
//             country: req.body.country,
//             phone: req.body.phone,
//             status: req.body.status || 'Pending', // Default to 'Pending' if not provided
//             totalPrice: totalPrice,
//             user: req.user._id // Assuming req.user._id is set by your authentication middleware
//         });

//         order = await order.save();

//         if (!order) {
//             return res.status(400).json({ message: 'The order cannot be created!' });
//         }

//         res.status(201).json(order); // Return created order
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });



router.get('/',auth, async (req, res) => {
    try {
        console.log('bbbvbvbvbvbvcb')
        const orderList = await Order.find().populate(['orderItems','user']).sort({'dateOrdered': -1});
        //const orderList = await OrderItem.find();

    if(!orderList) {
        res.status(401).json({message: "order not found"})
    } 
    res.status(200).json(orderList);
    } catch (error) {
        res.status(500).json({message:"noooooooooo"})
    }
})

router.get('/:id', auth, restrictTo('Admin'), async (req, res) =>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')
    .populate({ 
        path: 'orderItems', populate: {
            path : 'product', populate: 'category'} 
        });

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.json(order);
})

// router.post('/add',auth,async (req,res)=>{
//     const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) =>{
//         let newOrderItem = new OrderItem({
//             quantity: orderItem.quantity,
//             product: orderItem.product
//         })

//         newOrderItem = await newOrderItem.save();

//         return newOrderItem._id;
//     }))
//     const orderItemsIdsResolved =  await orderItemsIds;

//     const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId)=>{
//         const orderItem = await OrderItem.findById(orderItemId).populate('product','price');
//         const totalPrice = orderItem.product.price * orderItem.quantity;
//         return totalPrice

//     }))

//     const totalPrice = totalPrices.reduce((a,b) => a +b , 0);
    
//     let order = new Order({
//         orderItems: orderItemsIdsResolved,
//         shippingAddress1: req.body.shippingAddress1,
//         shippingAddress2: req.body.shippingAddress2,
//         city: req.body.city,
//         zip: req.body.zip,
//         country: req.body.country,
//         phone: req.body.phone,
//         status: req.body.status,
//         totalPrice: totalPrice,
//         user: req.body.user,
//     })
//     order = await order.save();

//     if(!order)
//     return res.status(400).json('the order cannot be created!')

//     res.json(order);
// })




router.patch('/:id',async (req, res)=> {
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true}
    )

    if(!order)
    return res.status(400).json('the order cannot be update!')

    res.json(order);
})


router.delete('/:id',auth, (req, res)=>{
    Order.findByIdAndDelete(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndDelete(orderItem)
            })
            return res.status(200).json({success: true, message: 'the order is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "order not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get('/get/totalsales',auth,restrictTo('Admin'), async (req, res)=> {
    const totalSales= await Order.aggregate([
        { $group: { _id: null , totalsales : { $sum : '$totalPrice'}}}
    ])

    if(!totalSales) {
        return res.status(400).json('The order sales cannot be generated')
    }

    res.json({totalsales: totalSales.pop().totalsales})
})


router.get("/get/count",auth,restrictTo('Admin'), async (req, res) => {
    const orderCount = await Order.find().count();
  
    if (!orderCount) {
      return res.status(500).json({ success: false });
    }
  
    res.json({ orderCount });
  });

  router.get('/get/userorders/:userid', auth, async (req, res) => {
    try {
        const userOrderList = await Order.find({ userId: req.params.userid })
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'productId',
                    model:'Product',
                    populate: {
                        path: 'category'
                    }
                }
            })
            .sort({ 'dateOrdered': -1 });

        if (!userOrderList) {
            return res.status(404).json({ success: false, message: 'No orders found for this user.' });
        }

        res.json(userOrderList);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// router.post('/postOrderByUserId/:userID', auth, async (req, res) => {
//     try {
//         console.log("Request received:", req.body);
//         const { orders } = req.body;

//         if (!orders || !orders.orderItems || orders.orderItems.length === 0) {
//             console.log("No order items provided");
//             return res.status(400).json({ message: 'Order items are required.' });
//         }

//         // Step 1: Validate Order Items
//         const validOrderItems = await Promise.all(
//             orders.orderItems.map(async (orderItemId) => {
//                 const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
//                 if (!orderItem) {
//                     throw new Error(`Order item ${orderItemId} not found`);
//                 }
//                 return orderItem;
//             })
//         );
//         console.log("Validated Order Items:", validOrderItems);

//         // Step 2: Calculate Total Price
//         const totalPrice = validOrderItems.reduce((sum, orderItem) => {
//             return sum + (orderItem.product.price * orderItem.quantity);
//         }, 0);
//         console.log("Total Price:", totalPrice);

//         // Step 3: Create Order
//         let order = new Order({
//             orderItems: validOrderItems.map(item => item._id),
//             status: orders.status || 'Pending',
//             totalPrice: orders.totalPrice || totalPrice,
//             userId: req.params.userID
//         });

//         order = await order.save();
//         console.log(order)
//         if (!order) {
//             return res.status(400).json({ message: 'The order cannot be created!' });
//         }
//         console.log("Order created:", order);

//         // Step 4: Update User's Orders Array
//         const user = await User.findById(req.params.userID);
//         console.log('hhhhhh',user)
//         if (!user) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         user.orders.push(order._id);
//         await user.save();

//         res.status(201).json(order); // Return created order
//     } catch (error) {
//         console.error('Error creating order:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// Create Order
// router.post('/makeorder', async (req, res) => {
//     const { userId, orderItems } = req.body;

//     // Validate userId and orderItems
//     if (!userId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
//         return res.status(400).json({ error: 'Invalid order data' });
//     }

//     // Validate that user exists
//     const user = await User.findById(userId);
//     if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//     }

//     // Validate that all products exist and calculate total price
   
//     for (let item of orderItems) {
//         const product = await Product.findById(item.productId);
//         if (!product) {
//             return res.status(404).json({ error: `Product with id ${item.productId} not found` });
//         }
      
//     }

//     // Create the order
//     const order = new Order({
//         userId,
//         orderItems,
//     });

//     try {
//         const savedOrder = await order.save();
//         res.status(201).json(savedOrder);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });
// Create Order


router.post('/makeOrder', async (req, res) => {
const { userId, orderItems } = req.body;
console.log(userId);
console.log(orderItems);
console.log(!userId );
console.log( !Array.isArray(orderItems)  );
console.log(orderItems.length === 0);
console.log(!orderItems );


    if (!userId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
        
        return res.status(400).json({ error: 'Invalid order data' });
    }
 
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const validatedOrderItems = [];
    for (let item of orderItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
            return res.status(404).json({ error: `Product with id ${item.productId} not found` });
        }
        validatedOrderItems.push({
            productId: item.productId,
            quantity: item.quantity,
        });
    }

    const order = new Order({
        userId,
        orderItems: validatedOrderItems,
    });

    try {
        const savedOrder = await order.save();
        res.status(201).json(savedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// router.get('/getOrderByUserId/:userID', auth, async (req, res) => {
//     try {
//         const orders = await Order.find({ userId: req.params.userID }).populate('orderItems');

//         if (!orders) {
//             return res.status(404).json({ message: 'No orders found for this user.' });
//         }

//         res.status(200).json(orders);
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });
// router.post('/save', async (req, res) => {
//     console.log('Request body:', req.body); // Log entire request body

//     const {
//         userId,
//         orderItems,
//     } = req.body.orders;

//     console.log('Extracted orderItems:', orderItems); // Log extracted order items

//     try {
//         if (!orderItems || orderItems.length === 0) {
//             console.log('Order items missing or empty'); // Additional logging
//             return res.status(400).json({ message: 'Order items are required.' });
//         }

//         // Ensure all order items exist
//         const orderItemsExist = await OrderItem.find({ _id: { $in: orderItems } });
//         console.log('Order items found:', orderItemsExist); // Log found order items
//         if (orderItemsExist.length !== orderItems.length) {
//             return res.status(400).json({ message: 'Some order items do not exist' });
//         }

//         // Ensure user exists
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(400).json({ message: 'User does not exist' });
//         }

//         const newOrder = new Order({
//             userId,
//             orderItems,
//         });

//         const savedOrder = await newOrder.save();
//         console.log('Saved order:', savedOrder); // Log saved order

//         // Add the order to the user's orders list
//         user.orders.push(savedOrder._id);
//         await user.save();

//         res.status(201).json(savedOrder);
//     } catch (err) {
//         console.error('Error:', err.message); // Log the error
//         res.status(500).json({ error: err.message });
//     }
// });



module.exports =router;
