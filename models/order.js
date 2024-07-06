const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Ensures that userId is always provided
    },
    orderItems: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true, 
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        }
    }],
    status: {
        type: String,
        required: true,
        default: 'Pending',
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0, // Default value in case it's not provided
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for id
orderSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Pre-save hook to calculate totalPrice
orderSchema.pre('save', async function(next) {
    const Order = this;
    let totalPrice = 0;

    for (const item of Order.orderItems) {
        const product = await mongoose.model('Product').findById(item.productId);
        if (product) {
            totalPrice += item.quantity * product.price;
        }
    }

    Order.totalPrice = totalPrice;
    next();
});

exports.Order = mongoose.model('Order', orderSchema);
