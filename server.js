const express = require("express")
const dotenv = require("dotenv")
const axios = require("axios")

const { createClient } = require("redis")
const app = express()
dotenv.config()
const port = process.env.port || 3000
const redis = createClient({
  password: process.env.PASSWORD,
  socket: {
    host: process.env.HOST,
    port: 11114
  }
})

app.use(express.json())

redis.connect().then(() => {
  async function fetchApiData(username) {
    const res = await axios(`https://api.github.com/users/${username}`)
    console.log("Request sent to the API")
    const data = res.data
    return data
  }

  const getUser = async (req, res) => {
    const username = req.params.username
    let results
    let isCached = false
    try {
      const t1 = performance.now()
      const cachedResults = await redis.get(username)
      if (cachedResults) {
        isCached = true
        results = JSON.parse(cachedResults)
        console.log("Fetched from cache")
      } else {
        results = await fetchApiData(username)
        if (results.length === 0) {
          throw "API returned an empty array"
        }
        await redis.set(username, JSON.stringify(results))
      }
      const t2 = performance.now()
      console.log(t2 - t1)
      res.json({
        fromCache: isCached,
        data: results
      })
    } catch (error) {
      console.log(error)
      res.status(404).json({
        message: "Data unavailable",
        error
      })
    }
  }

  app.get("/users/:username", getUser)

  app.listen(port, () => {
    console.log(`App listening on ${port}`)
  })
})
