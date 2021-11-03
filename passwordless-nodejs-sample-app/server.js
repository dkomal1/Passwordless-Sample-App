const express = require("express");
const fs = require("fs");

const cors = require("cors");
const serveIndex = require('serve-index');
const defaultRoute = require("./routes/default");
const http = require("http");

const app = express();

//middlewaresś
app.use(cors());
app.use(express.json());
app.use('/.well-known', express.static('.well-known'), serveIndex('.well-known'));
app.set("view engine", "ejs");

//cerificate files
// const options = {
//   key: fs.readFileSync("privkey.pem"),
//   cert: fs.readFileSync("cert.pem"),

// };

//https server config
// const server = https.createServer(options,app)
const httpSer = http.createServer(app);
app.use(express.static(__dirname + "/public"));

const io = require("socket.io")(httpSer, {
  cors: {
    origin: "*",
  },
});
io.sockets.on("error", (e) => console.log(e));

//routes
app.use("/", defaultRoute);

httpSer.listen(8080, () => {
  console.log(`🌟🌟 server Started 🚀, go to http://localhost:8080 🌟🌟`);
  console.log(`⚡⚡ Note:  This is passwordless sample app ... change code as per your need ⚡⚡`);
});
