


var express = require("express");
var router = express.Router();



// google api
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';


router.post("/parent", async function (req, res) {
    var id = req.body['link'];
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        authorize(JSON.parse(content), listFiles, id, res);
    });
})





function authorize(credentials, callback, id, restURL) {
    var { client_secret, client_id, redirect_uris } = credentials.installed;
    var oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client, id, restURL); //list files and upload file

    });
}

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

function listFiles(auth, id, restURL) {
    var fileReturn = [];
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        corpora: 'user',
        // pageSize: 10,
        q: `parents in  '${id}'`,
        pageToken: '' ? '' : '',
        fields: 'nextPageToken, files(*)',
    }, (err, res) => {
        if (err)  restURL.send([]);
        var files = res.data.files;
        if (files.length) {
            restURL.send(files)


            // restURL.send(files.map((file) => {
            //     return { name: file.name, webViewLink: file.webViewLink }
            // }))
        } else {
            restURL.send([])
        }
    });
    console.log(fileReturn);
    return fileReturn;
}


module.exports = router;