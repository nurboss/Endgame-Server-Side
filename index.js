const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;
const stripe = require('stripe')(process.env.STRIPE_SECRET)
const fileUpload = require('express-fileupload')

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mgtwv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.get('/', (req, res) => {
    res.send('This is Server for Endgame.')
})

async function run(){
    try{
        await client.connect();
        console.log('database connected');
        const database = client.db("endgame");
        const servicesCollection = database.collection("services");
        const orderCollection = database.collection("Orders");
        const userCollection = database.collection("users");
        const reviewCollection = database.collection("review");
        const doctorsCollection = database.collection("doctors");

        //Load API 
        app.get('/services', async (req, res) => {
            const result = await servicesCollection.find({}).toArray();
            res.send(result);
        })
        //Load Single API 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })
        //Load Single bookappoinment API 
        app.get('/bookappoinment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await servicesCollection.findOne(query);
            res.send(result);
        })
        // delete form cars
        app.delete('/deleteservices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await servicesCollection.deleteOne(query);
            res.send(result);
        })
        //add product API 
        app.post('/addservices', async (req, res) => {
            const orders = req.body;
            const result = await servicesCollection.insertOne(orders);
            res.send(result);
        })
       
    //    --------------- cpied from --------------
        // Add Orders API
        app.post('/order', async (req, res) => {
            const orders = req.body;
            const result = await orderCollection.insertOne(orders);
            res.send(result);
        })
        
        // get my orders
        app.get('/myorder/:email', async (req, res) => {
            const email = req.params.email;
            const result = await orderCollection.find({ email : email }).toArray();
            res.send(result);
        })
        // get my orders by Id
        app.get('/appoint/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await orderCollection.findOne(query);
            res.send(result);
        })
        app.put('/appointment/:id', async(req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = {_id: ObjectId(id)};
            const updateDoc = {
                $set: {
                    visit: payment
                }
            };
            const result = await orderCollection.updateOne(filter, updateDoc)
            res.send(result);
        })
       
        // delete order
        app.delete('/deleteOrde/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })
        // get all orders
        app.get('/allorder', async (req, res) => {
            const result = await orderCollection.find().toArray();
            res.send(result);
        })
        // delete form all order
        app.delete('/deleteaddOrdre/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await orderCollection.deleteOne(query);
            res.send(result);
        })

        // Update form all order
        app.put('/updateOrdre/:id', async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const query = { _id :ObjectId(id)}
            const result = await orderCollection.updateOne(query, {
                $set: {
                    status: updateInfo.ship
                }
            });
            res.send(result);
        })
        
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.send({admin: isAdmin});
        })


        // add user name and email
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.send(result);
        })
        
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' }};
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        // Review api
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result);
        })
        // Add Review
        app.post('/addreview', async (req, res) => {
            const orders = req.body;
            const result = await reviewCollection.insertOne(orders);
            res.send(result);
        })
        // delete form all review
        app.delete('/review/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id :ObjectId(id)}
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

        // Update form all review
        app.put('/updatereview/:id', async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            const query = { _id :ObjectId(id)}
            const result = await reviewCollection.updateOne(query, {
                $set: {
                    approved: updateInfo.approv
                }
            });
            res.send(result);
        })
        // payment
        
        app.post('/create-payment-intent', async (req, res) => {
            const paymentInfo = req.body;
            const amount = paymentInfo.price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                payment_method_types: ['card']

            });
            res.send({ clientSecret: paymentIntent.client_secret })
        })

        // doctors img collection
        app.get('/getdoctors', async (req, res) => {
            const cursor = doctorsCollection.find({});
            const doctors = await cursor.toArray();
            res.send(doctors);
        })

        app.post('/doctors', async (req, res) => {
            const name = req.body.title;
            const email = req.body.image;
            const details = req.body.details;
            const pic = req.files.picture;
            console.log(pic)
            const picData = pic.data;
            console.log(picData)
            const endodedPic = picData.toString('base64');
            const imgBuffer = Buffer.from(endodedPic, 'base64')
            const doctor = {
                name,
                email,
                image: imgBuffer
            }
            const result = await doctorsCollection.insertOne(doctor)
            res.send(result)
        })
        
    //    --------------- cpied from --------------

        
    }
    finally{
        // await client.close();
    }

}run().catch(console.dir);


app.listen(port, () => {
    console.log('Running the Server on Port', port);
})