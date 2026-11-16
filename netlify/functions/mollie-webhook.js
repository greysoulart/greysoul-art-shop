// Mollie calls this URL automatically whenever a payment's status changes
// (e.g. "open" -> "paid"). This is what makes bank-transfer confirmation
// automatic: no one has to check a bank account manually, Mollie tells us.
//
// For now this just looks the payment up (to make sure the id is real) and
// returns 200 OK, which Mollie requires regardless of what we do with the
// notification. Paid orders show up automatically in the Mollie dashboard.
// A natural next step is to send an email here once a mail provider is
// connected (e.g. to Claudia and the customer when status === "paid").

const MOLLIE_API_BASE = "https://api.mollie.com/v2";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const apiKey = process.env.MOLLIE_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: "MOLLIE_API_KEY ist auf Netlify nicht gesetzt." };
  }

  const params = new URLSearchParams(event.body || "");
  const paymentId = params.get("id");
  if (!paymentId) {
    return { statusCode: 400, body: "Keine Payment-ID im Webhook." };
  }

  try {
    const res = await fetch(`${MOLLIE_API_BASE}/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const payment = await res.json();

    // payment.status is one of: open, canceled, pending, authorized, expired, failed, paid
    console.log(`Mollie webhook: payment ${paymentId} (order ${payment.metadata && payment.metadata.orderRef}) is now "${payment.status}"`);

    // TODO (optional next step): if payment.status === "paid", send a
    // confirmation email to payment.metadata.customerEmail and to Claudia.
  } catch (err) {
    console.error("Mollie webhook: could not fetch payment", err);
  }

  return { statusCode: 200, body: "OK" };
};
