var zomg = zomg || {};

zomg.geo = function(z) {
  var map = null,
      you = null;

  var init = function(mapId, socket) {
    navigator.geolocation.getCurrentPosition(locationSuccess, locationFail);

    function locationSuccess(position) {
      var ret = _initMap(mapId, position.coords.latitude, position.coords.longitude, socket);
      z.geo.map = ret.map;
      z.geo.you = ret.you;
    }

    function locationFail(error) {
      var ret = _initMap(mapId, undefined, undefined, socket);
      z.geo.map = ret.map;
      z.geo.you = ret.you;
    }
  };

  var _initMap = function _initMap(mapElId, initialLat, initialLon, socket) {  
    var startPosition = null,
        markers = {};

    if(typeof initialLat === 'undefined' || typeof initialLon === 'undefined'){
      if(typeof google.loader !== 'undefined' && typeof google.loader.ClientLocation !== 'undefined'){
        startPosition = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
      }else{
        startPosition = new google.maps.LatLng(54.19335, -3.92695);
      }
    }else{
      startPosition = new google.maps.LatLng(initialLat, initialLon);
    }


    var mapOptions = {
        zoom: 15,
        center: startPosition,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        disableDoubleClickZoom: false,
        streetViewControl: false
    },
    mapView = $(mapElId),
    map = new google.maps.Map(mapView[0], mapOptions);
    marker = new google.maps.Marker({
      position: startPosition, 
      map: map, 
      title: "This is you!",
      draggable: true,
      animation: google.maps.Animation.BOUNCE,
      icon: new google.maps.MarkerImage('../images/survivor.png', null, null, null, new google.maps.Size(50, 50))
    }),
    myId = 'marker' + Date.now();

    socket.emit('survivor_connected', {type: 'survivor', id: myId, location: {lat: marker.position.lat(), lng: marker.position.lng()}});


    google.maps.event.addListener(marker, "dragend", function(event) {
      console.log('You have moved');
      socket.emit('survivor_moved', {id: z.geo.you.id, location: {lat: z.geo.you.gmarker.position.lat(), lng: z.geo.you.gmarker.position.lng()}});
    });

    google.maps.event.addListener(map, 'click', function(ev) {
      var selected = $('li.active a')[0].dataset['type'],
          newMarker = createMarker(selected.toLowerCase(), ev.latLng.lat(), ev.latLng.lng(), map),
          mId = 'marker' + Date.now();

      markers[mId] = new z.Marker(mId, newMarker);
      socket.emit('marker_created', {type: selected.toLowerCase(), id: mId, location: {lat: newMarker.position.lat(), lng: newMarker.position.lng()}});
    });

    socket.on('existing_markers', function(data) {
      console.log(data);
      Object.keys(data.survivors).forEach(function(key) {
        var s = new google.maps.Marker({
          position: new google.maps.LatLng(data.survivors[key].location.lat, data.survivors[key].location.lng),
          map: map,
          title: 'Human survivor!',
          draggable: false,
          icon: new google.maps.MarkerImage('../images/survivor.png', null, null, null, new google.maps.Size(50, 50))
        });
        markers[key] = new z.Marker(key, s);
      });

      Object.keys(data.zombies).forEach(function(key) {
        var s = new google.maps.Marker({
          position: new google.maps.LatLng(data.zombies[key].location.lat, data.zombies[key].location.lng),
          map: map,
          title: 'OMGZOMBIE!',
          draggable: false,
          icon: new google.maps.MarkerImage('../images/zombie.png', null, null, null, new google.maps.Size(50, 50))
        });
        markers[key] = new z.Marker(key, s);
      });

      Object.keys(data.weapons).forEach(function(key) {
        var s = new google.maps.Marker({
          position: new google.maps.LatLng(data.weapons[key].location.lat, data.weapons[key].location.lng),
          map: map,
          title: 'Weapons!',
          draggable: false,
          icon: new google.maps.MarkerImage('../images/shell.png', null, null, null, new google.maps.Size(50, 50))
        });
        markers[key] = new z.Marker(key, s);
      });

      Object.keys(data.foods).forEach(function(key) {
        var s = new google.maps.Marker({
          position: new google.maps.LatLng(data.foods[key].location.lat, data.foods[key].location.lng),
          map: map,
          title: 'Fresh food!',
          draggable: false,
          icon: new google.maps.MarkerImage('../images/cake.png', null, null, null, new google.maps.Size(50, 50))
        });
        markers[key] = new z.Marker(key, s);
      });
    });

    socket.on('marker_created', function(data) {
      var newMarker = createMarker(data.type, data.location.lat, data.location.lng, map);

      markers[data.id] = new z.Marker(data.id, newMarker);
      console.log(markers);
    });

    socket.on('survivor_moved', function(data) {
      console.log(data.id);
      console.log(data.location.lat,data.location);
      markers[data.id].gmarker.setPosition(new google.maps.LatLng(data.location.lat, data.location.lng));
    });

    return {map: map, you: new z.Marker(myId, marker)};
  }

  var createMarker = function(type, lat, lng, map) {
    var icon = null;
    switch(type) {
      case 'survivor':
        icon = new google.maps.MarkerImage('../images/survivor.png', null, null, null, new google.maps.Size(50, 50));
        break;
      case 'zombie':
        icon = new google.maps.MarkerImage('../images/zombie.png', null, null, null, new google.maps.Size(50, 50));
        break;
      case 'weapon':
        icon = new google.maps.MarkerImage('../images/shell.png', null, null, null, new google.maps.Size(50, 50))
        break;
      case 'food':
        icon = new google.maps.MarkerImage('../images/cake.png', null, null, null, new google.maps.Size(50, 50));
        break;
    };
    return newMarker = new google.maps.Marker({
      position: new google.maps.LatLng(lat, lng),
      map: map,
      title: type,
      draggable: false,
      animation: google.maps.Animation.DROP,
      icon: icon
    });
  }

  return {
    init: init
  };
}(zomg);