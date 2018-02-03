// Dependencies
const express = require('express');
const path = require("path");
const PythonShell = require('python-shell');
const fs = require('fs');
const csvWriter = require("csv-write-stream");
const _ = require('lodash');
const bodyParser = require('body-parser');
const csv = require('csvtojson');
const jsonfile = require('jsonfile');

let app = express();
let writer = csvWriter({ sendHeaders: false });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.set('port', (process.env.PORT || 7081))

// Add headers
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// For Rendering HTML
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/dev/index.html'));
})
app.use(express.static(__dirname + '/dev'));

app.listen(app.get('port'), function () {
  console.log("Node app is running at http://localhost:" + app.get('port'))
})


// POST endpoint for requesting trials
app.post('/trials', function (req, res, next) {
  console.log("trials post request received");

  let subjCode = req.body.subjCode;
  let sessionId = req.body.sessionId;
  console.log(req.body);

  let trials = [];
  jsonfile.readFile('./trials/' + sessionId + '.json', (err, trials) => {
    if (err) {
      res.send({ success: false });
      return next(err);
    }
    console.log(trials)
    fs.readFile('IRQ_questions.txt', (err, file) => {
      if (err) {
        res.send({ success: false });
        return next(err);
      }
      let questions = _.shuffle(file.toString().replace(/\r/g, '\n').split('\n')).filter((line) => { return line.replace(/ /g, '').length > 0 });
      res.send({ success: true, trials: trials, questions: questions });
    })
  })
})


// POST endpoint for receiving trial responses
app.post('/data', function (req, res, next) {
  console.log('data post request received');

  // Create new data file if does not exist
  let response = req.body;
  let path = 'data/' + response.subjCode + '_data.json';
  fs.access(path, (err) => {
    if (err && err.code === 'ENOENT') {
      jsonfile.writeFile(path, { trials: [] }, (err) => {
        if (err) {
          res.send({ success: false });
          return next(err);
        }
        next();
      })
    }
    else next();
  })
}, (req, res, next) => {
  // Write response to json
  let response = req.body;
  let path = 'data/' + response.subjCode + '_data.json';
  console.log(response);
  jsonfile.readFile(path, (err, obj) => {
    if (err) {
      res.send({ success: false });
      return next(err);
    }
    obj.trials.push(response);
    jsonfile.writeFile(path, obj, (err) => {
      if (err) {
        res.send({ success: false });
        return next(err);
      }
      res.send({ success: true });
    })
  })
});


// POST endpoint for receiving video and sounds did not play responses
app.post('/not_play', function (req, res) {
  console.log('not_play post request received');

  // Parses the trial response data to csv
  let response = req.body;
  console.log(response);
  let path = 'not_play/' + response.subjCode + '.csv';
  let headers = Object.keys(response);
  fs.access(path, (err) => {
    if (err && err.code === 'ENOENT') 
      writer = csvWriter({ headers: headers });
    else
      writer = csvWriter({ sendHeaders: false });
  });

  writer.pipe(fs.createWriteStream(path, { flags: 'a' }));
  writer.write(response);
  writer.end();

  res.send({ success: true });
})

// POST endpoint for receiving demographics responses
app.post('/demographics', function (req, res) {
  console.log('demographics post request received');

  // Parses the trial response data to csv
  let demographics = req.body;
  console.log(demographics);
  let path = 'demographics/' + demographics.subjCode + '_demographics.csv';
  let headers = Object.keys(demographics);
  writer = csvWriter({ headers: headers });

  writer.pipe(fs.createWriteStream(path, { flags: 'w' }));
  writer.write(demographics);
  writer.end();

  res.send({ success: true });
})


// POST endpoint for receiving after question responses
app.post('/IRQ', function (req, res) {
  console.log('IRQ post request received');

  // Parses the trial response data to csv
  let IRQ = req.body;
  console.log(IRQ);
  let path = 'IRQ/' + IRQ.subjCode + '_IRQ.csv';
  let headers = Object.keys(IRQ);
  writer = csvWriter({ headers: headers });

  writer.pipe(fs.createWriteStream(path, { flags: 'w' }));
  writer.write(IRQ);
  writer.end();

  res.send({ success: true });
})