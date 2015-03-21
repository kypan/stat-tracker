var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/stats.json', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    res.setHeader('Content-Type', 'application/json');
    var stats = JSON.parse(data);
    res.send(stats);
  });
});

app.put('/stats.json', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    var toAdd = _.pick(req.body, ['x', 'y', 'made', 'assisted']);
    var stats = JSON.parse(data);
    var i = _.findIndex(stats, function(player) {
      return player.number = req.body.number;
    });
    stats[0].attemptedFG.push(toAdd); //change index later
    fs.writeFile('stats.json', JSON.stringify(stats, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(stats));
    });
  });
});

app.post('/stats.json', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    var stats = JSON.parse(data);
    stats.push(req.body);
    fs.writeFile('stats.json', JSON.stringify(stats, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(stats));
    });
  });
});

app.listen(3333);

console.log('You may now track stats on port 3333.');