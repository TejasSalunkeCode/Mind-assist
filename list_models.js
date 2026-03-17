
const apiKey = "AIzaSyBBU6RM2hjwp_96-c9p51t_2cfuVjOAFQc";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  console.log("Listing models...");
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("Status:", response.status);
    if (data.models) {
      console.log("Available models:", data.models.map(m => m.name));
    } else {
      console.log("No models found:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}

listModels();
