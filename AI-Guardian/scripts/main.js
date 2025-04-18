let listActive = false;

async function displayAllergens(){
    const allergensList = document.getElementById('allergens-list')
    const user = JSON.parse(localStorage.getItem('currentUser'));
    console.log('user:',user);
    

    const allergens =JSON.parse(user.allergens);
    if(allergens) {
            allergens.forEach(allergen => {
            const li = document.createElement('li');
            li.textContent = allergen; 
            allergensList.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No allergens'; 
        allergensList.appendChild(li);
    }
    
}
function makeNewList()
{
    listActive = true;

    // Get elements properly
    const listButton = document.getElementById("createNewList");
    const itemSection = document.querySelector(".newItem");
    const listCurrent = document.querySelector(".currentItems");
    
    // Add active classes
    listButton.classList.add('active');
    itemSection.classList.add('active');
    listCurrent.classList.add('active');

    const today = new Date();
    listButton.textContent = `List ${today.toLocaleDateString()}`;
}
function makeNewItem()
{
    window.location.replace("scanning.html");
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});