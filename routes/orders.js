

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
