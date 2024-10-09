const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{ 
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true }, // Assuming a MenuItem schema
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { 
            type: Number, 
            required: true, 
            validate: {
                validator: Number.isInteger,
                message: 'Quantity must be an integer.'
            }
        },
    }],
    totalCost: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'In Progress', 'Out for Delivery', 'Delivered'], 
        default: 'Pending' 
    },
    estimatedDeliveryTime: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Optional: Add a method to update order status
OrderSchema.methods.updateStatus = async function(newStatus) {
    this.status = newStatus;
    this.updatedAt = Date.now();
    await this.save();
};

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;



/*
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{ 
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant.menu' },
        quantity: { type: Number, required: true },
    }],
    totalCost: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'In Progress', 'Out for Delivery', 'Delivered'], 
        default: 'Pending' 
    },
    estimatedDeliveryTime: { type: Date, required: true }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;

*/