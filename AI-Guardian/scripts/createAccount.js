document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
  
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
  
    // Send registration to backend
    fetch('http://localhost:5501/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, username, password })
    })
    .then((res) => res.json())
    .then(data => {
      if (data.success) {
        alert("Registration successful! Redirecting to login...");
        window.location.href = 'login.html';
      } else {
        alert("Registration failed: " + data.message);
      }
    })
    .catch(err => {
      console.error("Error registering:", err);
      alert("An error occurred.");
    });
  });