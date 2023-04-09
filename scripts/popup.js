document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('highlightBtn').addEventListener('click', () => {
      console.log('Click on highlight');
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'highlight' }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else if (response && response.success) {
            console.log('Text highlighted and saved:', response.text);
          } else {
            console.log('No text selected or failed to save the text.');
          }
        });
      });
    });
  });