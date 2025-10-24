const express = require('express');
const { paymentMiddleware } = require('x402-express');
const crypto = require('crypto');
const app = express();
const port = 4022; // Using a different port to avoid conflicts

// A simple in-memory database to store emote metadata.
const emoteDatabase = {}; // { "streamerId": [{ "emoteCode": "emote1", "arweaveTxId": "txId1" }] }

// A placeholder address for receiving payments.
const paymentAddress = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B";

// The URL of the public x402 facilitator.
const facilitatorUrl = "https://x402.org/facilitator";

/**
 * Simulates uploading a file to Arweave and returns a placeholder transaction ID.
 * In a real application, this would involve using the 'arweave-js' library.
 * @returns {Promise<string>} A placeholder Arweave transaction ID.
 */
async function simulateArweaveUpload() {
  // Generate a random 32-byte string to mimic an Arweave transaction ID.
  return new Promise(resolve => {
    setTimeout(() => { // Simulate network latency
      const placeholderTxId = crypto.randomBytes(32).toString('hex');
      console.log(`Simulated Arweave upload. Tx ID: ${placeholderTxId}`);
      resolve(placeholderTxId);
    }, 500);
  });
}

// Enable JSON body parsing for our endpoints.
app.use(express.json());

// Configure the x402 payment middleware.
app.use(
  paymentMiddleware(
    paymentAddress,
    {
      "POST /upload-emote": {
        price: "$0.01",
        network: "base-sepolia",
      },
    },
    {
      url: facilitatorUrl,
    }
  )
);

app.get('/', (req, res) => {
  res.send('Creator Platform Backend is running!');
});

app.post('/upload-emote', async (req, res) => {
  // This is a protected endpoint.
  const { streamerId, emoteCode } = req.body;

  if (!streamerId || !emoteCode) {
    return res.status(400).send({ message: "streamerId and emoteCode are required." });
  }

  try {
    const arweaveTxId = await simulateArweaveUpload();

    // Store the emote metadata in our in-memory database.
    if (!emoteDatabase[streamerId]) {
      emoteDatabase[streamerId] = [];
    }
    emoteDatabase[streamerId].push({ emoteCode, arweaveTxId });
    console.log("Updated emote database:", emoteDatabase);

    res.status(200).send({
      message: "Emote uploaded successfully!",
      arweaveTxId: arweaveTxId,
    });
  } catch (error) {
    console.error("Error during simulated Arweave upload:", error);
    res.status(500).send({ message: "Internal server error during upload." });
  }
});

app.get('/emotes/:streamerId', (req, res) => {
  const streamerId = req.params.streamerId;
  const emotes = emoteDatabase[streamerId] || [];
  res.status(200).send(emotes);
});

app.listen(port, () => {
  console.log(`Creator Platform server listening at http://localhost:${port}`);
});
