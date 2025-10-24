console.log("Permanent Creator Platform content script loaded!");

const ARWEAVE_GATEWAY = 'https://arweave.net/';
let emotes = [];

async function fetchEmotes() {
  // In a real extension, the streamer ID would be dynamically determined.
  // For this PoC, we'll use a hardcoded placeholder.
  const streamerId = 'test-streamer';
  try {
    const response = await fetch(`http://localhost:4022/emotes/${streamerId}`);
    if (response.ok) {
      emotes = await response.json();
      console.log("Loaded permanent emotes:", emotes);
    }
  } catch (error) {
    console.error("Failed to fetch permanent emotes:", error);
  }
}

function replaceEmotesInChatMessage(messageElement) {
  if (!emotes.length) return;

  let html = messageElement.innerHTML;
  let replaced = false;

  emotes.forEach(emote => {
    const emoteCode = emote.emoteCode;
    const emoteUrl = `${ARWEAVE_GATEWAY}${emote.arweaveTxId}`;
    // A simple regex to replace the emote code, avoiding replacement within HTML tags.
    // This could be more robust in a production extension.
    const regex = new RegExp(`\\b${emoteCode}\\b`, 'g');
    if (regex.test(html)) {
      html = html.replace(regex, `<img src="${emoteUrl}" alt="${emoteCode}" title="${emoteCode}" style="height: 28px; vertical-align: middle; margin: -1px 2px;">`);
      replaced = true;
    }
  });

  if (replaced) {
    messageElement.innerHTML = html;
  }
}

// Observe the chat for new messages and apply the emote replacement.
const chatObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === 1 && node.matches('.chat-line__message')) {
        // This selector is an example and might need to be updated for the current Twitch UI.
        const messageBody = node.querySelector('.text-fragment, .chat-line__message-body');
        if (messageBody) {
          replaceEmotesInChatMessage(messageBody);
        }
      }
    });
  });
});

// Start observing the chat container when the page is loaded.
// The selector for the chat container may need to be updated.
const chatContainer = document.querySelector('.chat-scrollable-area__message-container');
if (chatContainer) {
  chatObserver.observe(chatContainer, { childList: true, subtree: true });
  console.log("Observing Twitch chat for new messages.");
}

// Fetch the emotes when the script is first loaded.
fetchEmotes();

// And refresh them periodically.
setInterval(fetchEmotes, 60000); // every 60 seconds
