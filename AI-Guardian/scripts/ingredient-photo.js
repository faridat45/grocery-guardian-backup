const imageInput = document.getElementById('imageInput');
const extractedTextElement = document.getElementById('extractedText');
const warningElement = document.getElementById('warning');
const resultElement = document.getElementById('result');
const safeFoodButton = document.getElementById('saftFoodButton');
const confirmButton = document.getElementById('confirmButton');

imageInput.addEventListener('change', handleImageUpload);
safeFoodButton.addEventListener('click', showQuestions);
confirmButton.addEventListener('click', saveFood);

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const compressedBlob = await new Promise(resolve => {
            compressImage(file, resolve);
        });

        const extractedText = await runOCR(compressedBlob);
        await checkAllergens(extractedText);
    } catch (error) {
        console.error("failed:", error);
        alert(`failed: ${error.message}`);
    }
}

function compressImage(file, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob.size > 1024 * 1024) {
                        canvas.toBlob(
                            (blob) => callback(blob),
                            'image/webp',
                            0.7
                        );
                    } else {
                        callback(blob);
                    }
                },
                'image/webp',
                0.8
            );
        };
    };
}

async function runOCR(compressedBlob) {
    const formData = new FormData();
    formData.append('file', compressedBlob, 'image.webp');
    formData.append('language', 'eng');
    formData.append('OCREngine', '2');
    formData.append('isOverlayRequired', 'false');

    const apiKey = 'K84788786688957';
    const apiUrl = `https://api.ocr.space/parse/image`;

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'apikey': apiKey },
        body: formData,
    });
    const result = await response.json();

    if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage);
    }

    return result.ParsedResults[0].ParsedText; 
}

async function checkAllergens(extractedText) {
    const foodName = extractedText.split("\n")[0];
    extractedTextElement.textContent = extractedText;
    resultElement.classList.remove('hidden');

    if (extractedText.toLowerCase().includes('milk')) {
        warningElement.textContent = "Warning! This product contains your allergens: milk";
        warningElement.style.display = 'block';
    } else {
        warningElement.style.display = 'none';
    }
}

function showQuestions() {
    document.getElementById('questions').classList.remove('hidden');
}

function saveFood() {
    document.getElementById('saveNotice').innerHTML = "This product is saved";
}