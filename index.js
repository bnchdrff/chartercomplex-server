var request = require('request');
var cachedRequest = require('cached-request')(request);
var cacheDirectory = "/tmp/cache";

var express = require('express');
var app = express();

var port = process.env.PORT || 31337;

cachedRequest.setCacheDirectory(cacheDirectory);

var ttl = 30;
//var sheetId = '18g7yJg3fkkwHZQF8BaJMnUsaJDWI43S_5MyxKM2-_3M';
var sheetId = '1NedxZi-c29G_x45ZfWAIf0-pVHolggwV4ejj-OYFirA';
var urlBase = 'https://spreadsheets.google.com/feeds/list/' + sheetId + '/';
var urlSuffix = '/public/values?alt=json';

var sheet_urls = {
  nodes: {
    url: urlBase + '1' + urlSuffix,
    ttl: ttl,
  },
  edges: {
    url: urlBase + '2' + urlSuffix,
    ttl: ttl,
  },
};

app.get('/nodes.json', function(req, res, next) {
  res.type('application/json');

  cachedRequest(sheet_urls.nodes, function (error, response, body) {
    if (error) {
      res.sendStatus(500);
    } else {
      var nodes = [];
      var sheet = JSON.parse(body);
      sheet.feed.entry.forEach(function(val, idx) {
        nodes.push({
          id: parseInt(val.title.$t, 10),
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

  cachedRequest(sheet_urls.edges, function (error, response, body) {
    if (error) {
      res.sendStatus(500);
    } else {
      var edges = [];
      var sheet = JSON.parse(body);
      sheet.feed.entry.forEach(function(val, idx) {
        var edge = {
          source: parseInt(val.title.$t, 10),
          target: (val.content.$t.match(/target: ([0-9]*)/)) ? parseInt(val.content.$t.match(/target: ([0-9]*)/)[1], 10) : null,
          label: (val.content.$t.match(/label: ([^,]*)(?:,|$)/)) ? val.content.$t.match(/label: ([^,]*)(?:,|$)/)[1] : null,
          amount: (val.content.$t.match(/amount: ([^,]*)(?:,|$)/)) ? parseInt(val.content.$t.match(/amount: ([^,]*)(?:,|$)/)[1], 10) : null,
          startyear: (val.content.$t.match(/startyear: ([^,]*)(?:,|$)/)) ? parseInt(val.content.$t.match(/startyear: ([^,]*)(?:,|$)/)[1], 10) : null,
          endyear: (val.content.$t.match(/endyear: ([^,]*)(?:,|$)/)) ? parseInt(val.content.$t.match(/endyear: ([^,]*)(?:,|$)/)[1], 10) : null,
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
