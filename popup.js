document.addEventListener("DOMContentLoaded", () => {
  const purposeInput = document.getElementById("purpose");
  const outputBox = document.getElementById("output");
  const loading = document.getElementById("loading");
  const copyBtn = document.getElementById("copy");
  const generateBtn = document.getElementById("generate");

  let profile = {};

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getProfileInfo" }, (res) => {
      if (!res) return;

      profile = res;
      document.getElementById("name").textContent = profile.name;
      document.getElementById("headline").textContent = profile.headline;

      const role = profile.headline.toLowerCase();
      if (role.includes("recruiter")) {
        purposeInput.placeholder = "e.g., Ask about job opportunities";
      } else if (role.includes("engineer")) {
        purposeInput.placeholder = "e.g., Connect as fellow developer";
      } else {
        purposeInput.placeholder = "e.g., Ask to connect or collaborate";
      }
    });
  });

  generateBtn.addEventListener("click", async () => {
    const purpose = purposeInput.value.trim() || purposeInput.placeholder;
    if (!purpose) return;

    outputBox.value = "";
    loading.style.display = "block";
    copyBtn.style.display = "none";
    generateBtn.disabled = true;

    const prompt = `Write a short, professional LinkedIn message to ${profile.name} who is a ${profile.headline}. The purpose is: "${purpose}"`;

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content: "You are a professional assistant that writes LinkedIn connection messages."
            },
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content || "Could not generate message.";
      outputBox.value = message;
      copyBtn.style.display = "block";

    } catch (error) {
      outputBox.value = "❌ Error generating message. Check your API key or internet connection.";
    }

    loading.style.display = "none";
    generateBtn.disabled = false;
  });

  copyBtn.addEventListener("click", () => {
    outputBox.select();
    document.execCommand("copy");
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
  });
});
