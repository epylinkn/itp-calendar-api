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

      var sessions = {};
      var dateHeaders = $('.dateHeader');
      dateHeaders.each(function(i, elem) {
        //console.log($(elem).text());
        var date = $(elem).text();
        sessions[date] = {};
        for (var i = 0; i < 24; i+=.5) {
          sessions[date][i] = 0;
        }
        var times = $(elem).nextAll('.sessionListItem');
        times.each(function(i, elem) {
          //console.log($(elem).find('.sessionInfo b').text());
          var time_string = $(elem).find('.sessionInfo b').text();
          var start_time = time_string.split('-')[0];
          var start_time_ampm = start_time.indexOf('am');
          start_time = start_time.replace(/\D/, '').replace('30', '.5');
          if (start_time_ampm === -1) {
            // we're in pm
            start_time = parseFloat(start_time) + 12;
          }

          var end_time = time_string.split('-')[1];
          var end_time_ampm = end_time.indexOf('am');
          end_time = end_time.replace(/\D/, '').replace('30', '.5');
          if (end_time_ampm === -1) {
            // we're in pm
            end_time = parseFloat(end_time) + 12;
          }
          for (var i = start_time; i < end_time; i += 0.5) {
            sessions[date][i] += 1;
          }

          //console.log('Breakdown', time_string, " : ", start_time, " : ", end_time);
        });
      });
      return res.status(200).json(sessions);
    })
    .catch(function(err) { return res.status(500).json({'message': 'fail'}); });
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
