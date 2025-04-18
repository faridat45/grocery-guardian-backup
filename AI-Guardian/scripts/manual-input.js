let foodName = null;

document.getElementById('fetchButton').addEventListener('click', fetchProductInfo);
document.getElementById('saftFoodButton').addEventListener('click', showQuestions);
document.getElementById('confirmButton').addEventListener('click', saveFood);

async function fetchProductInfo() {
    const barcode = document.getElementById('barcode').value;
    if (!barcode) {
        alert('Please enter a barcode.');
        return;
    }

    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 1) {
            const product = data.product;
            foodName = product.product_name || product.generic_name_en || product.product_name_en || 
                      product.product_name_it || product.generic_name || product.abbreviated_product_name || 
                      product.brands || 'Unknown Product';

            const ingredients = product.ingredients_text_en || product.ingredients_text || 
                               product.ingredients_hierarchy || product.ingredients_original_tags || 
                               'No ingredients listed';
            const potentialAllergens = product.allergens || 'No data';
            const sugarLevel = product.nutriments.sugars +" " + product.nutriments.sugars_unit || 
                               product.nutriments.sugars_100g +" " + product.nutriments.sugars_unit || 
                               product.nutriments.sugars_value +" " + product.nutriments.sugars_unit || 
                               'No data';

            document.getElementById('productName').textContent = foodName;
            document.getElementById('ingredients').textContent = ingredients;
            document.getElementById('potentialAllergens').textContent = potentialAllergens;
            document.getElementById('sugarLevel').textContent = sugarLevel;

            const nutrientLevels = product.nutrient_levels || {};
            const nutrientText = Object.entries(nutrientLevels).map(([key, value]) => `${key}: ${value}`).join(", "); 					 
            document.getElementById('nutrientLevels').textContent = nutrientText || "No data";

            document.getElementById('productImage').classList.remove('hidden');
            const imageUrl = product.image_front_small_url || product.selected_images.front.small.it || 
                            "https://cdn-icons-png.flaticon.com/512/1178/1178479.png";
            document.getElementById('productImage').src = imageUrl;            
        } else {
            document.getElementById('productName').textContent = 'Product not found';
            document.getElementById('ingredients').textContent = '-';
            document.getElementById('productImage').classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching product info:', error);
        alert('Failed to fetch product information. Please try again.');
    }
}

function showQuestions() {
    document.getElementById('questions').classList.remove('hidden');
    document.getElementById('foodNameInput').value = foodName;
}

function saveFood() {
    document.getElementById('saveNotice').innerHTML = "This product is saved";
}