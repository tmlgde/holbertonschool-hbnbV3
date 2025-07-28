/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/
let allPlaces = []; //stockage des places récupérées pour le filtrage

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      console.log('Email:', email);
      console.log('Password:', password);

      fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
          },
        body: JSON.stringify({
          email: email,
          password: password,
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Login failed');
          }
          return response.json();
        })
        .then(data => {
          console.log('Login success', data);

          //stock on cookie
          document.cookie = `token=${data.access_token}; path=/`;
            
          //user going to index.html
          window.location.href = 'index.html';
        })
        .catch(error => {
          console.error('Error during login:', error);
          alert('Login failed: ' + error.message);
        });
    });
  }

  if (document.getElementById('places-list')) {
    checkAuthentication();
  }

  // Dessous, on filtre les prix:
  const priceFilter = document.getElementById('price-filter');

  if (priceFilter) {
    priceFilter.addEventListener('change', (event) => {
      const selectedValue = event.target.value;

      let maxPrice = null;
      if (selectedValue !== 'all') {
        maxPrice = parseInt(selectedValue);
      }

      const filteredPlaces = allPlaces.filter(place => {
        return maxPrice == null || place.price <= maxPrice;
      });

      displayPlaces(filteredPlaces);
    });
  }
});


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split (`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (!token) {
  loginLink.style.display = 'block';
  } else {
    loginLink.style.display = 'none';
    fetchPlaces(token);
  }
}

async function fetchPlaces(token) {
  try {
    const response = await fetch('http://localhost:5000/api/v1/places', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    const places = await response.json();
    displayPlaces(places);

  } catch (error) {
    console.error('Error fetching places:', error);
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';

  places.forEach(place => {
    const placeCard = document.createElement('div');
    placeCard.className = 'place-card';

    placeCard.innerHTML = `
      <h2>${place.name}</h2>
      <p>${place.description || 'No description available.'}</p>
      <p><strong>Coordinates:</strong> ${place.latitude}, ${place.longitude}</p>
      <p><strong>Price:</strong> ${place.price} €</p>
    `;

  placesList.appendChild(placeCard);
  });
}