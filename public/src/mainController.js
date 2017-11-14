var app = angular.module('Where2Meet', ['ngMaterial', 'gm', 'checklist-model']);

app.service('Map', function($q) {
var infowindow = new google.maps.InfoWindow();
  this.markers=[];
  this.resultsCounter = 0;
  this.resultsMarkers = [];
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

    this.addPlace = function(res) {
      var marker = this.resultsMarkers[this.resultsCounter];
        marker = new google.maps.Marker({
            map: this.map,
            position: res.geometry.location,
            animation: google.maps.Animation.DROP,
            title: res.name
        });
        marker.myname = res.name;
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(res.name+"<br>"+res.vicinity);
        infowindow.open(Map.map,marker);
        });
        this.resultsCounter++;
    return marker;

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


app.controller('mainCtrl', function($scope, Map, $mdMenu, $mdDialog,  $timeout,$mdSidenav) {

  var midpoint;
  $scope.placesResults = [];

  $scope.categories = [
    { value: 'art_gallery', display: 'Galería de arte'},
    { value: 'bar', display: 'Bar'},
    { value: 'bowling_alley', display: 'Bolerama'},
    { value: 'cafe', display: 'Café'},
    { value: 'gym', display: 'Gimnasio'},
    { value: 'library', display: 'Librería'},
    { value: 'movie_theater', display: 'Cine'},
    { value: 'museum', display: 'Museo'},
    { value: 'park', display: 'Parque'},
    { value: 'restaurant', display: 'Restaurante'},
    { value: 'shopping_mall', display: 'Centro comercial'}
   ];

   $scope.toggleLeft = buildToggler('left');
   $scope.toggleRight = buildToggler('right');

   function buildToggler(componentId) {
     return function() {
       $mdSidenav(componentId).toggle();
     };
   }

 $scope.printSelection = function(item){
   console.log(item)
   console.log($scope.settings.placeTypeSelection.categories)
 }

  $scope.addIntoPlaces = function(place){
    $scope.selectedPlaceTypes.push(place);
    console.log($scope.selectedPlaceTypes)
    console.log($scope.settings.placeTypeSelection.categories);
  }

  $scope.price = [
    { value: 0, display: 'Gratis'},
    { value: 1, display: 'Accesible'},
    { value: 2, display: 'Regular'},
    { value: 3, display: 'Costoso'},
    { value: 4, display: 'Elegante'}
  ];

  var radius = 1000;
  var lat = 42.3675294;
  var lon = -71.186966;
  var key = 'AIzaSyAOy8I86u2ox0Gb5xt5GZ842r09yp_hDII';
  var places = '';
  var priceOpt = '';

  function getPlaces(){
    angular.forEach($scope.placeTypes, function(value){
      var myElement = angular.element(document.querySelector('art_gallery'));
      console.log(myElement.value);

    });

    var placesUrl = 'https://maps.googleapis.com/maps/api/place/textsearch/json?type=restaurant&location=42.3675294,-71.186966&radius=10000&key='+key;

    $http.get(placesUrl).success(function (data){
      $scope.placesJSON = data;
    });

  }


  function findPlaces(marker){
    $scope.loading = true;
    var placesService = new google.maps.places.PlacesService(Map.map);
        placesService.nearbySearch({
          location: marker,
          radius: 1000,
          types: $scope.settings.placeTypeSelection.categories,
          maxPriceLevel: $scope.settings.typeOfPrice
        }, callback);

        function callback(results, status) {
          $scope.loading = false;
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          $scope.$apply(function () {
            $scope.placesResults = results;
        });
          for (var i = 0; i < results.length; i++) {
            Map.addPlace(results[i]);
            console.log(results[i]);
          }
        }
      }
  }

  $scope.settings = {
    typeOfPrice: [],
     printLayout: true,
     showRuler: true,
     showSpellingSuggestions: true,
     presentationMode: 'edit',
     placeTypeSelection : {
     categories: []
   }
   };

   $scope.sampleAction = function(name, ev) {
      $mdDialog.show($mdDialog.alert()
        .title(name)
        .textContent('You triggered the "' + name + '" action')
        .ok('Great')
        .targetEvent(ev)
      );
    };

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
                    $scope.locationOne = res.formatted_address;
                    break;

                  case 1:
                    $scope.locationTwo = res.formatted_address;
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
  midpoint = polyline.GetPointAtDistance(distance);
  findPlaces(midpoint);
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
}});

app.directive('googleplace', function(Map) {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {country: 'mx'}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);
            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
              scope.loading = true;
                scope.$apply(function() {
                  scope.loading = false;
                    model.$setViewValue(element.val());
                    scope.search(element.val());
                });
            });
        }
    };
});
