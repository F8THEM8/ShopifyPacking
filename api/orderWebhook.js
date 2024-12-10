// api/orderWebhook.js
import { downloadPackingSlip } from './utils/packingSlip'; // Import the download function

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Parse the webhook payload from Shopify
      const order = req.body;

      // Get the order number from the payload
      const orderNumber = order.id;  // or any other field that holds the order number

      // Trigger the downloadPackingSlip function with the order number
      await downloadPackingSlip(orderNumber);

      // Respond with a success message
      res.status(200).json({ message: 'Packing slip downloaded successfully' });
    } catch (error) {
      console.error('Error processing order webhook:', error);
      res.status(500).json({ error: 'Failed to process order webhook' });
    }
  } else {
    // If the method is not POST, respond with an error
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
