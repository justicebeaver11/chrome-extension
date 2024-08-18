document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-bar');
    const getResourcesButton = document.getElementById('get-resources');
    const saveSettingsButton = document.getElementById('save-settings');
    const platformFilter = document.getElementById('platform-filter');
    const sortFilter = document.getElementById('sort-filter');
    const resourcesList = document.getElementById('resources-list');

    // Load saved settings
    chrome.storage.sync.get(['platform', 'sort'], function(settings) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            return;
        }
        if (settings.platform) {
            platformFilter.value = settings.platform;
        }
        if (settings.sort) {
            sortFilter.value = settings.sort;
        }
    });

    // Fetch resources on button click
    getResourcesButton.addEventListener('click', function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const activeTab = tabs[0];
            const query = searchInput.value.trim() !== '' ? searchInput.value.trim() : activeTab.title;
            const selectedPlatform = platformFilter.value;

            chrome.runtime.sendMessage(
                { type: 'fetchResources', query: query, platform: selectedPlatform },
                function(response) {
                    resourcesList.innerHTML = '';

                    if (response.resources && response.resources.length > 0) {
                        response.resources.forEach(resource => {
                            const listItem = document.createElement('li');
                            const link = document.createElement('a');
                            link.href = resource.link;
                            link.textContent = resource.platform === 'MDN' || resource.platform === 'DevDocs' || resource.platform === 'W3Schools' || resource.platform === 'Reddit'
                                ? `${resource.title}`
                                : `${resource.title} (Score: ${resource.score}) - ${resource.platform}`;
                            link.target = '_blank';
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

    // Save settings on button click
    saveSettingsButton.addEventListener('click', function() {
        const selectedPlatform = platformFilter.value;
        const selectedSort = sortFilter.value;

        chrome.storage.sync.set({ platform: selectedPlatform, sort: selectedSort }, function() {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                return;
            }
            console.log('Settings saved:', { platform: selectedPlatform, sort: selectedSort });
            alert('Settings saved successfully!');
        });
    });
});


