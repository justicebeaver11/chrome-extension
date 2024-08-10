

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-bar');
    const getResourcesButton = document.getElementById('get-resources');

    getResourcesButton.addEventListener('click', function() {
        // Get the active tab
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];

            // Use the value from the search bar or fall back to the active tab's title
            const query = searchInput.value.trim() !== '' ? searchInput.value.trim() : activeTab.title;

            // Send a message to the background script to fetch resources
            chrome.runtime.sendMessage(
                { type: 'fetchResources', query: query },
                function(response) {
                    const resourcesList = document.getElementById('resources-list');
                    resourcesList.innerHTML = ''; // Clear any previous results

                    if (response.resources && response.resources.length > 0) {
                        response.resources.forEach(resource => {
                            const listItem = document.createElement('li');
                            const link = document.createElement('a');
                            link.href = resource.link;
                            link.textContent = resource.platform === 'MDN' || resource.platform === 'DevDocs' || resource.platform === 'W3Schools' || resource.platform === 'Reddit'
                                ? `${resource.title}`
                                : `${resource.title} (Score: ${resource.score}) - ${resource.platform}`;
                            link.target = '_blank'; // Open link in a new tab
                            listItem.appendChild(link);
                            resourcesList.appendChild(listItem);
                        });
                    } else {
                        resourcesList.innerHTML = '<li>No resources found.</li>';
                    }
                }
            );
        });
    });
});









