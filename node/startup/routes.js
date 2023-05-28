const express = require("express");

const webhook = require("../routes/webhook");


module.exports = function (app) {
  app.use(express.json());
  app.use("/", webhook);
};