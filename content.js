function getLinkedInProfileInfo() {
  const name = document.querySelector('h1')?.innerText.trim() || "";
  const headlineElement = document.querySelector('.text-body-medium.break-words');
  const headline = headlineElement?.innerText.trim() || "";

  return { name, headline };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getProfileInfo") {
    const data = getLinkedInProfileInfo();
    sendResponse(data);
    return true;
  }
});
