const express = require('express')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv/config')



app.use(express.json())
app.use(cors());
app.options('*', cors())
app.use(express.static("public"))
///////////////////////////////////////////

// const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

// const storeItems = new Map([
//   [1, { priceInCents: 10000, name: "Learn React Today" }],
//   [2, { priceInCents: 20000, name: "Learn CSS Today" }],
// ])

// app.post("/create-checkout-session", async (req, res) => {
//     try {
//       const session = await stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "payment",
//         line_items: req.body.items.map(item => {
//           const storeItem = storeItems.get(item.id)
//           return {
//             price_data: {
//               currency: "usd",
//               product_data: {
//                 name: storeItem.name,
//               },
//               unit_amount: storeItem.priceInCents,
//             },
//             quantity: item.quantity,
//           }
//         }),
//         success_url: `${process.env.CLIENT_URL}/success.html`,
//         cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
//       })
//       res.json({ url: session.url })
//     } catch (e) {
//       res.status(500).json({ error: e.message })
//     }
//   })
  

//const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

//app.post('/payments', async (req, res) => {
  //const { amount } = req.body;

  //try {
   // const paymentIntent = await stripe.paymentIntents.create({
      //amount,
      //currency: 'usd',
    //});

   // res.status(200).send(paymentIntent.CLIENT_URL);
  //} catch (error) {
    //res.status(500).json({ message: error.message });
  //}
//});

const order = require('./models/order');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);


const createOrder = async (customer, data) => {
  try {
    const Items = JSON.parse(customer.metadata.cart);

    const products = Items.map((item) => {
      return {
        productId: item.id,
        quantity: item.cartQuantity,
      };
    });

    const newOrder = new order({
      userId: customer.metadata.userId,
      customerId: data.customer,
      paymentIntentId: data.payment_intent,
      products,
      subtotal: data.amount_subtotal,
      total: data.amount_total,
      shipping: data.customer_details,
      payment_status: data.payment_status,
    });

    const savedOrder = await newOrder.save();
    console.log("Processed Order:", savedOrder);
  } catch (err) {
    console.log(err);
  }
};
// Route for handling payment requests
app.post('/create-checkout-session', async (req, res) => {
  const customer = await stripe.customers.create({
    metadata: {
      userId: req.body.userId,
      cart: JSON.stringify(req.body.cartItems),
    },
  });
  const line_items= req.body.cart.map((items) => {
    return{
      price_data: {
        currency: 'usd',
        product_data: {
          name: items.name,
          images: [items.image],
          description: items.description,
          metadata: {
            id: items.id
          }
        },
        unit_amount: Math.round(items.price * 100),
      },
      quantity: 1
    }
  })
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "KE"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "usd",
          },
          display_name: "Free shipping",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 5,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 1500,
            currency: "usd",
          },
          display_name: "Next day air",
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 1,
            },
            maximum: {
              unit: "business_day",
              value: 1,
            },
          },
        },
      },
    ],
    phone_number_collection: {
      enabled: true,
    },
    line_items,
    mode: "payment",
    customer: customer.id,
    success_url: `${process.env.CLIENT_URL}/orders`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
  });

  res.send({url: session.url});
});

app.post(
  "/webhook",
  async (req, res) => {
    let data;
    let eventType;

    // Check if webhook signing is configured.
    let webhookSecret;
    //webhookSecret = process.env.STRIPE_WEB_HOOK;

    if (webhookSecret) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          webhookSecret
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed:  ${err}`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data.object;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in config.js,
      // retrieve the event data directly from the request body.
      data = req.body.data.object;
      eventType = req.body.type;
    }

    // Handle the checkout.session.completed event
    if (eventType === "checkout.session.completed") {
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          try {
            // CREATE ORDER
            createOrder(customer, data);
          } catch (err) {
            console.log(typeof createOrder);
            console.log(err);
          }
        })
        .catch((err) => console.log(err.message));
    }

    res.status(200).end();
  }
);



const productsRouter = require('./routes/products')
const categoriesRouter = require('./routes/categories')
const usersRouter = require('./routes/users')
const ordersRouter = require('./routes/orders')
const offersRouter = require('./routes/offers')
const formRouter = require('./routes/formToBuy')
const { it } = require('node:test')



//middleware
app.use(express.json())
app.use(cors());
app.options('*', cors())
app.use(morgan('tiny'))
app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(express.urlencoded({extended: false}))



//Routers
app.use('/api/products', productsRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/users', usersRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/offers', offersRouter)
app.use('/api/formToBuy', formRouter)




mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log("Database connection is ready...")
})
.catch((err)=>{
    console.log(err.message)
})


app.listen(process.env.PORT,()=>{
    console.log("server running now")
})