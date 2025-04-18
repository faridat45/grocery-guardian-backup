                                                                                                                                                   // // help.js - Enhanced Chat Logic with OpenAI API

// let chatHistory = [];

// const chatBox = document.getElementById("chatMessages");
// const userInput = document.getElementById("userInput");
// const sendBtn = document.getElementById("sendButton");
// const typingIndicator = document.getElementById("typingIndicator");

// const OPENAI_API_KEY = "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";
// const API_URL = "https://api.openai.com/v1/chat/completions";

// const params = new URLSearchParams(window.location.search);
// const userId = parseInt(params.get("userId")) || 1;

// async function autoSuggestFromScan(userId) {
//   try {
//     const res = await fetch(`http://localhost:5501/api/scan-history/${userId}/latest`);
//     const data = await res.json();

//     if (!data || !data.product_name) return;

//     const suggestions = [
//       `Does "${data.product_name}" contain any of my allergens?`,
//       `Is "${data.product_name}" safe for someone allergic to ${data.ingredients.slice(0, 2).join(", " )}?`,
//       `What are some alternatives to "${data.product_name}"?`
//     ];

//     const container = document.createElement("div");
//     container.classList.add("bot-message");
//     container.innerHTML = `<strong>Suggestions:</strong><br>` + suggestions.map(s => `<button class="suggestion-btn">${s}</button>`).join("<br>");
//     chatBox.appendChild(container);

//     chatBox.scrollTop = chatBox.scrollHeight;

//     document.querySelectorAll(".suggestion-btn").forEach(btn => {
//       btn.addEventListener("click", () => {
//         userInput.value = btn.textContent;
//         sendBtn.click();
//       });
//     });
//   } catch (err) {
//     console.error("Auto-suggestion error:", err);
//   }
// }

// sendBtn.addEventListener("click", () => {
//   const input = userInput.value.trim();
//   if (input) {
//     addMessage("user", input);
//     userInput.value = "";
//     getBotResponse(input);
//   }
// });

// function addMessage(sender, text) {
//   const msg = document.createElement("div");
//   msg.className = `${sender}-message`;
//   msg.innerHTML = `<p>${text}</p>`;
//   chatBox.appendChild(msg);
//   chatBox.scrollTop = chatBox.scrollHeight;

//   chatHistory.push({ role: sender === "user" ? "user" : "assistant", content: text });
// }

// function showTyping() {
//   typingIndicator.style.display = "flex";
// }

// function hideTyping() {
//   typingIndicator.style.display = "none";
// }

// let cooldown = false;

// async function getBotResponse(userText) {
//   if (cooldown) {
//     addMessage("bot", "Please wait a moment before asking another question.");
//     return;
//   }

//   cooldown = true;
//   sendBtn.disabled = true;
//   userInput.disabled = true;
//   showTyping();

//   // Reset cooldown in 3 seconds
//   setTimeout(() => {
//     cooldown = false;
//     sendBtn.disabled = false;
//     userInput.disabled = false;
//   }, 3000);

//   let userAllergens = [];
//   let lastScan = { product_name: "None", ingredients: [] };

//   if (userText.toLowerCase().includes("recommend")) {
//     await recommendSafeProducts(userId);
//     hideTyping();
//     return;
//   }

//   try {
//     const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
//     userAllergens = await prefsRes.json();

//     const scanRes = await fetch(`http://localhost:5501/api/scan-history/${userId}/latest`);
//     lastScan = await scanRes.json();
//   } catch (err) {
//     console.warn("Could not fetch context from DB:", err);
//   }

//   const prompt = `
// You are an AI that helps users avoid allergens in food products.
// User is allergic to: ${userAllergens.join(", ") || "none"}.
// Last scanned product: ${lastScan.product_name || "none"}.
// Ingredients: ${Array.isArray(lastScan.ingredients) ? lastScan.ingredients.join(", ") : lastScan.ingredients || "none"}.
// User's question: ${userText}
// `;

//   const payload = {
//     model: "gpt-3.5-turbo",
//     messages: [
//       { role: "system", content: "You help users with food safety and allergen analysis." },
//       ...chatHistory,
//       { role: "user", content: prompt }
//     ]
//   };

//   try {
//     const res = await fetch(API_URL, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${OPENAI_API_KEY}`
//       },
//       body: JSON.stringify(payload)
//     });

//     hideTyping();
//     sendBtn.disabled = false;
//     userInput.disabled = false;

//     if (res.status === 429) {
//       addMessage("bot", "⚠️ Too many requests. Please wait a bit before trying again.");
//       return;
//     }

