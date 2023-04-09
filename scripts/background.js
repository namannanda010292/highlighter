// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === 'saveHighlight') {

//     console.log("trying to save highlight")
//       let text = request.text;
//       chrome.storage.local.get('highlights', (data) => {
//         let highlights = data.highlights || [];
//         highlights.push({ text: text, timestamp: new Date().toISOString() });
//         chrome.storage.local.set({ highlights: highlights }, () => {
//           if (chrome.runtime.lastError) {
//             console.error('Error saving highlights:', chrome.runtime.lastError.message);
//             sendResponse({ success: false });
//           } else {
//             console.log('Text saved:', text);
//             sendResponse({ success: true });
//           }
//         });
//       });
//     }
//     return true; // Keeps the message channel open for sendResponse
//   });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'saveHighlight') {
        const {
            text,
            url,
            xPathRange
        } = request;

        console.log(request)
        chrome.storage.local.get('highlights', (result) => {
            let highlights = result.highlights || {};
            if (!highlights[url]) {
                highlights[url] = [];
            }
            highlights[url].push({
                text,
                xPathRange
            });
            chrome.storage.local.set({
                highlights
            }, () => {
                sendResponse({
                    success: true
                });
            });
        });
        return true; // Required to use sendResponse asynchronously
    } else if (request.action === 'getHighlights') {
        chrome.storage.local.get('highlights', (result) => {
            const highlights = result.highlights || {};
            sendResponse({
                highlights: highlights[request.url] || []
            });
        });
        return true; // Required to use sendResponse asynchronously
    }
});