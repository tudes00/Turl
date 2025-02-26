const express = require("express");
const { createClient } = require("@libsql/client");
const { OAuth2Client } = require("google-auth-library");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const path = require("path");
const router = express.Router();
const cors = require("cors");
const bcrypt = require("bcrypt");

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function verifyToken(req, res, next) {
  try {
    console.log("cooki: ", req.cookies);
    const token = req.cookies.token;
    console.log("token: ", token);

    const loggedInUser = JSON.parse(atob(token.split(".")[1]));
    const mail = loggedInUser.email;

    if (!mail || !/\S+@\S+\.\S+/.test(mail)) {
      return res.status(401).json({ message: "Invalid email" });
    }

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    req.user = payload;
    console.log(mail, "pass");
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

async function verifyShortlink(req, res, next) {
  console.log("verifyShortlink...");
  try {
    const shortlinkQuery = req.query.short_link;
    const shortlinkBody = req.body.short_link;

    const validCharacters = /^[a-zA-Z0-9_-]+$/;
    const validLength = /^.{2,20}$/;

    if (shortlinkQuery && shortlinkBody) {
      return res.json({
        message: "Invalid field",
        success: false,
      });
    }
    const short_link = shortlinkQuery || shortlinkBody;
    console.log("Shortlink test: ", short_link);

    if (!short_link) {
      return res.json({
        message: "Shortlink is required",
        success: true,
      });
    }

    if (
      !short_link ||
      !validLength.test(short_link) ||
      !validCharacters.test(short_link)
    ) {
      return res.json({
        message: "Invalid field",
        success: false,
      });
    }

    console.log("Shortlink pass: ", short_link);
    req.short_link = short_link;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid shortlink" });
  }
}

function hashPassword(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

module.exports = {
  express,
  path,
  cookieParser,
  client,
  turso,
  router,
  cors,
  verifyToken,
  verifyShortlink,
  hashPassword,
  bcrypt,
};
