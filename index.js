// server nghia
var express = require("express");
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var userController = require("./user.controller");
app.use("/", userController);

var port = process.env.PORT||7001;
app.listen(port, function () {
    console.log(`server on port ${port}`)
})