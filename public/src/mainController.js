var app = angular.module('Where2Meet', ['ngMaterial', 'gm']);

app.service('Map', function($q) {

  this.markers=[];
  this.counter = 0;
  var geocoder = new google.maps.Geocoder;
  var posImgs = ['/img/location-a.png', '/img/location-b.png'];
  this.loaded = false;
  var totalDist = 0;
  var totalTime = 0;

    this.init = function() {
        var options = {
            center: new google.maps.LatLng(20.659698, -103.349609),
            zoom: 13,
            disableDefaultUI: true
        }
        this.map = new google.maps.Map(
            document.getElementById("map"), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
        this.loaded = true;
    }

    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str}, function(results, status) {
          console.log(results);
            if (status == 'OK') {
              console.log(results[0])
                d.resolve(results[0]);
            }
            else d.reject(status);
        });
        return d.promise;
    }

    this.addMarker = function(res) {
        if(this.markers[this.counter%2]) this.markers[this.counter%2].setMap(null);
        this.markers[this.counter%2] = new google.maps.Marker({
            map: this.map,
            position: res.geometry.location,
            animation: google.maps.Animation.DROP,
            icon: posImgs[this.counter%2]
        });
        this.map.setCenter(res.geometry.location);
        this.counter++;
    }

    this.searchGivenPos = function(position) {
      console.log(position);
      var d = $q.defer();
        if(this.markers[this.counter%2]) this.markers[this.counter%2].setMap(null);
        geocoder.geocode({'location': position}, function(results, status) {
            if (status == 'OK') {
                d.resolve(results[0]);
            }
            else d.reject(status);
        });
        return d.promise;
    }
});

app.controller('mainCtrl', function($scope, Map) {

  var directionsDisplay = new google.maps.DirectionsRenderer();
  var directionsService = new google.maps.DirectionsService();
  var polyline = new google.maps.Polyline({
    path: [],
    strokeColor: '#FFFF00',
    strokeWeight: 3
  });
  var infowindow = new google.maps.InfoWindow();
  var totalDist = 0;
  var totalTime = 0;

  polyline.GetPointAtDistance = function(metres) {
    // some awkward special cases
    if (metres == 0) return this.getPath().getAt(0);
    if (metres < 0) return null;
    if (polyline.getPath().getLength() < 2) return null;
    var dist=0;
    var olddist=0;
    for (var i=1; (i < polyline.getPath().getLength() && dist < metres); i++) {
      olddist = dist;
      dist += polyline.getPath().getAt(i).distanceFrom(polyline.getPath().getAt(i-1));
    }
    if (dist < metres) {
      return null;
    }
    var p1= polyline.getPath().getAt(i-2);
    var p2= polyline.getPath().getAt(i-1);
    var m = (metres-olddist)/(dist-olddist);
    return new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m);
  }

  $scope.loading = false;

  $scope.place = {};
  $scope.place2 = {};

  Map.init();

  function initialize(position) {
        var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        directionsDisplay.setMap(Map.map);
        Map.searchGivenPos(myLatLng).then(
            function(res) {
                var tempCounter = Map.counter;
                Map.addMarker(res);
                switch (tempCounter%2) {
                  case 0:
                  console.log("cas1")

                    $scope.locationOne = res.formatted_address;

                  console.log("jejis" + $scope.locationOne)
                    break;

                  case 1:

                    $scope.locationTwo = res.formatted_address;

                  console.log("jeje" + $scope.locationTwo)
                    break;
                }
            },
            function(status) {
                $scope.apiError = true;
                $scope.apiStatus = status;
            }
        );
      }

  $scope.getCurrentlocation = function() {
        navigator.geolocation.getCurrentPosition(initialize, function() {
         alert('navigator.geolocation failed, may not be supported');
     });
  }

$scope.search = function(location) {
  $scope.loading = true;
    Map.search(location)
    .then(
        function(res) {
          $scope.loading = false;
            Map.addMarker(res);
        },
        function(status) {
            $scope.apiError = true;
            $scope.apiStatus = status;
        }
    );
}


$scope.calcRoute = function(){
  var travelMode = google.maps.DirectionsTravelMode.DRIVING;

  var request = {
      origin: $scope.locationOne,
      destination: $scope.locationTwo,
      travelMode: travelMode
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      polyline.setPath([]);
      var bounds = new google.maps.LatLngBounds();
      var startLocation = new Object();
      var endLocation = new Object();
      directionsDisplay.setDirections(response);
      var route = response.routes[0];
      var path = response.routes[0].overview_path;
      var legs = response.routes[0].legs;
      for (i=0;i<legs.length;i++) {
        if (i == 0) {
          startLocation.latlng = legs[i].start_location;
          startLocation.address = legs[i].start_address;
          marker = createMarker(legs[i].start_location,"midpoint","","green");
        }
        endLocation.latlng = legs[i].end_location;
        endLocation.address = legs[i].end_address;
        var steps = legs[i].steps;
        for (j=0;j<steps.length;j++) {
          var nextSegment = steps[j].path;
          for (k=0;k<nextSegment.length;k++) {
            polyline.getPath().push(nextSegment[k]);
            bounds.extend(nextSegment[k]);
          }
        }
      }
      polyline.setMap(Map.map);
      computeTotalDistance(response);

    } else {
      alert("Directions response "+status);
    }
  });
}

function computeTotalDistance(result) {
totalDist = 0;
totalTime = 0;
var myroute = result.routes[0];
for (i = 0; i < myroute.legs.length; i++) {
  totalDist += myroute.legs[i].distance.value;
  totalTime += myroute.legs[i].duration.value;
}
putMarkerOnRoute(50);

totalDist = totalDist / 1000.
}

function putMarkerOnRoute(percentage) {
  var distance = (percentage/100) * totalDist;
  var time = ((percentage/100) * totalTime/60).toFixed(2);
  if (!marker) {
    marker = createMarker(polyline.GetPointAtDistance(distance),"time: "+time,"marker");
  } else {
    marker.setPosition(polyline.GetPointAtDistance(distance));
    marker.setTitle("time:"+time);
  }
}

function createMarker(latlng, label, html) {
    var contentString = '<b>'+label+'</b><br>'+html;
    var marker = new google.maps.Marker({
        position: latlng,
        map: Map.map,
        title: label,
        zIndex: Math.round(latlng.lat()*-100000)<<5
        });
        marker.myname = label;

    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(contentString+"<br>"+marker.getPosition().toUrlValue(6));
        infowindow.open(Map.map,marker);
        });
    return marker;
}

});

app.directive('googleplace', function(Map) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {country: 'mx'}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
            console.log(element[0]);
            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
              scope.loading = true;
                scope.$apply(function() {
                  console.log(element)
                  scope.loading = false;

                    model.$setViewValue(element.val());
                    scope.search(element.val());
                });
            });
        }
    };
});