//     const data = await res.json();

//     if (data.choices?.length > 0) {
//       addMessage("bot", data.choices[0].message.content.trim());
//     } else {
//       addMessage("bot", "Sorry, I couldn't understand that.");
//     }
//   } catch (error) {
//     hideTyping();
//     sendBtn.disabled = false;
//     userInput.disabled = false;
//     addMessage("bot", "Error reaching AI service.");
//     console.error("OpenAI Error:", error);
//   }
// }

// async function recommendSafeProducts(userId) {
//   try {
//     const historyRes = await fetch(`http://localhost:5501/api/scan-history/${userId}`);
//     const history = await historyRes.json();

//     const prefsRes = await fetch(`http://localhost:5501/api/preferences/${userId}`);
//     const allergens = await prefsRes.json();

//     const safeProducts = history.filter(item => {
//       const ingredients = item.ingredients || [];
//       return !allergens.some(allergen =>
//         ingredients.some(ing => ing.toLowerCase().includes(allergen.toLowerCase()))
//       );
//     });

//     const counts = {};
//     safeProducts.forEach(item => {
//       counts[item.product_name] = (counts[item.product_name] || 0) + 1;
//     });

//     const topSafe = Object.entries(counts)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 3)
//       .map(entry => entry[0]);

//     if (topSafe.length === 0) {
//       addMessage("bot", "You haven’t scanned enough safe foods yet to give a recommendation.");
//     } else {
//       addMessage("bot", `Based on your scan history, here are safe products you often choose: ${topSafe.join(", ")}.`);
//     }
//   } catch (err) {
//     console.error("ML Recommendation Error:", err);
//     addMessage("bot", "Couldn't generate a recommendation due to a server issue.");
//   }
// }

// document.getElementById("recommendButton").addEventListener("click", () => {
//   recommendSafeProducts(userId);
// });

// autoSuggestFromScan(userId);

// const micButton = document.getElementById("micButton");
// const recognition = window.SpeechRecognition || window.webkitSpeechRecognition
//   ? new (window.SpeechRecognition || window.webkitSpeechRecognition)()
//   : null;

// if (recognition) {
//   recognition.lang = "en-US";
//   recognition.continuous = false;

//   micButton.addEventListener("click", () => {
//     micButton.classList.add("listening");
//     recognition.start();
//   });

//   recognition.onresult = (event) => {
//     const transcript = event.results[0][0].transcript;
//     userInput.value = transcript;
//     micButton.classList.remove("listening");
//     sendBtn.click();
//   };

//   recognition.onerror = () => {
//     alert("Sorry, we couldn’t hear you. Try again.");
//     micButton.classList.remove("listening");
//   };
// } else {
//   micButton.disabled = true;
//   micButton.title = "Voice not supported in this browser";
// }

// userInput.addEventListener("keypress", (e) => {
//   if (e.key === "Enter") sendBtn.click();
// });




console.log("✅ help.js loaded");

let chatHistory = [];
const axios = window.axios;

const endpoint = "https://ai-chatbott.openai.azure.com/";
const apiKey = "RYXzx2E4wR6NOIbNIlk9rCZfQCKAjxTlShDpMDEhIxWtEQNMqGBXJQQJ99BDACYeBjFXJ3w3AAABACOGykDJ";
const deploymentName = "chatbot";
const apiVersion = "2023-12-01-preview";

const computerVisionKey = "DuEhx6ZRkN5PK5LaQp5AFONLUE91HjrD9aGl8kyyWJRy9VSOeGXrJQQJ99BDACYeBjFXJ3w3AAAFACOGcOoP";
const computerVisionEndpoint = "https://grocery-vision.cognitiveservices.azure.com/";

const typingIndicator = document.getElementById("typingIndicator");

function showTyping() {
  typingIndicator?.classList.remove("hidden");
}

function hideTyping() {
  typingIndicator?.classList.add("hidden");
}

function addMessage(sender, text) {
  const chatBox = document.getElementById("chat-box");
  const msg = document.createElement("div");

  msg.className = sender === "user"
  ? "user-message bg-blue-100 rounded-lg px-3 py-2 text-sm sm:text-base self-end max-w-[80%] ml-auto"
  : "bot-message bg-gray-200 rounded-lg px-3 py-2 text-sm sm:text-base self-start max-w-[80%]";


  msg.innerHTML = sender === "user" ? `🧑 ${text}` : `🤖 ${formatBotMessage(text)}`;

  // ✅ Add long press/tap to copy
  let pressTimer;
  msg.addEventListener("mousedown", () => {
    pressTimer = setTimeout(() => {
      navigator.clipboard.writeText(text);
      showToast("📋 Message copied!");
    }, 600); // Long press after 600ms
  });

  msg.addEventListener("mouseup", () => clearTimeout(pressTimer));
  msg.addEventListener("mouseleave", () => clearTimeout(pressTimer));

  chatBox.insertBefore(msg, typingIndicator);
  chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: "smooth"
  });
}



