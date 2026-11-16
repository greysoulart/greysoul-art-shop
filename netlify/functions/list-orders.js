// Returns recent orders by reading them straight from Mollie (no separate
// database needed — Mollie already stores the order details we attached as
// metadata when the payment was created). Protected by a simple shared
// password so random visitors can't see customer addresses.
//
// Needs two Netlify environment variables:
//   MOLLIE_API_KEY    – same key used by create-payment.js
//   ORDERS_PASSWORD   – a password Claudia picks herself

const MOLLIE_API_BASE = "https://api.mollie.com/v2";

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const ordersPassword = process.env.ORDERS_PASSWORD;
  const apiKey = process.env.MOLLIE_API_KEY;
  if (!ordersPassword || !apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "ORDERS_PASSWORD oder MOLLIE_API_KEY ist auf Netlify nicht gesetzt." }),
    };
  }

  const givenPassword = event.headers["x-orders-password"];
  if (givenPassword !== ordersPassword) {
    return { statusCode: 401, body: JSON.stringify({ error: "Falsches Passwort." }) };
  }

  try {
    const res = await fetch(`${MOLLIE_API_BASE}/payments?limit=100`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ error: data.detail || "Mollie-Fehler." }) };
    }

    const orders = (data._embedded && data._embedded.payments ? data._embedded.payments : [])
      .map((p) => ({
        orderRef: (p.metadata && p.metadata.orderRef) || p.id,
        status: p.status,
        method: p.method,
        amount: p.amount,
        createdAt: p.createdAt,
        customerEmail: p.metadata && p.metadata.customerEmail,
        items: (p.metadata && p.metadata.items) || [],
        shipping: (p.metadata && p.metadata.shipping) || {},
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return { statusCode: 200, body: JSON.stringify({ orders }) };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: "Mollie war nicht erreichbar." }) };
  }
};
