export function sendIpAddress(ip) {
  const options = {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({
      ip: ip,
    }),
  };
  fetch("api/sendip", options)
    .then((res) => res.json())
    .then(async (res) => {
      console.log(res.message);
    })
    .catch((err) => console.log(err));
}
