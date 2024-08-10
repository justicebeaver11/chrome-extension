// This script will analyze the content of the current web page
console.log("Content script running on:", window.location.href);

// Example: You could extract keywords or analyze the page content here
const keywords = document.querySelector('meta[name="keywords"]') ? document.querySelector('meta[name="keywords"]').content : '';
console.log("Keywords found:", keywords);

// If you plan to extend the functionality, you can use this as a basis for more advanced content analysis
 