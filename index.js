const express = require('express')
const bodyParser = require('body-parser')
const axios = require('axios').default;
const cors = require('cors')
require('dotenv').config()
const app = express()
const port = 5000

app.use(cors())
app.use(bodyParser.json())

app.use('/lights/', (req, res, next) => {
    let password = req.body.pass
    if (password !== process.env.PASSWORD) {
        res.json({message: "Invalid password"})
        return
    }
    next()
})

const turnOffAfterMinutes = 5
let timeToTurnOff = -1

const turnLightsOff = async () => {
    return await axios.get(process.env.LIGHTS_OFF_URL)
}

const turnLightsOn = async () => {
    return await axios.get(process.env.LIGHTS_ON_URL)
}

const turnLightsOffIn = (minutes) => {
    console.log(minutes)
    timeToTurnOff = new Date().getTime() + (1000 * 60 * minutes)
}

const dateTurningOff = () => {
    return new Date(timeToTurnOff)
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
}, 1000);

app.get("/status", async (req, res) => {
    if (timeToTurnOff === -1) {
        res.json({status: "lights-off"})
        return
    }
    res.json({status: "lights-on", turningOff: dateTurningOff()})
})

app.post("/lights/off", async (req, res) => {
    await turnLightsOff()
    res.json({status: "lights-off", message: "Lights have been turned off."})
})


app.post('/lights/on', async (req, res) => {
    let minutes = req.body.minutes
    if (minutes === undefined) minutes = turnOffAfterMinutes
    await turnLightsOn()
    const turningOff = new Date(timeToTurnOff)
    turnLightsOffIn(minutes)
    res.json({
        status: "lights-on",
        currentTime: new Date(),
        turningOff,
        message: "Lights have been turned on\n Turning off @ " + turningOff
    })
})

app.listen(port, () => console.log(`My app is listening at ${port}`))