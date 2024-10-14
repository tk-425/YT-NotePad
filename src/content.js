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

function containerStyle(container) {
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.right = '20px';
  container.style.width = '400px';
  container.style.backgroundColor = '#fff';
  container.style.border = '1px solid #ccc';
  container.style.borderRadius = '8px';
  container.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  container.style.zIndex = '9999';
  container.style.overflow = 'hidden';
}

function headerStyle(header) {
  header.style.backgroundColor = '#f1f1f1';
  header.style.padding = '10px';
  header.style.cursor = 'move';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
}

function titleStyle(title) {
  title.textContent = 'Note';
}

function buttonContainerStyle(buttonContainer) {
  buttonContainer.style.display = 'flex';
  buttonContainer.style.gap = '10px';
}

function saveButtonStyle(saveBtn) {
  saveBtn.textContent = 'Save';
  saveBtn.style.background = '#4CAF50';
  saveBtn.style.color = 'white';
  saveBtn.style.border = 'none';
  saveBtn.style.padding = '5px 10px';
  saveBtn.style.cursor = 'pointer';
  saveBtn.style.borderRadius = '4px';
}

function clearButtonStyle(clearBtn) {
  clearBtn.textContent = 'Clear';
  clearBtn.style.background = '#f44336';
  clearBtn.style.color = 'white';
  clearBtn.style.border = 'none';
  clearBtn.style.padding = '5px 10px';
  clearBtn.style.cursor = 'pointer';
  clearBtn.style.borderRadius = '4px';
}

function minimizeButtonStyle(minimizeBtn) {
  minimizeBtn.textContent = '-';
  minimizeBtn.style.background = 'none';
  minimizeBtn.style.border = 'none';
  minimizeBtn.style.cursor = 'pointer';
  minimizeBtn.style.fontSize = '18px';
}

function textareaStyle(textarea) {
  textarea.placeholder = 'Add a comment...';
  textarea.style.width = '100%';
  textarea.style.height = '150px';
  textarea.style.padding = '10px';
  textarea.style.border = 'none';
  textarea.style.resize = 'none';
  textarea.style.fontSize = '14px';
  textarea.style.boxSizing = 'border-box';
  textarea.style.outline = 'none';
}

function resizeHandleStyle(resizeHandle) {
  resizeHandle.style.width = '10px';
  resizeHandle.style.height = '10px';
  resizeHandle.style.backgroundColor = '#ccc';
  resizeHandle.style.position = 'absolute';
  resizeHandle.style.right = '0';
  resizeHandle.style.bottom = '0';
  resizeHandle.style.cursor = 'se-resize';
}

function createNotePad() {
  // Create the main container
  const container = document.createElement('div');
  containerStyle(container);

  // Create the header
  const header = document.createElement('div');
  headerStyle(header);

  const title = document.createElement('span');
  titleStyle(title);
  header.appendChild(title);

  const buttonContainer = document.createElement('div');
  buttonContainerStyle(buttonContainer);

  // Create Save button
  const saveBtn = document.createElement('button');
  saveButtonStyle(saveBtn);
  buttonContainer.appendChild(saveBtn);

  // Create Clear button
  const clearBtn = document.createElement('button');
  clearButtonStyle(clearBtn);
  buttonContainer.appendChild(clearBtn);

  const minimizeBtn = document.createElement('button');
  minimizeButtonStyle(minimizeBtn);
  buttonContainer.appendChild(minimizeBtn);

  header.appendChild(buttonContainer);

  // Create the textarea
  const textarea = document.createElement('textarea');
  textareaStyle(textarea);

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
  const MIN_WIDTH = 400;
  const MIN_HEIGHT = 200;

  const resizeHandle = document.createElement('div');
  resizeHandleStyle(resizeHandle);
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
      const width = Math.max(MIN_WIDTH, startWidth + e.clientX - startX);
      const height = Math.max(MIN_HEIGHT, startHeight + e.clientY - startY);
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
      container.style.height =
        Math.max(MIN_HEIGHT, startHeight || MIN_HEIGHT) + 'px';
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
      const fileName =
        prompt('Enter file name:', 'comment.txt') || 'comment.txt';
      const blob = new Blob([comment], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName; // Use the user-defined filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Free up memory
      textarea.value = ''; // Clear the textarea
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
