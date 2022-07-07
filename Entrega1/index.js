require("dotenv").config();

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const PORT = process.env.PORT || 8080;


const express = require("express");
const app = express();
const rutas = require("./routes/index.js");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", express.static(__dirname + "/public")); //_dirname path absoluto

app.use("/api", rutas);

app.listen(PORT, () => [console.log("server escuchando puerto: ", PORT)]);
