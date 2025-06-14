
import { calculateChart } from '../hdkit.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { birthDate, birthTime, coordinates } = req.body;

    if (!birthDate || !birthTime || !coordinates || !coordinates.lat || !coordinates.lon) {
      return res.status(400).json({ error: 'Missing required data: birthDate, birthTime, and coordinates (lat, lon)' });
    }

    const dateTimeISO = new Date(`${birthDate}T${birthTime}:00`).toISOString();

    // Now uses local hdkit.js for chart calculation
    const chart = await calculateChart({
      date: dateTimeISO,
      location: { lat: coordinates.lat, lon: coordinates.lon }
    });

    return res.status(200).json({ success: true, chart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
