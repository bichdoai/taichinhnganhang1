import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';
import crypto from 'crypto';

const app = express();
app.use(bodyParser.json());

async function notifySlack(lead) {
  if (!process.env.SLACK_WEBHOOK_URL) return;
  const text = `🔥 *New Lead!*\n👤 ${lead.name}\n📞 ${lead.phone}\n💼 ${lead.type}\n💰 ${lead.income}`;
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
}

app.post('/submit-lead', async (req, res) => {
  const lead = req.body;
  const hmac = crypto.createHmac('sha256', process.env.CRM_SECRET || '').update(JSON.stringify(lead)).digest('hex');
  await notifySlack(lead);
  res.json({ ok: true, hmac });
});

app.listen(process.env.PORT || 8080, () => console.log('Server ready'));
