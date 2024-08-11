chrome.runtime.onInstalled.addListener(() => {
    console.log('Contextual Learning Assistant installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'fetchResources') {
        const query = message.query;
        const selectedPlatform = message.platform;

        // Make sure the query is not too long or empty
        const queryChunks = chunkQuery(query);

        const fetchFunctions = {
            'Stack Overflow': fetchStackOverflowResources,
            'GitHub': fetchGitHubRepositories,
            'MDN': fetchMDNResources,
            'DevDocs': fetchDevDocsResources,
            'W3Schools': fetchW3SchoolsResources,
            'Reddit': fetchRedditPosts
        };

        const fetchAllPlatforms = async () => {
            try {
                const results = await Promise.all(Object.values(fetchFunctions).map(fetchFunction =>
                    Promise.all(queryChunks.map(chunk => fetchFunction(chunk)))
                ));
                return results.flat(2);
            } catch (error) {
                console.error('Error fetching resources from all platforms:', error);
                return [];
            }
        };

        const fetchSinglePlatform = async (platform) => {
            const fetchFunction = fetchFunctions[platform];
            if (fetchFunction) {
                try {
                    const results = await Promise.all(queryChunks.map(chunk => fetchFunction(chunk)));
                    return results.flat();
                } catch (error) {
                    console.error(`Error fetching resources from ${platform}:`, error);
                    return [];
                }
            }
            return [];
        };

        (async () => {
            const resources = selectedPlatform === 'all' ? await fetchAllPlatforms() : await fetchSinglePlatform(selectedPlatform);
            sendResponse({ resources: resources });
        })();

        return true; // Keeps the message channel open for async sendResponse
    }
});

function chunkQuery(query, maxLength = 200) {
    if (query.length <= maxLength) return [query];

    const chunks = [];
    const words = query.split(' ');

    let chunk = '';
    words.forEach(word => {
        if ((chunk + word).length > maxLength) {
            chunks.push(chunk.trim());
            chunk = '';
        }
        chunk += `${word} `;
    });

    if (chunk) chunks.push(chunk.trim());
    return chunks;
}

async function fetchStackOverflowResources(query) {
    const apiUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&filter=!6VvPDzQ)UOOS&pagesize=5`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Stack Overflow API error: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error_id || data.error_message) {
            throw new Error(`Stack Overflow API error: ${data.error_message}`);
        }
        if (!data.items || data.items.length === 0) {
            console.warn('No results found for Stack Overflow.');
            return [];
        }
        return data.items.map(item => ({
            title: item.title,
            link: item.link,
            score: item.score,
            platform: 'Stack Overflow'
        }));
    } catch (error) {
        console.error('Error fetching Stack Overflow resources:', error);
        return [];
    }
}

async function fetchGitHubRepositories(query) {
    const apiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('GitHub API error');
        }
        const data = await response.json();
        if (data.message) {
            throw new Error(data.message);
        }
        return data.items.map(repo => ({
            title: repo.full_name,
            link: repo.html_url,
            score: repo.stargazers_count,
            platform: 'GitHub'
        }));
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        return [];
    }
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

async function fetchRedditPosts(query) {
    const apiUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=all&limit=5`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Reddit API error');
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        return data.data.children.map(post => ({
            title: post.data.title,
            link: `https://www.reddit.com${post.data.permalink}`,
            score: post.data.score,
            platform: 'Reddit'
        }));
    } catch (error) {
        console.error('Error fetching Reddit posts:', error);
        return [];
    }
}



