const cors = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(), body: "" };
  }
  try {
    const url = "https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1";
    const r = await fetch(url);
    if (!r.ok) throw new Error("genRandomMailbox " + r.status);
    const a = await r.json();
    const email = Array.isArray(a) ? a[0] : null;
    if (!email) throw new Error("No email returned");
    return { statusCode: 200, headers: cors(), body: JSON.stringify({ email }) };
  } catch (e) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: e.message }) };
  }
};
