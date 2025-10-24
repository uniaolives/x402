// Note: In a real extension, you would use a bundler like Webpack or Parcel
// to include the 'axios' and 'x402-axios' libraries. For this PoC,
// we are using a simplified fetch() call to demonstrate the flow.

document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('upload-form');
  const statusDiv = document.getElementById('status');

  uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    statusDiv.textContent = "Initiating emote upload...";

    const streamerId = document.getElementById('streamerId').value;
    const emoteCode = document.getElementById('emoteCode').value;

    // In a real implementation, you would use x402-axios here to handle
    // the 402 payment flow automatically.
    try {
      const initialResponse = await fetch('http://localhost:4022/upload-emote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamerId, emoteCode }),
      });

      if (initialResponse.status === 402) {
        statusDiv.textContent = "Payment required. In a real extension, x402-axios would handle this automatically.";
        // Here, x402-axios would automatically make the payment and retry the request.
        // Since we are not using the library directly, we will stop here for the PoC.
      } else if (initialResponse.ok) {
        const data = await initialResponse.json();
        statusDiv.textContent = `Upload successful! Arweave Tx ID: ${data.arweaveTxId}`;
      } else {
        statusDiv.textContent = `Error: ${initialResponse.statusText}`;
      }
    } catch (error) {
      console.error("Upload failed:", error);
      statusDiv.textContent = "Upload failed. See console for details.";
    }
  });
});
