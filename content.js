// This script will analyze the content of the current web page
console.log("Content script running on:", window.location.href);

// Example: You could extract keywords or analyze the page content here
const keywords = document.querySelector('meta[name="keywords"]') ? document.querySelector('meta[name="keywords"]').content : '';
console.log("Keywords found:", keywords);

// This script extracts headings and meta keywords from the document
// console.log("Content script running on:", window.location.href);

// function extractHeadingsAndKeywords() {
//     // Extract all headings
//     const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(el => el.textContent.trim());
    
//     // Extract meta keywords
//     const metaKeywords = document.querySelector('meta[name="keywords"]') ? document.querySelector('meta[name="keywords"]').content : '';

//     return { headings, metaKeywords };
// }

// const { headings, metaKeywords } = extractHeadingsAndKeywords();

// console.log("Headings found:", headings);
// console.log("Meta keywords found:", metaKeywords);

// // Send the extracted data to the background script
// chrome.runtime.sendMessage({
//     type: 'documentData',
//     headings: headings,
//     keywords: metaKeywords
// });

