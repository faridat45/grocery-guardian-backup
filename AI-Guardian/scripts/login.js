// login.js - Refactored to use URL-based user session passing

const loginForm = document.getElementById("loginForm");

document.querySelector(".login-btn").addEventListener("click", async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const rejectDiv = document.getElementById('reject-div');

    try {
        const response = await fetch('http://localhost:5501/loginnormal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password }),
        });

        const data = await response.json();
        console.log('Received:', data);
        if(data.success) {
            localStorage.setItem('currentUser',JSON.stringify(data.user));
            window.location.href="main.html";
        }
    } catch (error) {
        console.error('Fetch error:', error);
        rejectDiv.style.display = 'block';
    }
});

// Button redirects
document.querySelector(".google").addEventListener("click", function () {
    window.location.href = "google-login.html";
});

document.querySelector(".apple").addEventListener("click", function () {
    window.location.href = "apple-login.html";
});

document.querySelector(".phone").addEventListener("click", function () {
    window.location.href = "phone-login.html";
});

document.querySelector(".email").addEventListener("click", function () {
    window.location.href = "email.login.html";
});

document.querySelector(".createAccount").addEventListener("click", function () {
    window.location.href = "createAccount.html";
});

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log("Google ID: " + profile.getId());
    console.log("Full Name: " + profile.getName());
    console.log("Email: " + profile.getEmail());
    var id_token = googleUser.getAuthResponse().id_token;
}

function signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
        console.log('User signed out.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});
