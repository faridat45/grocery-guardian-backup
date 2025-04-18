    const checkboxes = document.querySelectorAll("input[type='checkbox']");
    let selectedAllergies = [];
    const user = JSON.parse(localStorage.getItem('currentUser'));    
    let allergens = JSON.parse(user.allergens);
    // Load allergies from DB
    
    // Pre-check previously selected allergies
    if(!allergens) {
            allergens=[];
    }
    checkboxes.forEach((checkbox) => {
            if (allergens.includes(checkbox.value)) {
                checkbox.checked = true;
            }

            checkbox.addEventListener("change", async function () {
                if (this.checked) {
                    allergens.push(this.value);
                } else {
                    allergens = allergens.filter(a => a !== this.value);
                }
            });
        });

    async function savePreferences() {
        const userId = user.id;
        fetch("http://localhost:5501/update-allergens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, allergens })
        })
        .then(response => {
            if (!response.ok) throw new Error("Failed to save");
            return response.json();
        })
        .then(data => console.log("Success:", data))
        .catch(error => console.error("Error:", error));
        const response  = await fetch('http://localhost:5501/reload/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id:userId })}
        )
        const data = await response.json();
        if(data) {
            localStorage.setItem('currentUser',JSON.stringify(data));
        } else {
            console.log('error adding the user back to local storage')
        }
    }