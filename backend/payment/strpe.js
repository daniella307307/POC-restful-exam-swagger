app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
  
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  
    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const bookingId = session.metadata.bookingId;
  
      // Store payment ID in booking record
      await Booking.update(
        {
          paymentId: session.payment_intent,
          status: 'approved' // or next valid status
        },
        { where: { id: bookingId } }
      );
    }
  
    res.status(200).json({ received: true });
  });
  