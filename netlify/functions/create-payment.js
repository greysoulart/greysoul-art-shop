// Creates a Mollie payment (SEPA-Überweisung or PayPal) and returns the
// hosted checkout URL the customer gets redirected to. Needs the
// MOLLIE_API_KEY environment variable (set in Netlify: Site configuration
// → Environment variables). Uses the Mollie Payments API directly via
// fetch, no npm dependency required.

const MOLLIE_API_BASE = "https://api.mollie.com/v2";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "MOLLIE_API_KEY ist auf Netlify nicht gesetzt." }),
    };
  }

  let data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Ungültiges JSON." }) };
  }

  const { amount, description, method, customerEmail, orderRef, items, shipping } = data;

  if (!amount || !description || !method || !orderRef) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "amount, description, method und orderRef sind Pflichtfelder." }),
    };
  }
  if (method !== "banktransfer" && method !== "paypal") {
    return { statusCode: 400, body: JSON.stringify({ error: "Unbekannte Zahlart." }) };
  }

  const siteUrl = process.env.URL || `https://${event.headers.host}`;

  const payload = {
    amount: { currency: "EUR", value: Number(amount).toFixed(2) },
    description,
    redirectUrl: `${siteUrl}/?order=${encodeURIComponent(orderRef)}#bestellung-bestaetigt`,
    webhookUrl: `${siteUrl}/.netlify/functions/mollie-webhook`,
    method,
    metadata: { orderRef, customerEmail, items: items || [], shipping: shipping || {}, createdAt: new Date().toISOString() },
  };

  try {
    const res = await fetch(`${MOLLIE_API_BASE}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const mollieRes = await res.json();

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: mollieRes.detail || "Mollie hat die Zahlung abgelehnt." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ checkoutUrl: mollieRes._links.checkout.href }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Mollie war nicht erreichbar." }) };
  }
};
