const express = require('express')
const axios = require('axios').default;
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = 3000

app.use(cors())

const turnOffAfterMinutes = 5
let timeToTurnOff = -1

const turnLightsOff = async () => {
    return await axios.get(process.env.LIGHTS_OFF_URL)
}

const turnLightsOn = async () => {
    return await axios.get(process.env.LIGHTS_ON_URL)
}

setInterval(async () => {
    if (timeToTurnOff === -1) return
    const currentTime = new Date().getTime()
    if (timeToTurnOff < currentTime) {
        // turn off
        await turnLightsOff()
        console.log("Turning lights off after timer.")
        timeToTurnOff = -1
    }
},1000);

app.get('/', (req, res) => {
    res.send('Server is online.')
})

app.get("/lights-status", async (req, res) => {
    if (timeToTurnOff === -1) {
        res.send("Lights are not on.")
        return
    }
    res.send("Turning off: " + new Date(timeToTurnOff))
})

app.get("/lights-off", async (req, res) => {
    await turnLightsOff()
    res.send("Lights are now turned off")
})

app.get('/lights-on', async (req, res) => {
    await turnLightsOn()
    timeToTurnOff = new Date().getTime() + (1000 * 60 * turnOffAfterMinutes)
    res.send("Lights are now on. Current Time: " + new Date() + " Turning off @ " + new Date(timeToTurnOff))
})

app.listen(port, () => console.log(`My app is listening at ${port}`))