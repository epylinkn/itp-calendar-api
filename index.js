var rp = require('request-promise');
var cheerio = require('cheerio');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/test', function(req, res) {
  return res.status(200).json({ foo: 'bar' });
});

app.get('/calendar', function(req, res) {
  var url = "http://itp.nyu.edu/camp2016/calendar";
  return rp(url)
    .then(function(html) {
      // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
      var $ = cheerio.load(html);

      var sessions = [];
      var $sessions = $('.sessionListItem');

      console.log($sessions);

      $sessions.each(function(i, elem) {
          var session = {};
          session.title = $(elem).find('h3 a').text();

          var tags = [];
          $(elem).find('.sessionTags a').each(function(i, elem) {
              tags.push($(elem).text());
          })
          session.tags = tags;

          sessions.push(session);
      });
      return res.status(200).json(sessions);
    })
    .catch(function(err) { return res.status(500).json({'message': 'fail'}); });
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
