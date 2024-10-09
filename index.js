const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotEnv=require("dotenv");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Order = require('./models/Order');
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');

app.use(express.json())

dotEnv.config()

app.post('/register', async (req, res) => {
    const { name, username, email, password, phone } = req.body;
    console.log(username)
    if (!username) return res.status(400).json({ error: "Username is required" });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, username, email, password: hashedPassword, phone });
        await newUser.save();
        console.log('Registered User:', newUser); 
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: 'Error registering user' });
    }
});

// User Login API

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
     
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        const jwtToken = jwt.sign({ userId: user._id }, 'MY_SECRET_CODE_')
     
        res.json({ jwtToken });
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: 'Login failed' });
    }
});

// JWT Authentication Middleware

const authorizationToken = (req, res, next) => {
    let jwtToken
    const authHearder = req.headers['authorization']
    if (authHearder !== undefined) {
      jwtToken = authHearder.split(' ')[1]
    }
    if (jwtToken === undefined) {
        res.status(401)
        res.send('Invalid JWT Token')
    } else {
      jwt.verify(jwtToken, 'MY_SECRET_CODE_', async (error, user) => {
        if (error) {
            res.status(401)
            res.send('Invalid JWT Token')
        } else {
            req.user = user;
            next()
        }
      })
    }
  }

// User Profile APIs
app.get('/profile', authorizationToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'Profile not found' });
        res.json(user);
    } catch (err) {
        console.error(err); // Log error if occurs
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

app.put('/profile', authorizationToken, async (req, res) => {
    const { name, phone, addresses } = req.body;
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { name, phone, addresses },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ error: 'Profile update failed' });
        res.json(updatedUser);
    } catch (err) {
        console.error(err); // Log error if occurs
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// Restaurant Management APIs
app.post('/restaurants', authorizationToken, async (req, res) => {
    const { name, location,menu } = req.body;
    console.log('New Restaurant:', req.body); // Log new restaurant data
    try {
        const newRestaurant = new Restaurant({ name, location,menu });
        await newRestaurant.save();
        res.status(201).json(newRestaurant);
        console.log(newRestaurant)
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error creating restaurant' });
    }
});

app.put('/restaurants/:restaurantId', authorizationToken, async (req, res) => {
    const { restaurantId } = req.params;
    const updates = req.body;
    try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(restaurantId, updates, { new: true });
        if (!updatedRestaurant) return res.status(404).json({ error: 'Restaurant not found' });
        res.json(updatedRestaurant);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error updating restaurant' });
    }
});

app.post('/restaurants/:restaurantId/menu', authorizationToken, async (req, res) => {
    const { restaurantId } = req.params;
    const { name, description, price, availability } = req.body;
    console.log('New Menu Item:', req.body); // Log new menu item data
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
        const newMenuItem = { name, description, price, availability };
        restaurant.menu.push(newMenuItem);
        await restaurant.save();
        res.status(201).json(newMenuItem);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error adding menu item' });
    }
});

app.put('restaurants/:restaurantId/menu/:itemId',authorizationToken,async(req,res)=>{
    const { restaurantId, itemId } = req.params;
    const { name, description, price } = req.body;
    try {
        const restaurant = await Restaurant.findById(restaurantId);
        const item = restaurant.menu.id(itemId);
        if (item) {
        item.name = name;
        item.description = description;
        item.price = price;
        await restaurant.save();
        res.json(restaurant);
        } else {
        res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
    ;
})

// Order Management APIs
app.post('/orders', authorizationToken, async (req, res) => {
    const { items, deliveryAddress } = req.body;
    console.log('New Order:', req.body); // Log new order data
    try {
        const orderTotal = await calculateOrderTotal(items);
        const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);
        const newOrder = new Order({
            user: req.user.userId,
            items,
            totalCost: orderTotal,
            deliveryAddress,
            estimatedDeliveryTime,
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error placing order' });
    }
});

app.get('/orders/:orderId', authorizationToken, async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId).populate('items.itemId');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error fetching order' });
    }
});

app.get('/orders', authorizationToken, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId }).populate('items.itemId');
        res.json(orders);
    } catch (error) {
        console.error(error); 
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

app.put('/orders/:orderId/status', authorizationToken, async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // Check if the status is valid
    const validStatuses = ['Pending', 'Confirmed', 'In Progress', 'Out for Delivery', 'Delivered'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status provided' });
    }

    try {
        // Find the order and update the status
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Ensure the user is authorized to update the order (if applicable)
        if (order.user.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'You are not authorized to update this order' });
        }

        // Update the order status
        order.status = status;
        await order.save();

        res.json(order);
    } catch (error) {
        console.error(error); // Log error if occurs
        res.status(500).json({ error: 'Error updating order status' });
    }
});


// Helper function to calculate total order cost

async function calculateOrderTotal(items) {
    let total = 0;
    for (const item of items) {
        const menuItem = await Restaurant.findOne({ 'menu._id': item.itemId }, { 'menu.$': 1 });
        if (menuItem) {
            const price = menuItem.menu[0].price;
            total += price * item.quantity;
        }
    }
    return total;
}

mongoose.connect("mongodb+srv://skbalajiskb:SYl4EQJmTHx9m3IX@balaji.lhd7i.mongodb.net/?retryWrites=true&w=majority&appName=Balaji")
  .then(() => {
    app.listen(3000, () => {
      console.log(`Server Started at http://localhost:${3000}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error);
  });

