const express = require('express');
var cors = require('cors')
var app = express()
app.use(cors())

app.use('/https://localhost:7075/Table?id=1', function(request, response){
    console.log('current url is '+request.url);
    response.end();
})
