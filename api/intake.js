export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'OPTIONS') {
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  }
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const body = req.body || {};
    const { name, phone, service, message, utm_source, utm_campaign, siteId = 'S-001', honey } = body;
    if (honey) return res.status(200).json({ ok: true });
    if (!name || !phone) return res.status(400).json({ ok:false, error:'Missing required fields' });

    const webhook = process.env.SLACK_WEBHOOK_S001;
    if (!webhook) return res.status(500).json({ ok:false, error:'Missing SLACK_WEBHOOK_S001' });

    const blocks = [
      { type: "section", text: { type: "mrkdwn", text: `*New Intake — ${siteId}*` } },
      { type: "section", fields: [
        { type: "mrkdwn", text: `*Name*\n${name}` },
        { type: "mrkdwn", text: `*Phone*\n<tel:${phone}|${phone}>` },
        { type: "mrkdwn", text: `*Service*\n${service || '—'}` },
        { type: "mrkdwn", text: `*UTM Source*\n${utm_source || '—'}` },
        { type: "mrkdwn", text: `*UTM Campaign*\n${utm_campaign || '—'}` },
      ]},
      { type: "section", text: { type: "mrkdwn", text: `*Message*\n${(message || '—').slice(0, 3500)}` } },
      { type: "context", elements: [{ type: "mrkdwn", text: `#s001-intake • ${new Date().toLocaleString()}` }] }
    ];
    const payload = { text: `New Intake — ${siteId}`, blocks };

    const r = await fetch(webhook, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error(`Slack responded ${r.status}`);
    return res.status(200).json({ ok:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error: e.message });
  }
}
