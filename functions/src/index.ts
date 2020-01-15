import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

const stripe = require('stripe')(functions.config().stripe.token)

// stripeのcustomerを作成してcustomIdを返す
exports.createStripeCustomer = functions.https.onCall(async (data, context) => {
    const email = data.email
    const customer = await stripe.customers.create({email: email});
    const customerId = customer.id
    return { customerId: customerId }
});

// Stripeのワンタイムトークン発行
exports.createStripeEphemeralKeys = functions.https.onCall(async (data, context) => {
    const customerId = data.customerId;
    const stripe_version = data.stripe_version;
    return await stripe.ephemeralKeys
    .create({
        customer: customerId 
    }, {
        stripe_version: stripe_version
    })
});

// Stripeで決済(これだとエラーが出るのでdeprecated)
exports.createStripeCharge = functions.https.onCall(async (data, context) => {
    const customer = data.customerId;
    const source = data.sourceId;
    const amount = data.amount;

    return await stripe.charges.create({
        customer: customer,
        source: source,
        amount: amount,
        currency: 'jpy',
    })
});

exports.createStripePaymentIntents = functions.https.onCall(async (data, context) => {
    const customer = data.customerId;
    const amount = data.amount;

    const paymentIntent = await stripe.paymentIntents.create({
        customer: customer,
        amount: amount,
        currency: 'jpy',
    })
   return {client_secret: paymentIntent.client_secret}
});


export const helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});