// chrome.runtime.onInstalled.addListener(() => {
//     console.log('Contextual Learning Assistant installed');
// });

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.type === 'fetchResources') {
//         const query = message.query;
//         const selectedPlatform = message.platform;

//         const queryChunks = chunkQuery(query);

//         const fetchFunctions = {
//             'Stack Overflow': fetchStackOverflowResources,
//             'GitHub': fetchGitHubRepositories,
//             'MDN': fetchMDNResources,
//             'DevDocs': fetchDevDocsResources,
//             'W3Schools': fetchW3SchoolsResources,
//             'Reddit': fetchRedditPosts
//         };

//         const fetchAllPlatforms = () => {
//             const allPromises = Object.values(fetchFunctions).map(fetchFunction =>
//                 Promise.all(queryChunks.map(chunk => fetchFunction(chunk)))
//             );

//             return Promise.all(allPromises)
//                 .then(results => [].concat(...results.flat()))
//                 .catch(error => {
//                     console.error('Error fetching resources from all platforms:', error);
//                     return [];
//                 });
//         };

//         const fetchSinglePlatform = (platform) => {
//             const fetchFunction = fetchFunctions[platform];
//             if (fetchFunction) {
//                 return Promise.all(queryChunks.map(chunk => fetchFunction(chunk)))
//                     .then(results => [].concat(...results))
//                     .catch(error => {
//                         console.error(`Error fetching resources from ${platform}:`, error);
//                         return [];
//                     });
//             }
//             return Promise.resolve([]);
//         };

//         const fetchResources = selectedPlatform === 'all' ? fetchAllPlatforms() : fetchSinglePlatform(selectedPlatform);

//         fetchResources.then(resources => {
//             sendResponse({ resources: resources });
//         });

//         return true;  // Keeps the message channel open for async sendResponse
//     }
// });

// function chunkQuery(query, maxLength = 200) {
//     if (query.length <= maxLength) return [query];

//     const chunks = [];
//     const words = query.split(' ');

//     let chunk = '';
//     words.forEach(word => {
//         if ((chunk + word).length > maxLength) {
//             chunks.push(chunk.trim());
//             chunk = '';
//         }
//         chunk += `${word} `;
//     });

//     if (chunk) chunks.push(chunk.trim());
//     return chunks;
// }
// function fetchStackOverflowResources(query) {
//     const apiUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&filter=!6VvPDzQ)UOOS&pagesize=5`;

//     return fetch(apiUrl)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error(`Stack Overflow API error: ${response.statusText}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.error_id || data.error_message) {
//                 throw new Error(`Stack Overflow API error: ${data.error_message}`);
//             }
//             if (!data.items || data.items.length === 0) {
//                 console.warn('No results found for Stack Overflow.');
//                 return [];
//             }
//             return data.items.map(item => ({
//                 title: item.title,
//                 link: item.link,
//                 score: item.score,
//                 platform: 'Stack Overflow'
//             }));
//         })
//         .catch(error => {
//             console.error('Error fetching Stack Overflow resources:', error);
//             return [];
//         });
// }


// function fetchGitHubRepositories(query) {
//     const apiUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`;

//     return fetch(apiUrl)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('GitHub API error');
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.message) {
//                 throw new Error(data.message);
//             }
//             return data.items.map(repo => ({
//                 title: repo.full_name,
//                 link: repo.html_url,
//                 score: repo.stargazers_count,
//                 platform: 'GitHub'
//             }));
//         })
//         .catch(error => {
//             console.error('Error fetching GitHub repositories:', error);
//             return [];
//         });
// }

// function fetchMDNResources(query) {
//     const searchUrl = `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(query)}`;

//     return Promise.resolve([{
//         title: `Search results for "${query}" on MDN`,
//         link: searchUrl,
//         score: null,
//         platform: 'MDN'
//     }]);
// }

// function fetchDevDocsResources(query) {
//     const searchUrl = `https://devdocs.io/#q=${encodeURIComponent(query)}`;

//     return Promise.resolve([{
//         title: `Search results for "${query}" on DevDocs`,
//         link: searchUrl,
//         score: null,
//         platform: 'DevDocs'
//     }]);
// }

// function fetchW3SchoolsResources(query) {
//     const searchUrl = `https://www.w3schools.com/search/search_result.asp?query=${encodeURIComponent(query)}`;

//     return Promise.resolve([{
//         title: `Search results for "${query}" on W3Schools`,
//         link: searchUrl,
//         score: null,
//         platform: 'W3Schools'
//     }]);
// }

// function fetchRedditPosts(query) {
//     const apiUrl = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=all&limit=5`;

//     return fetch(apiUrl)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Reddit API error');
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.error) {
//                 throw new Error(data.error);
//             }
//             return data.data.children.map(post => ({
//                 title: post.data.title,
//                 link: `https://www.reddit.com${post.data.permalink}`,
//                 score: post.data.score,
//                 platform: 'Reddit'
//             }));
//         })
//         .catch(error => {
//             console.error('Error fetching Reddit posts:', error);
//             return [];
//         });
// }


