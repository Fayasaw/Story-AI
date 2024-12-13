import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyDoq7esNf8V6aRmRAz7wldfe0FL77QWBiQ';

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');
let saveButton = document.getElementById('save-button');
let savedOutputsList = document.getElementById('saved-outputs');

saveButton.onclick = () => {
  let generatedContent = output.innerHTML.trim();

  if (generatedContent && generatedContent !== '(Ask Something..)') {
      // Fetch current saved outputs from localStorage
      let savedOutputs = JSON.parse(localStorage.getItem('savedOutputs')) || [];

      // Add the new output
      savedOutputs.push(generatedContent);

      // Save back to localStorage
      localStorage.setItem('savedOutputs', JSON.stringify(savedOutputs));

      // Update the saved outputs list
      let listItem = document.createElement('li');
      listItem.innerHTML = `
          <a href="saved-outputs.html" class="text-white text-decoration-none">
              ${generatedContent.slice(0, 50)}...
          </a>
      `;
      savedOutputsList.appendChild(listItem);
  }
};

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  try {
    // Load the image as a base64 string
    // let imageUrl = form.elements.namedItem('chosen-image').value;
    // let imageBase64 = await fetch(imageUrl)
    //   .then(r => r.arrayBuffer())
    //   .then(a => Base64.fromByteArray(new Uint8Array(a)));

    // Assemble the prompt by combining the text with the chosen image
    let contents = [
      {
        role: 'user',
        parts: [
        //   { inline_data: { mime_type: 'image/jpeg', data: imageBase64, } },
          { text: promptInput.value }
        ]
      }
    ];

    // Call the multimodal model, and get a stream of results
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // or gemini-1.5-pro
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    // Read from the stream and interpret the output as markdown
    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
      output.innerHTML = md.render(buffer.join(''));
    }
  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};




// You can delete this once you've filled out an API key
maybeShowApiKeyBanner(API_KEY);