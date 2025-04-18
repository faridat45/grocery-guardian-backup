function toggleOptions(optionsId, caretId) {
    let options = document.getElementById(optionsId);
    let caret = document.getElementById(caretId);
    options.classList.toggle("show");
    caret.classList.toggle("rotate");
    caret.textContent = options.classList.contains("show") ? "▾" : "▸";
}

document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});


function viewProductDetails(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}


function toggleStatus(productId) {
    const statusDiv = document.getElementById(`status-${productId}`);
    if (!statusDiv) {
        console.error(`Status div not found for productId ${productId}`);
        return;
    }

    const statusText = statusDiv.querySelector('.status-text');
    const icon = statusDiv.querySelector('i');
    let newStatus;

    if (statusDiv.classList.contains('safe')) {
        statusDiv.classList.remove('safe');
        statusDiv.classList.add('unsafe');
        icon.className = 'fas fa-exclamation-triangle';
        statusText.textContent = 'Unsafe';
        newStatus = 'unsafe';
    } else {
        statusDiv.classList.remove('unsafe');
        statusDiv.classList.add('safe');
        icon.className = 'fas fa-check-circle';
        statusText.textContent = 'Safe';
        newStatus = 'safe';
    }

    // Send update to backend
    fetch('http://localhost:5501/api/update-status', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            productId,
            status: newStatus
        })
    })
    .then(res => res.json())
    .then(data => console.log('Status saved:', data))
    .catch(err => console.error('Failed to update status:', err));
}





document.addEventListener('DOMContentLoaded', () => {
    const chatbotIcon = document.getElementById('chatbotIcon');
    
    if (chatbotIcon) {
        chatbotIcon.addEventListener('click', () => {
            window.location.href = '/AI-GUARDIAN/AI GUARDIAN Project/help.html';
        });
    }
});

