const express = require('express');

const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const fb = require('./fb');




// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');

var app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/app'));
// views is directory for all template files
app.set('views', __dirname + '/app');

app.get('/', function (request, response) {
  response.render('index');
});

app.get('/get', function (request, response) {



  if ((request.query.key == "siva")) {

    fb.check(request, response);

  }
  else {
    response.end("Access Error");
  }

});

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});

