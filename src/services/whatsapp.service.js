const axios = require('axios');

// Using official WhatsApp Cloud API
const sendWhatsAppMessage = async (to, templateName, components = []) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${process.env.WA_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en_US'
          },
          components: components
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('WhatsApp message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('WhatsApp Error:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp message');
  }
};

module.exports = { sendWhatsAppMessage };
