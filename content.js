console.log("Content script running on:", window.location.href);

// Extract keywords from meta tags
const keywordsMetaTag = document.querySelector('meta[name="keywords"]');
const keywords = keywordsMetaTag ? keywordsMetaTag.content.split(',').map(k => k.trim()) : [];
console.log("Keywords found:", keywords);

// Extract title and description from the meta tags
const title = document.title;
const descriptionMetaTag = document.querySelector('meta[name="description"]');
const description = descriptionMetaTag ? descriptionMetaTag.content : '';

// Extract subtitles or key sections
const subtitles = Array.from(document.querySelectorAll('h2, h3, h4')).map(el => el.innerText);
console.log("Subtitles found:", subtitles);

console.log("Page title:", title);
console.log("Description found:", description);

// Send extracted data back to the background script
chrome.runtime.sendMessage({
    type: 'pageContentAnalyzed',
    data: {
        url: window.location.href,
        title: title,
        subtitles: subtitles, // Send subtitles to the background script
        keywords: keywords,
        description: description
    }
}, response => {
    console.log("Background script responded with:", response);
});

// Optional: Extracting visible text content (useful for more in-depth analysis)
const visibleText = document.body.innerText;
console.log("Extracted visible text content:", visibleText.slice(0, 200) + "...");

// Optional: You could analyze the visibleText for key phrases or additional insights
// E.g., perform a basic keyword density analysis
function analyzeTextContent(text) {
    const wordFrequency = {};
    const words = text.toLowerCase().match(/\b\w+\b/g);

    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    return wordFrequency;
}

const wordFrequency = analyzeTextContent(visibleText);
console.log("Word frequency analysis:", wordFrequency);


