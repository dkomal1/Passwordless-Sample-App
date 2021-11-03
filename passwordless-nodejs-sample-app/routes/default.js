const express = require("express");
const router = express.Router();

const https = require("https");
const axios = require("axios").default;

const Axios = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
});

router.get("/", (req, res) => {
  res.render("login");
});

router.get("/login", (req, res) => {
  res.render("login", );
});
router.get("/register", (req, res) => {
  res.render("register");
});
router.get("/success", (req, res) => {
  res.render("success");
});
router.get("/registerSuccess", (req, res) => {
  res.render("registerSuccess");
});

router.get("/registerToken/:accessToken", async (req, res) => {
  // console.log(req.session.id)
  const { accessToken } = req.params;

  try {
    const data = await Axios.post(
      "https://home.passwordless.com.au:3115/api/verifyToken",
      {
        accessToken,
      }
    );

    res.render("registerDetails", data);
  } catch (err) {
    // err.name == TokenExpiredError

    console.log(err.message);
    res.render("error");
  }
});

router.get("/loginToken/:accessToken", async (req, res) => {
  const { accessToken } = req.params;

  try {
    const data = await Axios.post(
      "https://home.passwordless.com.au:3115/api/verifyToken",
      {
        accessToken,
      }
    );

    res.render("details", data);
  } catch (err) {
    res.render("error");
  }
});

module.exports = router;
