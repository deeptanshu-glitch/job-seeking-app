import Twilio from 'twilio';

const client = (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) ? Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN) : null;

export default async function sendSms(to, body) {
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('[DEVELOPMENT SMS] to:', to, 'body:', body);
    return false;
  }

  try {
    await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return true;
  } catch (err) {
    console.error('Twilio send failed:', err);
    return false;
  }
}
