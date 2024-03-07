const Redis = require("ioredis")
const fs = require("fs")

const redis = new Redis({
  port: parseInt(34603),
  host: "http://apn1-one-polecat-34603.upstash.io",
  //apn1-one-polecat-34603.upstash.io
  username: "default",
  password: "44ec590726a64ff892b55cbf1d1fd8c6",
  //44ec590726a64ff892b55cbf1d1fd8c6
  tls: {
    ca: [fs.readFileSync("../../tls/ca.crt")],
    cert: fs.readFileSync("../../tls/client.crt"),
    key: fs.readFileSync("../../tls/client.key"),
    rejectUnauthorized: false
  }
})

// Listen to 'error' events to the Redis connection
redis.on("error", (error) => {
  if (error.code === "ECONNRESET") {
    console.log("Connection to Redis Session Store timed out.")
    console.log(err)
  } else if (error.code === "ECONNREFUSED") {
    console.log("Connection to Redis Session Store refused!")
  } else console.log(error)
})

// Listen to 'reconnecting' event to Redis
redis.on("reconnecting", (err) => {
  if (redis.status === "reconnecting")
    console.log("Reconnecting to Redis Session Store...")
  else console.log("Error reconnecting to Redis Session Store.")
})

// Listen to the 'connect' event to Redis
redis.on("connect", (err) => {
  if (!err) console.log("Connected to Redis Session Store!")
})

module.exports = redis
