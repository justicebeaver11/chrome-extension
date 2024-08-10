

chrome.runtime.onInstalled.addListener(() => {
    console.log('Contextual Learning Assistant installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'fetchResources') {
        const query = message.query; // Use the full page content as the query

        // Split the query into manageable chunks if it's too large
        const queryChunks = chunkQuery(query);

        // Fetch resources from multiple platforms for each chunk
        const resourcePromises = queryChunks.map(chunk =>
            Promise.all([
                fetchStackOverflowResources(chunk),
                fetchGitHubRepositories(chunk),
                fetchMDNResources(chunk),
                fetchDevDocsResources(chunk),
                fetchW3SchoolsResources(chunk),
                fetchRedditPosts(chunk)
            ])
        );

        Promise.all(resourcePromises)
            .then(results => {
                const combinedResources = [].concat(...results.flat());
                sendResponse({ resources: combinedResources });
            })
            .catch(error => {
                console.error('Error fetching resources:', error);
                sendResponse({ resources: [] });
            });

        return true; // Keeps the message channel open for sendResponse
    }
});

function chunkQuery(query, maxLength = 200) {
    if (query.length <= maxLength) return [query];

    const chunks = [];
    const words = query.split(' ');

    let chunk = '';
    words.forEach(word => {
        if ((chunk + word).length > maxLength) {
            chunks.push(chunk);
            chunk = '';
        }
        chunk += ` ${word}`;
    });

    if (chunk) chunks.push(chunk.trim());
    return chunks;
}

function fetchStackOverflowResources(query) {
    const apiUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&filter=default&pagesize=5`;

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error_message) {
                throw new Error(data.error_message);
            }
            return data.items.map(item => ({
                title: item.title,
                link: item.link,
                score: item.score,
                platform: 'Stack Overflow'
            }));
        });
}

function fetchGitHubRepositories(query) {
    const apiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`;

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                throw new Error(data.message);
            }
            return data.items.map(repo => ({
                title: repo.full_name,
                link: repo.html_url,
                score: repo.stargazers_count,
                platform: 'GitHub'
            }));
        });
}

function fetchMDNResources(query) {
    const searchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`;

    return Promise.resolve([{
        title: `Search results for "${query}" on MDN`,
        link: searchUrl,
        score: null,
        platform: 'MDN'
    }]);
}

function fetchDevDocsResources(query) {
    const searchUrl = `https://devdocs.io/#q=${encodeURIComponent(query)}`;

    return Promise.resolve([{
        title: `Search results for "${query}" on DevDocs`,
        link: searchUrl,
        score: null,
        platform: 'DevDocs'
    }]);
}

function fetchW3SchoolsResources(query) {
    const searchUrl = `https://www.w3schools.com/search/search_result.asp?query=${encodeURIComponent(query)}`;

    return Promise.resolve([{
        title: `Search results for "${query}" on W3Schools`,
        link: searchUrl,
        score: null,
        platform: 'W3Schools'
    }]);
}

function fetchRedditPosts(query) {
    const apiUrl = `https://www.reddit.com/r/programming/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=relevance&t=all&limit=5`;

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            return data.data.children.map(post => ({
                title: post.data.title,
                link: `https://www.reddit.com${post.data.permalink}`,
                score: post.data.score,
                platform: 'Reddit'
            }));
        });
}







