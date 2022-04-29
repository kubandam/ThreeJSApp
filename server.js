const express = require('express');
const https = require('https');  
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const port = 8000;
const info = require('request-info')
const request = require('request');
var first = false

var ip = require("ip");
var key = fs.readFileSync(__dirname + '/certs/selfsigned.key');
var cert = fs.readFileSync(__dirname + '/certs/selfsigned.crt');

var options = {
  key: key,
  cert: cert
};

app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true })) 
app.use(express.json());

var DateNow = new Date();

app.use(function(req, res, next) {
  console.log(info(req).httpVersion+
  " | "+
  info(req).ua.browser.name+
  " | "+
  info(req).method+
  " | "+
  DateNow.toLocaleString() +
  " | "+
  info(req).referer+info(req).url)
  next();
}, express.static(__dirname + '/public'));

app.post('/logMsg',(request,response) => {
  if(request.body.log)
    console.log("LOG MSG: " + request.body.log + "\n");
  response.status(204).send();
});

var server = https.createServer(options, app);

//fetchData();

server.listen(port, () => {
    console.log(`PC https://localhost:${port}`)
    console.log(`Others https://${ip.address()+":"+port}`)
    console.log(`Close server CTRL + C\n`)
});


async function fetchData(){
  await request('http://localhost:5075/Table', function (error, response, body) {
    var obj = JSON.parse(fs.readFileSync('./public/StaticData.json', 'utf8'));
    var data = JSON.parse(body)    
    obj.forEach(static => {
      data.forEach(dynamic => {
        if(static.id == dynamic[0]){
          static.text = dynamic[1]
        }
      });
    });
    fs.writeFile('public/DynamicData.json',JSON.stringify(obj),function(err){
      if(err) throw err;
      console.log("Data from DB fetched and save to DynamicData.json.")
    })
  });
}