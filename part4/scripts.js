/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

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
    });