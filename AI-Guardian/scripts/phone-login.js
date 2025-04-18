document.querySelector(".login-btn").addEventListener("click", async () => {
    const phoneNumber = document.getElementById("phoneNumber").value;
    const password = document.getElementById("password").value;
    const rejectDiv = document.getElementById('reject-div');

    try {
        const response = await fetch('http://localhost:5501/login/phone', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: phoneNumber, password: password }),
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