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
    const token = getCookie('token');
    if (token) {
      fetchPlaces(token);
    } else {
      console.warn('No token found. PLease log in.');
    }
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

      // LOGS POUR DEBUG
      console.log("Selected filter value:", selectedValue);
      console.log("Parsed maxprice:", maxPrice);
      console.log("allPlaces length:", allPlaces.length)

      const filteredPlaces = allPlaces.filter(place => {
        console.log(`Checking place '${place.title}' with price ${place.price}`);
        return maxPrice == null || place.price <= maxPrice;
      });

      displayPlaces(filteredPlaces);
    });
  }

  const reviewForm = document.getElementById('review-form');
  const messageDiv = document.getElementById('form-message');

  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const token = checkAuthenticationForReview();
      const placeId = getPlaceIdFromURL();
      const reviewText = document.getElementById('review-text').value.trim();

      if (!reviewText) {
        alert('Please write something before submitting');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}/reviews`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-type': 'application/json'
            },
            body: JSON.stringify({ text: reviewText })
          });
            
          if (!response.ok) {
            throw new Error('Failed to submit review');
          }

          messageDiv.textContent = 'Review submitted successfully!';
          messageDiv.style.color = 'green';
          reviewForm.reset();

          //VOIR LA NOUVELLE REVIEW
          fetchPlaceDetails(token, placeId);

      } catch (error) {
        console.error('Error submitting review:', error);
        messageDiv.textContent = "Can't submit, please try again";
        messageDiv.style.color = "red";
      }
    });
  }

  if (document.getElementById('place-details')) {
    checkAuthenticationForDisplay();
  }
});

/// FONCTIONS GLOBALES

function checkAuthenticationForDisplay() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  const addReviewSection = document.getElementById('add-review');

  if (loginLink) {
    loginLink.style.display = token ? 'none' : 'block';
  }

  if (addReviewSection) {
    addReviewSection.style.display = token ? 'block' : 'none';

  if (token) {
    const placeId = getPlaceIdFromURL();
    if (placeId) fetchPlaceDetails(token, placeId)
    }
  }
}

async function fetchPlaceDetails(token, placeId) {
  try {
    const response = await fetch(`http://localhost:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch place details');
    }

    const place = await response.json();
    displayPlaceDetails(place);
  } catch (error) {
    console.error('Error fetching place details:', error);
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
    allPlaces = places;
    console.log("All places fetched:", allPlaces);
    displayPlaces(places);

  } catch (error) {
    console.error('Error fetching places:', error);
  }
}

function displayPlaces(places) {
  console.log("Places to display:", places);
  const placesList = document.getElementById('places-list');
  placesList.innerHTML = '';

  places.forEach(place => {
    const placeCard = document.createElement('div');
    placeCard.className = 'place-card';

    placeCard.innerHTML = `
      <h2>${place.title}</h2>
      <p>${place.description || 'No description available.'}</p>
      <p><strong>Coordinates:</strong> ${place.latitude}, ${place.longitude}</p>
      <p><strong>Price:</strong> ${place.price} €</p>
      <button class="details-button" onclick="window.location.href='place.html?id=${place.id}'">View Details</button>
    `;

  placesList.appendChild(placeCard);
  });
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function displayPlaceDetails(place) {
  const detailsContainer = document.getElementById('place-details');
  if (!detailsContainer) return;

  detailsContainer.innerHTML = `
    <h2>${place.title}</h2>
    <p><strong>Description:</strong> ${place.description || 'No description available.'}</p>
    <p><strong>Latitude:</strong> ${place.latitude}</p>
    <p><strong>Longitude:</strong> ${place.longitude}</p>
    <p><strong>Price:</strong> ${place.price} €</p>
    <h3>Reviews:</h3>
    <ul id="reviews-list">
      ${place.reviews && place.reviews.length > 0
        ? place.reviews.map(r => `<li><strong>${r.user?.email || 'Anonymous'}:</strong> ${r.text}</li>`).join('')
        : '<li>No reviews yet.</li>'
      }
    </ul>
  `;
}

function checkAuthenticationForReview() {
  const token = getCookie('token');
  if(!token) {
    window.location.href = "index.html"
  }
  return token;
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts[1].split(';')[0];
  }
return null;
}