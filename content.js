// Global variable to track if notepad is created
let notepadContainer = null;
let textareaElement = null;

// Create a MutationObserver to watch for YouTube navigation
const observer = new MutationObserver((mutations) => {
  if (window.location.pathname === '/watch') {
    // Clear textarea if it exists
    if (textareaElement) {
      textareaElement.value = '';
    }
  }
});

// Start observing the document with the configured parameters
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
});

// Listen for messages from the extension button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleNotepad') {
    if (!notepadContainer) {
      createNotePad();
    } else {
      toggleNotepadVisibility();
    }
  }
});

function toggleNotepadVisibility() {
  if (notepadContainer) {
    const currentDisplay = window.getComputedStyle(notepadContainer).display;
    notepadContainer.style.display =
      currentDisplay === 'none' ? 'block' : 'none';
  }
}

function createContainer() {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.bottom = '20px';
  div.style.right = '20px';
  div.style.width = '400px';
  div.style.backgroundColor = '#fff';
  div.style.border = '1px solid #ccc';
  div.style.borderRadius = '8px';
  div.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  div.style.zIndex = '9999';
  div.style.overflow = 'hidden';

  return div;
}

function createHeader() {
  const div = document.createElement('div');
  div.style.backgroundColor = '#f1f1f1';
  div.style.padding = '10px';
  div.style.cursor = 'move';
  div.style.display = 'flex';
  div.style.justifyContent = 'space-between';
  div.style.alignItems = 'center';

  return div;
}

function createTitle() {
  const span = document.createElement('span');
  span.textContent = 'Note';

  return span;
}

function createButtonContainer() {
  const div = document.createElement('div');
  div.style.display = 'flex';
  div.style.gap = '10px';

  return div;
}

function createSaveButton() {
  const button = document.createElement('button');
  button.textContent = 'Save';
  button.style.background = '#4CAF50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '5px 10px';
  button.style.cursor = 'pointer';
  button.style.borderRadius = '4px';

  return button;
}

function createClearButton() {
  const button = document.createElement('button');
  button.textContent = 'Clear';
  button.style.background = '#f44336';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '5px 10px';
  button.style.cursor = 'pointer';
  button.style.borderRadius = '4px';

  return button;
}

function createMinimizeButton() {
  const button = document.createElement('button');
  button.textContent = '-';
  button.style.background = 'none';
  button.style.border = 'none';
  button.style.cursor = 'pointer';
  button.style.fontSize = '18px';

  return button;
}

function createTextArea() {
  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Add a comment...';
  textarea.style.width = '100%';
  textarea.style.height = '150px';
  textarea.style.padding = '10px';
  textarea.style.border = 'none';
  textarea.style.resize = 'none';
  textarea.style.fontSize = '14px';
  textarea.style.boxSizing = 'border-box';
  textarea.style.outline = 'none';

  return textarea;
}

function createResizableHandle() {
  const div = document.createElement('div');
  div.style.width = '10px';
  div.style.height = '10px';
  div.style.backgroundColor = '#ccc';
  div.style.position = 'absolute';
  div.style.right = '0';
  div.style.bottom = '0';
  div.style.cursor = 'se-resize';

  return div;
}

function createNotePad() {
  // Create the main container
  const container = createContainer();

  // Create the header
  const header = createHeader();

  // Title bar
  header.appendChild(createTitle());

  // Button container
  const buttonContainer = createButtonContainer();

  // Create Save button
  buttonContainer.appendChild(createSaveButton());

  // Create Clear button
  buttonContainer.appendChild(createClearButton());

  // Create Minimize button
  buttonContainer.appendChild(createMinimizeButton());

  header.appendChild(buttonContainer);

  // Create the textarea
  const textarea = createTextArea();

  // Store textarea reference globally
  textareaElement = textarea;

  // Add elements to the container
  container.appendChild(header);
  container.appendChild(textarea);

  // Add the container to the body
  document.body.appendChild(container);
  notepadContainer = container;

  // Drag functionality
  let isDragging = false;
  let startX, startY;

  header.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);

  function startDragging(e) {
    if (e.target === header) {
      isDragging = true;
      startX = e.clientX - container.offsetLeft;
      startY = e.clientY - container.offsetTop;
    }
  }

  function drag(e) {
    if (isDragging) {
      container.style.left = e.clientX - startX + 'px';
      container.style.top = e.clientY - startY + 'px';
      container.style.right = 'auto';
      container.style.bottom = 'auto';
    }
  }

  function stopDragging() {
    isDragging = false;
  }

  // Resize functionality
  let isResizing = false;
  let startWidth, startHeight;

  const resizeHandle = createResizableHandle();
  container.appendChild(resizeHandle);

  resizeHandle.addEventListener('mousedown', startResizing);
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResizing);

  function startResizing(e) {
    isResizing = true;
    startWidth = parseInt(
      document.defaultView.getComputedStyle(container).width,
      10
    );
    startHeight = parseInt(
      document.defaultView.getComputedStyle(container).height,
      10
    );
    startX = e.clientX;
    startY = e.clientY;
  }

  function resize(e) {
    if (isResizing) {
      const width = startWidth + e.clientX - startX;
      const height = startHeight + e.clientY - startY;
      container.style.width = width + 'px';
      container.style.height = height + 'px';
      textarea.style.height = height - header.offsetHeight + 'px';
    }
  }

  function stopResizing() {
    isResizing = false;
  }

  // Minimize/Maximize functionality
  let isMinimized = false;

  minimizeBtn.addEventListener('click', toggleMinimize);

  function toggleMinimize() {
    if (isMinimized) {
      textarea.style.display = 'block';
      resizeHandle.style.display = 'block';
      container.style.height = 'auto';
      minimizeBtn.textContent = '-';
    } else {
      textarea.style.display = 'none';
      resizeHandle.style.display = 'none';
      container.style.height = header.offsetHeight + 'px';
      minimizeBtn.textContent = '+';
    }
    isMinimized = !isMinimized;
  }

  // Save functionality
  saveBtn.addEventListener('click', saveComment);

  function saveComment() {
    const comment = textarea.value.trim();
    if (comment) {
      console.log('Saving comment:', comment);
      // Here you would typically send the comment to a server
      // For now, we'll just log it and clear the textarea
      textarea.value = '';
      alert('Comment saved!');
    } else {
      alert('Please enter a comment before saving.');
    }
  }

  // Clear functionality
  clearBtn.addEventListener('click', clearComment);

  function clearComment() {
    if (textarea.value.trim()) {
      if (confirm('Are you sure you want to clear the textarea?')) {
        textarea.value = '';
      }
    }
  }
}

// Cleanup function
function cleanup() {
  observer.disconnect();
  if (notepadContainer) {
    notepadContainer.remove();
    notepadContainer = null;
    textareaElement = null;
  }
}

// Add cleanup when extension is updated or removed
chrome.runtime.onSuspend.addListener(cleanup);
