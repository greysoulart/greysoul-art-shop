// Mollie calls this URL automatically whenever a payment's status changes
// (e.g. "open" -> "paid"). This is what makes bank-transfer confirmation
// automatic: no one has to check a bank account manually, Mollie tells us.
//
// When a payment becomes "paid", this sends Claudia an email with the full
// order (items, shipping address, amount) via Resend — no separate dashboard
// check needed. Needs these Netlify environment variables:
//   MOLLIE_API_KEY   – same key used by create-payment.js
//   RESEND_API_KEY   – from resend.com (free tier)
//   NOTIFY_EMAIL     – the address that should receive new-order emails
//                       (must be the email the Resend account was verified
//                       with, unless a custom sending domain is set up)

const MOLLIE_API_BASE = "https://api.mollie.com/v2";

function fmtMoney(amount) {
  return amount ? `${Number(amount.value).toLocaleString("de-DE", { minimumFractionDigits: 2 })} ${amount.currency}` : "";
}

function orderEmailHtml(payment) {
  const meta = payment.metadata || {};
  const items = meta.items || [];
  const shipping = meta.shipping || {};
  const methodLabel = { banktransfer: "Überweisung", paypal: "PayPal" }[payment.method] || payment.method;

  const itemRows = items
    .map(
      (it) =>
        `<tr><td style="padding:4px 8px 4px 0;">${it.title} (${it.size}${it.framed ? ", gerahmt" : ""}) × ${it.qty}</td><td style="padding:4px 0; text-align:right; white-space:nowrap;">${
          it.lineTotal != null ? Number(it.lineTotal).toLocaleString("de-DE", { minimumFractionDigits: 2 }) + " €" : ""
        }</td></tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif; color:#1c1d1a; max-width:480px;">
      <h2 style="margin-bottom:4px;">Neue bezahlte Bestellung</h2>
      <p style="color:#52534c; margin-top:0;">Referenz: <strong>${meta.orderRef || payment.id}</strong> · Zahlart: ${methodLabel}</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        ${itemRows}
        <tr><td style="padding:8px 8px 4px 0; font-weight:bold; border-top:1px solid #ccc;">Gesamt</td><td style="padding:8px 0 4px; text-align:right; font-weight:bold; border-top:1px solid #ccc;">${fmtMoney(payment.amount)}</td></tr>
      </table>
      <p style="margin-bottom:4px;"><strong>Lieferadresse</strong></p>
      <p style="margin-top:0; color:#52534c;">
        ${shipping.firstName || ""} ${shipping.lastName || ""}<br>
        ${shipping.street || ""}<br>
        ${shipping.zip || ""} ${shipping.city || ""}<br>
        ${meta.customerEmail || ""}
      </p>
    </div>
  `;
}

async function sendOrderEmail(payment) {
  const resendKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.NOTIFY_EMAIL;
  if (!resendKey || !notifyEmail) {
    console.log("Mollie webhook: RESEND_API_KEY oder NOTIFY_EMAIL nicht gesetzt, überspringe E-Mail.");
    return;
  }
  const meta = payment.metadata || {};
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Greysoul Art Shop <onboarding@resend.dev>",
        to: notifyEmail,
        subject: `Neue Bestellung ${meta.orderRef || payment.id} (${fmtMoney(payment.amount)})`,
        html: orderEmailHtml(payment),
      }),
    });
    if (!res.ok) {
      console.error("Resend-Fehler:", await res.text());
    }
  } catch (err) {
    console.error("Mollie webhook: E-Mail konnte nicht gesendet werden.", err);
  }
}

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

    if (payment.status === "paid") {
      await sendOrderEmail(payment);
    }
  } catch (err) {
    console.error("Mollie webhook: could not fetch payment", err);
  }

  return { statusCode: 200, body: "OK" };
};
