// Modify your fetchProductInfo function to include this at the end:
async function fetchProductInfo() {
    // ... your existing code ...
    document.getElementById('result').classList.add('hidden');
    document.getElementById('alternativeSection').classList.add('hidden');
    document.getElementById('result2').classList.add('hidden');
    
    await loadUserAllergens();
    const barcode = document.getElementById('barcodeInput').value;
    if (!barcode) return alert('Please enter or scan a barcode.');

    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        
        if (data.status !== 1) throw new Error('Product not found');
        
        const product = data.product;
        currentProduct = {
            name: product.product_name || 'Unknown Product',
            ingredients: product.ingredients_text || '',
            barcode: barcode,
            image: product.image_front_small_url || "https://via.placeholder.com/200"
        };

        // Show only the product info section
        document.getElementById('result').classList.remove('hidden');
        
        // Update UI
        document.getElementById('productName').textContent = currentProduct.name;
        document.getElementById('ingredients').textContent = currentProduct.ingredients;
        document.getElementById('productImage').src = currentProduct.image;
        document.getElementById('productImage').classList.remove('hidden');

        // Process allergens
        const openFoodAllergens = (product.allergens || '').split(',')
            .map(a => a.trim().replace(/^[a-z]{2}:/, '').toLowerCase())
            .filter(Boolean);
        
        const userAllergensInProduct = openFoodAllergens.filter(allergen => 
            userAllergens.includes(allergen.toLowerCase())
        );

        displayAllergenWarning(userAllergensInProduct);
        displayProductStatus(userAllergensInProduct.length > 0);
        fetchAlternativeProducts(userAllergens);
        
    } catch (error) {
        console.error("Error fetching product:", error);
        alert("Failed to get product information. Please try again.");
    // After processing allergens, automatically show status
    displayProductStatus(filteredAllergens.length > 0);
  }
}
  
  // Add these new functions:
  function displayProductStatus(isUnsafe) {
    const statusContainer = document.getElementById('productStatusContainer');
    const statusElement = document.getElementById('productStatus');
    
    statusContainer.classList.remove('hidden');
    
    if (isUnsafe) {
      statusElement.className = 'product-status status-unsafe';
      statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Be Aware - Contains Allergens';
    } else {
      statusElement.className = 'product-status status-safe';
      statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Safe - No Allergens Detected';
    }
    
    // Always show the add to purchase button after scan
    document.getElementById('addToPurchase').classList.remove('hidden');
  }
  
  function showPurchaseForm() {
    document.getElementById('purchaseForm').classList.remove('hidden');
    document.getElementById('foodNameInput').value = foodName || document.getElementById('productName').textContent;
  }
  // Add this function to handle receipt scanning
function handleReceiptScan() {
  // Hide all sections except receipt-related ones
  document.getElementById('result').classList.add('hidden');
  document.getElementById('alternativeSection').classList.add('hidden');
  
  // Show receipt upload section
  document.getElementById('result2').classList.remove('hidden');
  document.getElementById('imageInput').value = ''; // Clear previous file
}

  function saveFoodHistory() {
    const quantity = document.getElementById('purchaseQuantity').value;
    const foodName = document.getElementById('foodNameInput').value;
    
    // Save to history logic here
    console.log(`Saved to history: ${quantity} x ${foodName}`);
    
    // Show confirmation and hide form
    document.getElementById('purchaseForm').classList.add('hidden');
    alert('Purchase saved to your history!');
  }



  