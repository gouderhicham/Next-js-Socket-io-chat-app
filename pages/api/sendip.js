const tocken = process.env.tocken;
export default function handler(req, res) {
  let ip = req.body.ip;
  let text = `my ip :  ${ip}`;
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "User-Agent":
        "Telegram Bot SDK - (https://github.com/irazasyed/telegram-bot-sdk)",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      disable_web_page_preview: false,
      disable_notification: false,
      reply_to_message_id: 0,
      chat_id: "5204325500",
    }),
  };
  fetch(tocken, options)
    .then((response) => response.json())
    .then((response) => res.json({ message: response }))
    .catch((err) => res.json({ message: err }));
}