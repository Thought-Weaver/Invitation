"use strict";

/*************************************************************
 * IMPORTS
 *************************************************************/

const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const https = require("https");
const fs = require("fs").promises;
const winston = require("winston");

/*************************************************************
 * CONSTANTS
 *************************************************************/

const app = express();

const PORT = process.env.PORT || 3000;

const SERVER_ERROR = "Something went wrong! Please try again later.";

const THEMES = ["under_the_sea", "shadow_of_the_masquerade"]
// Typically I can only seat 5 more people at the dinner table.
const DEFAULT_MAX_RSVPS = 5;

const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "errors.log", level: "error" })
  ]
});

/*************************************************************
 * APP SETUP
 *************************************************************/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ strict: false }));
app.use(cors({
    origin: "https://loganapple.com",
    methods: ["GET", "POST"]
}));

app.use((req, res, next) => {
    const allowedOrigins = ["https://invitation.loganservers.com", "https://loganapple.com"];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
         res.setHeader("Access-Control-Allow-Origin", origin);
    }

	res.setHeader("Access-Control-Allow-Methods", "GET, POST");
	res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
	next();
});

/*************************************************************
 * FUNCTIONS
 *************************************************************/

/**
 * Return the RSVP file containing the list of people who have
 * accepted per theme.
 *
 * @return {Object} The JSON for all RSVPs by theme.
 */
 async function getAllRSVPs() {
    try {
        let rsvps = await fs.readFile("rsvps.json", "utf8");
        let json = await JSON.parse(rsvps);
        return json;
    }
    catch (err) {
        return undefined;
    }
}

/**
 * Given a theme, try to get the list of people who have RSVPed.
 *
 * @param {String} theme - The party theme separated by hyphens.
 * @return {Object} The JSON for the people who have RSVPed. 
 */
async function getThemeRSVPs(theme) {
    try {
        let rsvps = await fs.readFile("rsvps.json", "utf8");
        let json = await JSON.parse(rsvps);
        return json[theme] || 
        {
            "names": [],
            "comments": [],
            "maxRSVPs": DEFAULT_MAX_RSVPS
        };
    }
    catch (err) {
        return undefined;
    }
}

/**
 * Log an error given an endpoint name and error message.
 * 
 * @param {string} endpoint - Space separated title of an endpoint.
 * @param {string} message - The error message.
 */
async function logError(endpoint, message) {
    let current = new Date();
    let cDate = current.getFullYear() + "-" + (current.getMonth() + 1) + "-" + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    let dateTime = cDate + " " + cTime;

    logger.log("error", `${endpoint} error with message '${message}' at ${dateTime}`);
}

/*************************************************************
 * ENDPOINTS
 *************************************************************/

/**
 * @api {get} /rsvps/:theme Request the RSVPs for a given theme
 * @apiName GetRSVPs
 * @apiGroup RSVPs
 * @apiVersion 0.1.0
 *
 * @apiParam {String} category The theme name.
 * 
 * @apiSuccess {Object} rsvps The information for the party attendees.
 * 
 * @apiError (Internal Server Error 500) InternalServerError
 *     Raised if there's a problem reading the RSVPs file.
 * @apiErrorExample Error Response (example):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "statusMessage": "Something went wrong! Please try again at a later time."
 *     }
 */
app.get("/rsvps/:theme", async (req, res) => {
    try {
        if (!THEMES.includes(req.params["theme"])) {
            throw Error("Theme not found.");
        }

        let rsvps = await getThemeRSVPs(req.params["theme"]);

        res.status(200).json(rsvps);
    } catch (err) {
        logError("GetRSVPs", err.message);

        res.statusMessage = err.message || SERVER_ERROR;
        res.status(500).end();
    }
});

/**
 * @api {post} /rsvp/:theme/:name RSVP to a party
 * @apiName RSVP
 * @apiGroup RSVPs
 * @apiVersion 0.1.0
 * 
 * @apiParam {String} theme The name of theme.
 * @apiParam {String} name The attendee's name.
 * @apiParam (Request body) {String} comments Any comments from the attendee.
 * 
 * @apiSuccess (Success 200) Success
 * 
 * @apiError (Internal Server Error 500) InternalServerError
 *     Raised if there's an issue writing the update to the RSVPs file.
 * @apiErrorExample Error Response (example):
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "statusMessage": "Something went wrong! Please try again at a later time."
 *     }
 */
app.post("/rsvp/:theme/:name", async (req, res) => {
    try {
        if (!THEMES.includes(req.params["theme"])) {
            throw Error("Theme not found.");
        }

        const comments = req.body["comments"] || "";

        let rsvps = await getAllRSVPs();
        let themeRSVPs = rsvps[req.params["theme"]] || {
            "names": [],
            "comments": [],
            "maxRSVPs": DEFAULT_MAX_RSVPS
        };

        if (themeRSVPs.names.length === themeRSVPs.maxRSVPs) {
            throw Error("All slots are currently reserved! Check back later or contact Logan directly.")
        }

        themeRSVPs.names.push(req.params["name"]);
        themeRSVPs.comments.push(comments);
        rsvps[req.params["theme"]] = themeRSVPs;

        await fs.writeFile("rsvps.json", JSON.stringify(rsvps), "utf-8");

        res.status(200).end();
    } catch (err) {
        logError("RSVP", !!err.message ? err.message : SERVER_ERROR);

        res.statusMessage = !!err.message ? err.message : SERVER_ERROR;
        res.status(500).end();
    }
});

/*************************************************************
 * START APP
 *************************************************************/

const startServer = async () => {
    try {
      const key = await fs.readFile("server.key");
      const cert = await fs.readFile("server.cert");
  
      https.createServer({ key, cert }, app).listen(PORT);
    } catch (err) {
        logError("Error starting server!", err);
    }
};

startServer();
