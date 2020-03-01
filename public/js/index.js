/* eslint-disable */
import '@babel/polyfill';

import { displayMap } from './mapbox';
import { login } from './login';

//  DOM elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');

// delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    // Values
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    console.log(email, password);
    login(email, password);
  });
}
