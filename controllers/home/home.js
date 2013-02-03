
var route = function(app) {

  app.get('/', function(req, res) {
    res.render(__dirname + "/views/home.jade", {layout: __dirname + '/../../views/layout', static: '/static'});
  });
  
};

module.exports = route;