//quick reply function
function renderQuickReplies(replies = []) {
  const chatBox = document.getElementById("chat-box");
  const container = document.createElement("div");
  container.className = "flex flex-wrap gap-2 mt-1";

  replies.forEach(label => {
    const button = document.createElement("button");
    button.className = "bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium shadow";
    button.textContent = label;

    // Define what each button does
    button.addEventListener("click", async () => {
      if (label.includes("Copy")) {
        const last = chatHistory.slice().reverse().find(msg => msg.role === "user" && msg.content.startsWith("Image text:"));
        if (last) {
          await navigator.clipboard.writeText(last.content.replace("Image text:", "").trim());
          showToast("✅ Copied to clipboard!");
        } else {
          showToast("⚠️ Nothing to copy.");
        }
      }

      if (label.includes("Scan")) {
        document.getElementById("liveCameraButton").click();
      }

      if (label.includes("Save")) {
        showToast("✅ Product saved!");
        // Optionally: POST to /api/save-product
      }

      // Remove buttons after use
      container.remove();
    });

    container.appendChild(button);
  });

  chatBox.appendChild(container);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = "fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-4 py-2 rounded shadow z-50 text-sm animate-fade-in";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2000);
}




async function getAzureReply(userInput) {
  const systemPrompt = `
You are Grocery Guardian, a smart and safety-conscious grocery assistant.
User preferences: Allergies: peanuts, gluten | Diet: vegetarian
Be natural, helpful, and prioritize allergen safety.
`;

  const payload = {
    messages: [
      { role: "system", content: systemPrompt },
      ...chatHistory.slice(-5),
      { role: "user", content: userInput }
    ],
    temperature: 0.7,
    max_tokens: 500
  };

  try {
    const url = `${endpoint}openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`;
    const headers = { "Content-Type": "application/json", "api-key": apiKey };
    const res = await axios.post(url, payload, { headers });
    return res.data.choices[0].message.content;
  } catch (err) {
    console.error("Chat error:", err);
    return "Sorry, I couldn't respond right now.";
  }
}



 //Allergen/Dietary “Memory Chips”
 async function loadContextChips(userId) {
  try {
    const res = await fetch(`http://localhost:5501/api/preferences/${userId}`);
    const data = await res.json();

    const context = document.getElementById("contextChips");
    context.innerHTML = ""; // clear old

    if (data.length > 0) {
      context.innerHTML += `<div class="context-chip">⚠️ Allergies: ${data.join(", ")}</div>`;
    }

    // Optional: add fixed diet info if you want
    context.innerHTML += `<div class="context-chip">🥦 Diet: vegetarian</div>`;
  } catch (err) {
    console.error("Failed to load context chips:", err);
  }
}




