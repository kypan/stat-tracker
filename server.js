var fs = require('fs');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('lodash');

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/stats', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
  });
});

app.put('/stats/reset', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    var stats = JSON.parse(data);
     _.forEach(stats, function(player) {
      player.attemptedFG = [];
      player.attemptedFT = [];
      player.rebounds = "0";
      player.assists = "0";
      player.steals = "0";
      player.blocks = "0";
      player.turnovers = "0";
      player.fouls = "0";
    });
    console.log(stats);
    fs.writeFile('stats.json', JSON.stringify(stats, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(stats));
    });
  });
});

app.post('/stats/recordShot', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    var stats = JSON.parse(data);
    var i = _.findIndex(stats, function(player) {
      return player.number === req.body.number;
    });
    stats[i].attemptedFG.push(_.omit(req.body, 'number'));
    if(req.body.assistedBy) {
      var j = _.findIndex(stats, function(player) {
        return player.number === req.body.assistedBy;
      });
      stats[j].assists = Number(stats[j].assists) + 1;
    }
    fs.writeFile('stats.json', JSON.stringify(stats, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(stats));
    });
  });
});

app.listen(3333);

console.log('You may now track stats on port 3333.');