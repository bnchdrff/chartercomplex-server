var pantry = require('pantry');
var express = require('express');
var app = express();

var port = process.env.PORT || 31337;

pantry.configure({
  shelfLife: 30,
  maxLife: 3600
});

var sheet_urls = {
  nodes: 'https://spreadsheets.google.com/feeds/list/0Aty9maMoYSDFdFd6aVpFNFZucDk5R3NkajJ6a3JvOXc/1/public/basic/?alt=json',
  edges: 'https://spreadsheets.google.com/feeds/list/0Aty9maMoYSDFdFd6aVpFNFZucDk5R3NkajJ6a3JvOXc/2/public/basic/?alt=json'
};

app.get('/nodes.json', function(req, res, next) {
  res.type('application/json');

  pantry.fetch(sheet_urls.nodes, function(err, sheet, type) {
    if (err) {
      res.send(500);
    } else {
      var nodes = [];
      sheet.feed.entry.forEach(function(val, idx) {
        nodes.push({
          id: val.title.$t,
          name: val.content.$t.match(/label: ([^,]*)(?:,|$)/)[1],
          t: val.content.$t.match(/tagtype: ([^,]*)(?:,|$)/)[1],
          topic: (val.content.$t.match(/topic: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/topic: ([^,]*)(?:,|$)/)[1] : null
        });
      });
      res.jsonp({nodes:nodes});
    }
  });
});

app.get('/edges.json', function(req, res, next) {
  res.type('application/json');

  pantry.fetch(sheet_urls.edges, function(err, sheet, type) {
    if (err) {
      res.send(500);
    } else {
      var edges = [];
      sheet.feed.entry.forEach(function(val, idx) {
        var edge = {
          source: val.title.$t,
          target: (val.content.$t.match(/target: ([0-9]*)/)) ? val.content.$t.match(/target: ([0-9]*)/)[1] : null,
          label: (val.content.$t.match(/label: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/label: ([^,]*)(?:,|$)/)[1] : null,
          amount: (val.content.$t.match(/amount: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/amount: ([^,]*)(?:,|$)/)[1] : null,
          startyear: (val.content.$t.match(/startyear: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/startyear: ([^,]*)(?:,|$)/)[1] : null,
          endyear: (val.content.$t.match(/endyear: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/endyear: ([^,]*)(?:,|$)/)[1] : null,
          tags: (val.content.$t.match(/tags: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/tags: ([^,]*)(?:,|$)/)[1] : null,
          citation: (val.content.$t.match(/citation: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/citation: ([^,]*)(?:,|$)/)[1] : null,
          importance: (val.content.$t.match(/importance: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/importance: ([^,]*)(?:,|$)/)[1] : null,
          topic: (val.content.$t.match(/topic: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/topic: ([^,]*)(?:,|$)/)[1] : null
        };
        if (edge.source && edge.target) {
          edges.push(edge);
        }
      });
      res.jsonp({edges:edges});
    }
  });
});

app.listen(port);