document.addEventListener("DOMContentLoaded", () => {
  
  const form = document.getElementById("chat-form");
  const input = document.getElementById("user-input");
  const micButton = document.getElementById("micButton");
  const micStatus = document.getElementById("micStatus");
  const uploadBtn = document.getElementById("uploadImageButton");
  const imageInput = document.getElementById("imageInput");
  const cameraBtn = document.getElementById("liveCameraButton");
  const toggle = document.getElementById("darkModeToggle");
  const userId = localStorage.getItem("userId") || "1";
  loadContextChips(userId);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userText = input.value.trim();
    if (!userText) return;
    addMessage("user", userText);
    chatHistory.push({ role: "user", content: userText });
    input.value = "";
    showTyping();



    const reply = await getAzureReply(userText);

// Simulate typing delay
setTimeout(() => {
  hideTyping();
  addMessage("bot", reply);
  chatHistory.push({ role: "assistant", content: reply });

  // Optional: show quick replies here
  // renderQuickReplies(["📋 Copy Ingredients", "🔍 Scan Another"]);
}, 1200); // 1200ms = 1.2 seconds




    chatHistory.push({ role: "assistant", content: reply });
  });

  const speechSdk = window.SpeechSDK;
  const speechKey = "F3IQZEZsRxA9rZDp5eqweyrHvSxUe6PLHjRb9CQNl2ztQIox87dxJQQJ99BDACYeBjFXJ3w3AAAYACOGucWO";
  const region = "eastus";

  micButton.addEventListener("click", () => {
    micStatus.classList.remove("hidden");
    const config = speechSdk.SpeechConfig.fromSubscription(speechKey, region);
    config.speechRecognitionLanguage = "en-US";
    const audio = speechSdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechSdk.SpeechRecognizer(config, audio);

    recognizer.recognizeOnceAsync(result => {
      micStatus.classList.add("hidden");
      if (result.reason === speechSdk.ResultReason.RecognizedSpeech) {
        input.value = result.text;
        document.getElementById("sendButton").click();
      } else {
        alert("Speech not recognized.");
      }
      recognizer.close();
    });
  });

  uploadBtn.addEventListener("click", () => imageInput.click());

  imageInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    addMessage("user", "📷 Uploaded image...");
    showTyping();
    const text = await extractTextFromImage(file);
    if (text) {
      chatHistory.push({ role: "user", content: `Image text: ${text}` });
      const result = await analyzeIngredientsFromText(userId, text);


      setTimeout(() => {
        hideTyping();
        addMessage("bot", result);
        chatHistory.push({ role: "assistant", content: result });
        renderQuickReplies(["📋 Copy Ingredients", "🔍 Scan Another", "✅ Save Product"]);
      }, 1200);
      


      renderQuickReplies(["📋 Copy Ingredients", "🔍 Scan Another", "✅ Save Product"]);
      chatHistory.push({ role: "assistant", content: result });
    } else {
      addMessage("bot", "Could not read text from image.");
    }
    hideTyping();
  });


  document.getElementById("testQuickReplies").addEventListener("click", () => {
    addMessage("bot", "Here’s what you can do next:");
    renderQuickReplies(["📋 Copy Ingredients", "🔍 Scan Another", "✅ Save Product"]);
  });
  

  document.getElementById("clearChatButton").addEventListener("click", () => {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = ''; // Clear all messages
  
    // Add typing indicator back
    const typing = document.createElement("div");
    typing.id = "typingIndicator";
    typing.className = "hidden flex items-center text-sm text-gray-500 animate-fade-in";
    typing.innerHTML = `🤖 Grocery Guardian is typing<span class="dots ml-1"><span>.</span><span>.</span><span>.</span></span>`;
    chatBox.appendChild(typing);
  
    chatHistory = []; // Reset chat history
    showToast("✅ Chat cleared.");
  });
  



  function showToast(message = "✅ Copied to clipboard!") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.style.opacity = "1";
  
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.classList.add("hidden"), 300);
    }, 2000);
  }

  


  // cameraBtn.addEventListener("click", async () => {
  //   const modal = document.getElementById("cameraModal");
  //   const video = document.getElementById("videoStream");
  //   modal.classList.remove("hidden");
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //     video.srcObject = stream;
  //     video.setAttribute("autoplay", true);
  //     video.setAttribute("playsinline", true);
  //     video.play();
  //   } catch (err) {
  //     alert("Camera access blocked.");
  //     modal.classList.add("hidden");
  //   }
  // });

  // document.getElementById("closeCamera").addEventListener("click", stopCamera);

  // document.getElementById("captureButton").addEventListener("click", async () => {
  //   const video = document.getElementById("videoStream");
  //   const canvas = document.createElement("canvas");
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   canvas.getContext("2d").drawImage(video, 0, 0);
  //   stopCamera();
  //   const blob = await new Promise(res => canvas.toBlob(res, "image/jpeg"));
  //   addMessage("user", "📸 Captured image...");
  //   showTyping();
  //   const text = await extractTextFromImage(blob);
  //   if (text) {
  //     chatHistory.push({ role: "user", content: `Image text: ${text}` });
  //     const result = await analyzeIngredientsFromText(userId, text);
  //     addMessage("bot", result);
  //     chatHistory.push({ role: "assistant", content: result });
  //   } else {
  //     addMessage("bot", "No readable text found.");
  //   }
  //   hideTyping();
  // });

  // function stopCamera() {
  //   const modal = document.getElementById("cameraModal");
  //   const video = document.getElementById("videoStream");
  //   const stream = video.srcObject;
  //   if (stream) {
  //     stream.getTracks().forEach(track => track.stop());
  //     video.srcObject = null;
  //   }
  //   modal.classList.add("hidden");
  // }





  if (toggle) {
    const isDark = localStorage.getItem("theme") === "dark";
    if (isDark) document.documentElement.classList.add("dark");
    toggle.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      const mode = document.documentElement.classList.contains("dark") ? "dark" : "light";
      localStorage.setItem("theme", mode);
      toggle.innerText = mode === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode";
    });
    toggle.innerText = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  }

  document.getElementById("recommendButton").addEventListener("click", () => {
    recommendSafeProducts(userId);
  });
});



