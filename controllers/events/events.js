var sio = require("socket.io");

var events = function(app){
  var io = sio.listen(app),
      survivors = {},
      weapons = {},
      foods = {},
      zombies = {};

  io.sockets.on('connection', function(socket) {

    socket.on('survivor_connected', function(data) {
      socket.emit('existing_markers', {survivors: survivors, weapons: weapons, foods: foods, zombies: zombies});
      survivors[data.id] = {location: data.location};
      console.log(survivors);
      socket.broadcast.emit('marker_created', data);
    });

    socket.on('survivor_moved', function(data) {
      if(survivors[data.id]) survivors[data.id].location = data.location;
      socket.broadcast.emit('survivor_moved', {id: data.id, location: data.location});
    });
    //TODO: Switch marker types
    socket.on('marker_created', function(data) {
      data.id = data.id || 'marker' + Date.now();
      switch(data.type){
        case 'survivor':
          survivors[data.id] = {location: data.location};
          break;
        case 'zombie':
          zombies[data.id] = {location: data.location};
          break;
        case 'weapon':
          weapons[data.id] = {location: data.location};
          break;
        case 'food':
          foods[data.id] = {location: data.location};
          break;
      }
      socket.broadcast.emit('marker_created', data);
    });

  });
};

module.exports = events;