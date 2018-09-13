const https = require('https')


function apiCall(url) {
  return new Promise((resolve, reject) => {
    let req = https.get(url, res => {
      res.setEncoding("utf8");
      let body = "";

      res.on("data", data => {
        body += data;
      });

      res.on("end", () => {
        body = JSON.parse(body);
        resolve(body)
      });
    });
  })
}
const url = "https://maps.googleapis.com/maps/api/geocode/json?address=Florence";
apiCall(url)
  .then(data => console.log(data))
  .catch(err => console.error(err))

