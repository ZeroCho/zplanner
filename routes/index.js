var express = require('express');

/* GET home page. */
exports.index = function(req, res) {
  res.render('index', { title: 'Zecretary' });
};

exports.appcache = function (req, res) {
  res.header("Content-Type", "text/cache-manifest");
  res.end('CACHE MANIFEST');
};
