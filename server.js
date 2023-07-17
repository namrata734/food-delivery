const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const SECRET_KEY = 'FOOD_DELIVERY_KEY';
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get('/login_signup', (req, res) => {
    res.sendFile(__dirname + '/login_signup.html');
});

app.get('/cart', (req, res) => {
    res.sendFile(__dirname + '/cart.html');
});

app.get('/order_history', (req, res) => {
    res.sendFile(__dirname + '/order_history.html');
})

app.get('/script.js', (req, res) => {
    res.sendFile(__dirname + '/script.js');
});



let db;

MongoClient.connect('mongodb+srv://abcd123:abcd@cluster0.euxqukk.mongodb.net/?retryWrites=true&w=majority').then((client) => {
    console.log("connected to DB server");
    db = client.db('food-delivery-db');
}).catch((err) => {
    console.log(err);
})

app.post('/signup', async (req, res) => {
    const { fullName, email, contact, password, add } = req.body;
    if (!fullName || !email || !contact || !password || !add) {
        res.json({ message: "please enter valid details" });
        return;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.json({ message: 'Email is invalid' });
            return;
        }
        const contactRegex = /^\d{10}$/;
        if (!contactRegex.test(contact)) {
            res.json({ message: 'contact is invalid' });
            return;
        }
        const result = await db.collection('user-cred').find({ email }).toArray();
        if (result.length) {
            res.json({ message: "user is already exist" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { fullName, email, contact, password: hashedPassword, add };
        await db.collection('user-cred').insertOne(user);
        res.json({ message: "user created successfully" });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (email && password) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.json({ message: 'Email is invalid' });
            return;
        }
        const result = await db.collection('user-cred').find({ email }).toArray();
        if (result.length) {
            const matchedPassword = bcrypt.compare(password, result[0].password);
            if (matchedPassword) {
                const token = jwt.sign({ email }, SECRET_KEY)
                console.log(token);
                res.cookie('token', token);
                res.json({ message: 'login successful', token });
            } else {
                res.json({ message: 'Invalid password' });
            }
        } else {
            res.json({ message: 'user doesn\'t exist' });
        }
    } else {
        res.json({ message: "Invalid email or password" });
    }
});

app.post('/forgotPassword', async (req, res) => {
    const { email, phoneNumber, newPassword } = req.body;
    // email -> is exist in cred.json, phoneNumber is == that existing user, oldPassword = newPassword
    if (email && phoneNumber && newPassword) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.json({ message: 'Email is invalid' });
            return;
        }
        const contactRegex = /^\d{10}$/;
        if (!contactRegex.test(phoneNumber)) {
            res.json({ message: 'contact is invalid' });
            return;
        }
        const result = await db.collection('user-cred').find({ email }).toArray();
        if (result.length) {
            if (result[0].contact == phoneNumber) {
                await db.collection('user-cred').updateOne({ email }, { $set: { password: newPassword } });
                res.json({ message: 'password updated successfully' });
            } else {
                res.json({ message: 'incorrect phone no' });
            }
        } else {
            res.json({ message: 'user doesn\'t exist' });
        }
    } else {
        res.json({ message: "Invalid phone number or email" });
    }
})

app.post('/addRestaurant', async (req, res) => {
    const restoDetails = req.body;
    if (restoDetails) {
        await db.collection('restaurant').insertOne(restoDetails);
        res.json({ message: 'restaurant details added in DB' });
    } else {
        res.json({ message: 'restaurant details is Empty' });
    }
})

app.get('/getRestaurant', async (req, res) => {
    const { location, food, id } = req.query;
    const result = await db.collection('restaurant').find({}).toArray();

    let data = [];
    if (result.length) {
        if (location) {
            result.forEach(eachResto => {
                if (eachResto.details.address == location) {
                    data.push(eachResto);
                }
            });
            res.json({ message: 'All the Restaurant', data });
        } else if (food) {
            result.forEach(eachResto => {
                // eachResto.foodItems["veg"].forEach((foodItem) => {
                //     if (foodItem.name == food) {
                //         data.push(eachResto);
                //     }
                // });
                // eachResto.foodItems["non-veg"].forEach((foodItem) => {
                //     if (foodItem.name == food) {
                //         data.push(eachResto);
                //     }
                // });
                for (const key in eachResto.foodItems) {
                    eachResto.foodItems[`${key}`].forEach((foodItem) => {
                        if (foodItem.name == food) {
                            data.push(eachResto);
                        }
                    });
                }
            });
            res.json({ message: 'All the Restaurant', data });
        } else if (id) {
            result.forEach(eachResto => {
                const resto_id = (eachResto._id).toString();
                if (id == resto_id) {
                    data.push(eachResto);
                }
            })
            res.json({ message: 'All the Restaurant', data });
        } else {
            res.json({ message: 'All the Restaurant', result });
        }
    } else {
        res.json({ message: 'No Any Restaurant available' });
    }
})

// we have to add -> orderedOn:Date.now()
app.post('/addOrder', async (req, res) => {
    const orderDetails = req.body;
    let totalPrice = 0;
    orderDetails.cart.forEach(orders => totalPrice += orders.totalPrice);
    if (orderDetails) {
        const order = {
            ...orderDetails,
            orderedOn: Date.now(),
            orderStatus: 'ORDER_PREPARING',
            totalPrice,
        };
        let result = await db.collection('orders').insertOne(order);
        const OrderId = result.insertedId.toString();
        res.json({ message: `Order placed successfully, Your OrderId is ${OrderId}` });
    } else {
        res.json({ message: 'please add food in cart' })
    }
});

app.get('/getOrders', async (req, res) => {
    const { email } = req.query;
    const result = await db.collection('orders').find({ email }).sort({ orderedOn: -1 }).toArray();
    res.json({ message: result });
})

app.put('/updateOrderStatus', async (req, res) => {
    const { orderId, status } = req.body;
    if (orderId && status) {
        const objectId = new ObjectId(orderId);
        const result = await db.collection('orders').find({ _id: objectId }).toArray();
        if (result) {
            const updateData = await db.collection('orders').updateOne({ _id: objectId }, {
                $set: {
                    orderStatus: status
                }
            });
            res.json({ message: 'order is updated', updateData });
        } else {
            res.json({ message: 'Invalid order Id' });
        }
    } else {
        res.json({ message: 'OrderId and Status can\'t be empty' });
    }
});

app.post('/read-token', (req, res) => {
    try {
        if (req.cookies.token) {
            const decodedUserDetail = jwt.verify(req.cookies.token, SECRET_KEY);
            res.json({ decodedUserDetail });
        }
    } catch (error) {
        console.log(error);
    }
})

app.get('/clear-cookie', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'cookie is cleared' });
})

const port = 3001;
app.listen(port, () => {
    console.log(`server is running in port ${port}`);
});