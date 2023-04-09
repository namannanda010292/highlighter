console.log('Content script loaded.');
function saveText(text) {
    chrome.runtime.sendMessage({ action: 'saveHighlight', text: text }, (response) => {
      if (response && response.success) {
        console.log('Text saved:', text);
      } else {
        console.log('Failed to save the text.');
      }
    });
  }
  
  function getSelectedText() {
    const selectedText = window.getSelection().toString();
    if (selectedText) {
      saveText(selectedText);
    }
  }
  
  // receives event from popup.js
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlight') {
      const selectedText = window.getSelection().toString();
      if (selectedText) {
        saveText(selectedText);
        sendResponse({ success: true, text: selectedText });
      } else {
        sendResponse({ success: false });
      }
    }
  });


// Create the highlight button
const highlightButton = document.createElement('button');
highlightButton.textContent = 'Highlight Text';
highlightButton.style.display = 'none';
highlightButton.style.position = 'fixed';
highlightButton.style.zIndex = '10000';
highlightButton.style.backgroundColor = 'yellow';
highlightButton.style.border = 'none';
highlightButton.style.padding = '5px 10px';
highlightButton.style.cursor = 'pointer';
highlightButton.style.borderRadius = '3px';
highlightButton.style.fontSize = '14px';
document.body.appendChild(highlightButton);

// Listen for the mouseup event
document.addEventListener('mouseup', (event) => {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText.length > 0) {
    highlightButton.style.display = 'block';
    highlightButton.style.top = `${event.pageY}px`;
    highlightButton.style.left = `${event.pageX}px`;

    highlightButton.onclick = () => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        saveText(selectedText, range);
        highlightSelectedText(range);
        highlightButton.style.display = 'none';
        selection.removeAllRanges();
      };

  } else {
    highlightButton.style.display = 'none';
  }
});


// Listen for the window scroll event
window.addEventListener('scroll', () => {
  highlightButton.style.display = 'none';
});

function highlightSelectedText(range) {
    function createHighlightSpan() {
      const span = document.createElement('span');
      span.className = 'text-highlight';
      span.style.backgroundColor = 'yellow';
      return span;
    }
  
    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const span = createHighlightSpan();
        node.parentNode.insertBefore(span, node);
        span.appendChild(node);
      } else {
        for (let i = 0; i < node.childNodes.length; i++) {
          processNode(node.childNodes[i]);
          if (node.childNodes[i].nodeType === Node.ELEMENT_NODE && node.childNodes[i].classList.contains('text-highlight')) {
            i++;
          }
        }
      }
    }
  
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      const startNode = range.startContainer.splitText(range.startOffset);
      processNode(startNode);
    } else {
      processNode(range.startContainer);
    }
  
    if (range.endContainer.nodeType === Node.TEXT_NODE) {
      range.endContainer.splitText(range.endOffset);
    }
  }
  

  function rangeToXPath(range) {
    const startContainerXPath = getNodeXPath(range.startContainer);
    const endContainerXPath = getNodeXPath(range.endContainer);
    return {
      startContainerXPath,
      endContainerXPath,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
    };
  }
  
  function xpathToRange(xPathRange) {
    const range = document.createRange();
    const startContainer = getNodeByXPath(xPathRange.startContainerXPath);
    const endContainer = getNodeByXPath(xPathRange.endContainerXPath);
    range.setStart(startContainer, xPathRange.startOffset);
    range.setEnd(endContainer, xPathRange.endOffset);
    return range;
  }
  
  function getNodeXPath(node) {
    const parts = [];
    while (node && node.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      for (let sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
          index++;
        }
      }
      parts.unshift(`${node.nodeName}[${index}]`);
      node = node.parentNode;
    }
    return parts.length ? '/' + parts.join('/') : null;
  }
  
  function getNodeByXPath(xPath) {
    return document.evaluate(xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  }

  function reapplyHighlights() {
    chrome.runtime.sendMessage({ action: 'getHighlights', url: window.location.href }, (response) => {
      if (response && response.highlights) {
        response.highlights.forEach((highlight) => {
          const range = xpathToRange(highlight.xPathRange);
          highlightSelectedText(range);
        });
      }
    });
  }
  
  // Call the reapplyHighlights function when the page is loaded
  reapplyHighlights();