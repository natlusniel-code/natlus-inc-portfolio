// Minimal SMTP client (no dependencies) used to forward contact-form
// messages when SMTP_* env vars are configured. See api/_routes/contact.ts.
import net from "node:net";

export interface SmtpOptions {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  to: string;
  subject: string;
  text: string;
}

export async function sendSmtpMail(o: SmtpOptions): Promise<void> {
  const { host, port, user, pass, from, to, subject, text } = o;
  const conn = await connect(host, port);
  try {
    await read(conn);
    await cmd(conn, `EHLO natlus-portfolio`);
    await cmd(conn, `AUTH LOGIN`);
    await cmd(conn, Buffer.from(user, "utf8").toString("base64"));
    await cmd(conn, Buffer.from(pass, "utf8").toString("base64"));
    await cmd(conn, `MAIL FROM:<${from.match(/<([^>]+)>/)?.[1] ?? from}>`);
    await cmd(conn, `RCPT TO:<${to}>`);
    await cmd(conn, `DATA`);
    const payload = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject.replace(/[\r\n]/g, " ")}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
      ".",
    ].join("\r\n");
    await write(conn, payload);
    await read(conn);
    await cmd(conn, `QUIT`);
  } finally {
    conn.destroy();
  }
}

function connect(host: string, port: number): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const sock = net.connect(port, host);
    sock.setTimeout(15000);
    sock.once("connect", () => resolve(sock));
    sock.once("error", reject);
    sock.once("timeout", () => reject(new Error("SMTP connection timed out")));
  });
}

function read(sock: net.Socket): Promise<string> {
  return new Promise((resolve, reject) => {
    const onData = (buf: Buffer) => {
      const s = buf.toString("utf8");
      if (/^[245]\d\d /.test(s)) {
        sock.off("data", onData);
        resolve(s);
      }
    };
    sock.on("data", onData);
    sock.once("error", reject);
  });
}

function cmd(sock: net.Socket, line: string): Promise<string> {
  sock.write(line + "\r\n");
  return read(sock);
}

function write(sock: net.Socket, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    sock.write(data, (err) => (err ? reject(err) : resolve()));
  });
}
