// Handle extension button click
chrome.action.onClicked.addListener((tab) => {
  // Only send message if we're on a YouTube video page
  if (tab.url.includes('youtube.com/watch')) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleNotepad' });
  }
});