async function extractTextFromImage(file) {
  const url = `${computerVisionEndpoint}vision/v3.2/read/analyze`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": computerVisionKey,
        "Content-Type": "application/octet-stream"
      },
      body: file
    });
    if (!res.ok) throw new Error("OCR request failed");
    const operationLocation = res.headers.get("operation-location");
    await new Promise(r => setTimeout(r, 3000));
    const result = await fetch(operationLocation, {
      headers: { "Ocp-Apim-Subscription-Key": computerVisionKey }
    });
    const data = await result.json();
    const lines = data.analyzeResult?.readResults?.flatMap(page =>
      page.lines.map(line => line.text)
    );
    return lines?.join(" ") || null;
  } catch (err) {
    console.error("OCR failed:", err);
    return null;
  }
}

async function analyzeIngredientsFromText(userId, ingredients) {
  try {
    const prefs = await fetch(`http://localhost:5501/api/preferences/${userId}`).then(r => r.json());
    const prompt = `
You are a food safety expert. User is allergic to: ${prefs.join(", ") || "none"}
Label: "${ingredients}"
Analyze the ingredients for allergen risks.
`;
    const payload = {
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "Is this safe to eat?" }
      ],
      temperature: 0.7,
      max_tokens: 500
    };
    const res = await fetch(`${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "No result.";
  } catch (err) {
    console.error("Analysis failed:", err);
    return "Error analyzing ingredients.";
  }
}

async function getTopSafeProducts(userId) {
  try {
    const [history, allergens] = await Promise.all([
      fetch(`http://localhost:5501/api/scanHistory/${userId}`).then(r => r.json()),
      fetch(`http://localhost:5501/api/preferences/${userId}`).then(r => r.json())
    ]);
    const safe = history.filter(item =>
      !allergens.some(a => item.ingredients?.some(ing => ing.toLowerCase().includes(a.toLowerCase())))
    );
    const counts = {};
    safe.forEach(item => counts[item.product_name] = (counts[item.product_name] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name);
  } catch (err) {
    console.error("Safe product lookup failed:", err);
    return [];
  }
}

async function recommendSafeProducts(userId) {
  try {
    const products = await getTopSafeProducts(userId);
    if (products.length === 0) {
      addMessage("bot", "You haven’t scanned enough safe foods to recommend anything yet.");
      return;
    }
    const allergens = await fetch(`http://localhost:5501/api/preferences/${userId}`).then(r => r.json());
    const prompt = `
You are Grocery Guardian, an allergen-aware assistant.
User allergies: ${allergens.join(", ") || "none"}
Recommend safe foods avoiding allergens.
`;
    const payload = {
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "What safe products do you recommend?" }
      ],
      temperature: 0.7,
      max_tokens: 400
    };
    const res = await fetch(`${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=${apiVersion}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    const response = data.choices?.[0]?.message?.content || "Could not generate recommendation.";
    addMessage("bot", response);
  } catch (err) {
    console.error("Recommend failed:", err);
    addMessage("bot", "Something went wrong with the recommendation.");
  }
}



function formatBotMessage(text) {


  //check for known products
  if (text.includes("**Product:**")) {
    return `
      <div class="product-card">
        ${text
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/\n/g, "<br>")}
      </div>`;
  }

  
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-blue-600 underline">$1</a>') // **bold**
    .replace(/\*(.*?)\*/g, "<em>$1</em>")                       // *italic*
    .replace(/\n\n/g, "<br><br>")                               // paragraph spacing
    .replace(/\n/g, "<br>")                                     // single line breaks
    .replace(/^[-•] (.*)/gm, "<li>$1</li>")                     // bullets
    .replace(/<li>(.*?)<\/li>/g, "<ul class='list-disc ml-6 text-sm'>$&</ul>") // wrap bullets
    .replace(/`([^`]+)`/g, "<code class='bg-gray-200 rounded px-1'>$1</code>") // inline code
    .replace(/#+\s?(.*)/g, "$1")                                // remove markdown headings like ### text
    .replace(/#/g, "")                                          // remove all other hash symbols
    .trim();
}
         