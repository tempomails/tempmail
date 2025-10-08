const cors = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
});
const split = (e)=> {
  if (!e || !e.includes("@")) throw new Error("Invalid email");
  const [login, domain] = e.split("@"); return { login, domain };
};
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors(), body: "" };
  }
  try {
    const email = (event.queryStringParameters && event.queryStringParameters.email) || "";
    const { login, domain } = split(email);
    const listUrl = `https://www.1secmail.com/api/v1/?action=getMessages&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}`;
    const lr = await fetch(listUrl);
    if (!lr.ok) throw new Error("getMessages " + lr.status);
    const list = await lr.json();
    const full = await Promise.all((list||[]).map(async (m)=>{
      try{
        const readUrl = `https://www.1secmail.com/api/v1/?action=readMessage&login=${encodeURIComponent(login)}&domain=${encodeURIComponent(domain)}&id=${m.id}`;
        const rr = await fetch(readUrl);
        if(!rr.ok) throw new Error("readMessage "+rr.status);
        const x = await rr.json();
        return { id:x.id, from:x.from, subject:x.subject, date:x.date, textBody:x.textBody || x.body || "" };
      }catch{
        return { id:m.id, from:m.from, subject:m.subject, date:m.date, textBody:"" };
      }
    }));
    full.sort((a,b)=> new Date(b.date)-new Date(a.date));
    return { statusCode: 200, headers: cors(), body: JSON.stringify(full) };
  } catch (e) {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: e.message }) };
  }
};
