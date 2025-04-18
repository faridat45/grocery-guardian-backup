// profile.js - Refactored to use database instead of localStorage

document.getElementById("profilePicInput")?.addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profilePic").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

const user = JSON.parse(localStorage.getItem('currentUser')); 
const userId = user.id;
async function fetchAllergiesFromDB(userId) {
    try {
        const res = await fetch(`http://localhost:5501/api/preferences/${userId}`);
        return await res.json();
    } catch (err) {
        console.error("Error fetching allergies:", err);
        return [];
    }
}

async function fetchUserNameFromDB(userId) {
    try {
        const res = await fetch(`http://localhost:5501/api/user/${userId}`);
        const data = await res.json();
        return data.name;
    } catch (err) {
        console.error("Error fetching user name:", err);
        return "";
    }
}

async function saveUserNameToDB(userId, name) {
    try {
        await fetch("http://localhost:5501/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, name })
        });
    } catch (err) {
        console.error("Error saving user name:", err);
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    const userNameInput = document.getElementById("userName");
    const displayName = document.getElementById("displayName");
    const saveNameBtn = document.getElementById("saveName");
    const editNameBtn = document.getElementById("editName");

    const savedName = await fetchUserNameFromDB(userId);
    if (savedName) {
        displayName.textContent = savedName;
        displayName.style.display = "inline";
        userNameInput.style.display = "none";
        saveNameBtn.style.display = "none";
        editNameBtn.style.display = "inline";
    }

    saveNameBtn?.addEventListener("click", async function () {
        const name = userNameInput.value.trim();
        if (name !== "") {
            await saveUserNameToDB(userId, name);
            displayName.textContent = name;
            displayName.style.display = "inline";
            userNameInput.style.display = "none";
            saveNameBtn.style.display = "none";
            editNameBtn.style.display = "inline";
        }
    });

    editNameBtn?.addEventListener("click", function () {
        userNameInput.style.display = "inline";
        saveNameBtn.style.display = "inline";
        editNameBtn.style.display = "none";
        displayName.style.display = "none";
        userNameInput.value = displayName.textContent;
    });
});

document.addEventListener("DOMContentLoaded", async function () {
    const allergyList = document.getElementById("selectedAllergyList");
    const toggleButton = document.getElementById("toggleAllergyList");
    let savedAllergies = await fetchAllergiesFromDB(userId);

    function populateAllergyList() {
        allergyList.innerHTML = "";

        if (savedAllergies.length) {
            savedAllergies.forEach((allergy) => {
                const listItem = document.createElement("li");
                listItem.textContent = allergy;
                allergyList.appendChild(listItem);
            });
        } else {
            const noAllergiesItem = document.createElement("li");
            noAllergiesItem.textContent = "No allergies selected";
            allergyList.appendChild(noAllergiesItem);
        }
    }

    populateAllergyList();
    allergyList.classList.remove('show');
    toggleButton.innerHTML = "Show Allergies ▼";

    toggleButton?.addEventListener("click", function () {
        allergyList.classList.toggle("show");

        if (allergyList.classList.contains("show")) {
            toggleButton.innerHTML = "Hide Allergies ▲";
            allergyList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            toggleButton.innerHTML = "Show Allergies ▼";
        }
    });

    window.addEventListener('focus', async function() {
        const updatedAllergies = await fetchAllergiesFromDB(userId);
        if (JSON.stringify(updatedAllergies) !== JSON.stringify(savedAllergies)) {
            savedAllergies = updatedAllergies;
            populateAllergyList();
        }
    });
});




document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});