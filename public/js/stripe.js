/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    const stripe = Stripe('pk_test_GKyVCNDt0O3Gf4R3mPk5xZTl00OHhII9BQ');

    // 1) Get checkout session from server (API)
    const session = await axios.get(
      `http://localhost:5000/api/v1/bookings/checkout-session/${tourId}`
    );

    console.log(session);
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      // Make the id field from the Checkout Session creation API response
      // available to this file, so you can provide it as parameter here
      // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
