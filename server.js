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
  fs.readFile('statsTemplate.json', function(err, data) {
    fs.writeFile('stats.json', data, function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(data);
    });
  });
});

app.put('/stats/subPlayer', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    var stats = JSON.parse(data);
    var i = _.findIndex(stats, function(player) {
      return player.number === req.body.number;
    });
    if(stats[i].active === "true")
      stats[i].active = "false";
    else
      stats[i].active = "true";
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
      stats[j].assists = (Number(stats[j].assists) + 1).toString();
    }
    fs.writeFile('stats.json', JSON.stringify(stats, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(stats));
    });
  });
});

app.post('/stats/recordFT', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    var stats = JSON.parse(data);
    var i = _.findIndex(stats, function(player) {
      return player.number === req.body.number;
    });
    stats[i].attemptedFT.push(_.omit(req.body, 'number'));
    fs.writeFile('stats.json', JSON.stringify(stats, null, 4), function(err) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-cache');
      res.send(JSON.stringify(stats));
    });
  });
});

app.post('/stats/recordStat', function(req, res) {
  fs.readFile('stats.json', function(err, data) {
    var stats = JSON.parse(data);
    var i = _.findIndex(stats, function(player) {
      return player.number === req.body.number;
    });
    switch(req.body.stat) {
      case 'REB':
        stats[i].rebounds = (Number(stats[i].rebounds) + 1).toString();
        break;
      case 'STL':
        stats[i].steals = (Number(stats[i].steals) + 1).toString();
        break;
      case 'BLK':
        stats[i].blocks = (Number(stats[i].blocks) + 1).toString();
        break;
      case 'TO':
        stats[i].turnovers = (Number(stats[i].turnovers) + 1).toString();
        break;
      case 'Foul':
        stats[i].fouls = (Number(stats[i].fouls) + 1).toString();
        break;
      default:
        break;
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