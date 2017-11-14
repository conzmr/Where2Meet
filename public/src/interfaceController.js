var app = angular.module('Where2Meet', ['ngMaterial', 'gm']);



app.service('Map', function($q) {

  this.markers=[];
  var counter = 0;

    this.init = function() {
        var options = {
            center: new google.maps.LatLng(40.7127837, -74.00594130000002),
            zoom: 13,
            disableDefaultUI: true
        }
        this.map = new google.maps.Map(
            document.getElementById("map"), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
    }

    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str}, function(results, status) {
          console.log(results);
            if (status == 'OK') {
                d.resolve(results[0]);
            }
            else d.reject(status);
        });
        return d.promise;
    }

    this.addMarker = function(res) {
        if(this.markers[counter%2]) this.markers[counter%2].setMap(null);
        this.markers[counter%2] = new google.maps.Marker({
            map: this.map,
            position: res.geometry.location,
            animation: google.maps.Animation.DROP
        });
        this.map.setCenter(res.geometry.location);
        counter++;
    }

});


app.service('SearchEngine', function(map) {

      var infowindow;
      var pyrmont = {lat: -33.867, lng: 151.195};

      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: pyrmont,
          zoom: 15
        });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pyrmont,
          radius: 500,
          type: ['store']
        }, callback);
      }

  this.markers=[];
  var counter = 0;

    this.init = function() {
        var options = {
            center: new google.maps.LatLng(40.7127837, -74.00594130000002),
            // center: pyrmont,
            zoom: 13,
            disableDefaultUI: true
        }
        this.map = new google.maps.Map(
            document.getElementById("map"), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
    }

    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str}, function(results, status) {
          console.log(results);
            if (status == 'OK') {
                d.resolve(results[0]);
            }
            else d.reject(status);
        });
        return d.promise;
    }

    this.addMarker = function(res) {
        if(this.markers[counter%2]) this.markers[counter%2].setMap(null);
        this.markers[counter%2] = new google.maps.Marker({
            map: this.map,
            position: res.geometry.location,
            animation: google.maps.Animation.DROP
        });
        this.map.setCenter(res.geometry.location);
        counter++;
    }

});

app.service('Map', function($q) {

      var map;
      var infowindow;
      var pyrmont = {lat: -33.867, lng: 151.195};

      function initMap() {
        map = new google.maps.Map(document.getElementById('map'), {
          center: pyrmont,
          zoom: 15
        });

        infowindow = new google.maps.InfoWindow();
        var service = new google.maps.places.PlacesService(map);
        service.nearbySearch({
          location: pyrmont,
          radius: 500,
          type: ['store']
        }, callback);
      }

  this.markers=[];
  var counter = 0;

    this.init = function() {
        var options = {
            center: new google.maps.LatLng(40.7127837, -74.00594130000002),
            // center: pyrmont,
            zoom: 13,
            disableDefaultUI: true
        }
        this.map = new google.maps.Map(
            document.getElementById("map"), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
    }

    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str}, function(results, status) {
          console.log(results);
            if (status == 'OK') {
                d.resolve(results[0]);
            }
            else d.reject(status);
        });
        return d.promise;
    }

    this.addMarker = function(res) {
        if(this.markers[counter%2]) this.markers[counter%2].setMap(null);
        this.markers[counter%2] = new google.maps.Marker({
            map: this.map,
            position: res.geometry.location,
            animation: google.maps.Animation.DROP
        });
        this.map.setCenter(res.geometry.location);
        counter++;
    }

});

app.controller('interfaceController', function($scope, $http, Map) {

  $scope.placeTypes = [
  	{ value: 'art_gallery', display: 'Art Gallery'},
    { value: 'bar', display: 'Bar'},
    { value: 'bowling_alley', display: 'Bowling Alley'},
    { value: 'cafe', display: 'Cafe'},
    { value: 'gym', display: 'Gym'},
    { value: 'library', display: 'Library'},
    { value: 'movie_theater', display: 'Movie Theater'},
    { value: 'museum', display: 'Museum'},
    { value: 'park', display: 'Park'},
    { value: 'restaurant', display: 'Restaurant'},
    { value: 'shopping_mall', display: 'Shopping Mall'}

  ];

  $scope.price = [
    { value: 0, display: 'Free'},
    { value: 1, display: 'Affordable'},
    { value: 2, display: 'In Between'},
    { value: 3, display: 'Expensive'},
    { value: 4, display: 'Fancy'}
  ];

  var radius = 1000;
  var lat = 42.3675294;
  var lon = -71.186966;
  var key = 'AIzaSyAOy8I86u2ox0Gb5xt5GZ842r09yp_hDII';
  var places = '';
  var priceOpt = '';
//getPlaces();
var myElement = document.getElementById('checkbox1');
//var myElement = angular.element(document.querySelector('hola'));
console.log(myElement.value);

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

$scope.gPlace;

  function initInterfaceComponents(){

  }

  $scope.place = {};
  $scope.place2 = {};

$scope.search = function(location) {
    $scope.apiError = false;

    switch (location) {
      case $scope.locationTwo:
      Map.search($scope.locationTwo)
      .then(
          function(res) { // success
              Map.addMarker(res);
              $scope.place2.name = res.name;
              $scope.place2.lat = res.geometry.location.lat();
              $scope.place2.lng = res.geometry.location.lng();
          },
          function(status) { // error
              $scope.apiError = true;
              $scope.apiStatus = status;
          }
      );
        break;
      default:
      Map.search($scope.locationOne)
      .then(
          function(res) { // success
              Map.addMarker(res);
              $scope.place.name = res.name;
              $scope.place.lat = res.geometry.location.lat();
              $scope.place.lng = res.geometry.location.lng();
          },
          function(status) { // error
              $scope.apiError = true;
              $scope.apiStatus = status;
          }
      );
      break;

    }
}

$scope.send = function() {
    alert($scope.place.name + ' : ' + $scope.place.lat + ', ' + $scope.place.lng);
}

Map.init();

});


app.directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: [],
                componentRestrictions: {}
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                scope.$apply(function() {
                    model.$setViewValue(element.val());
                });
            });
        }
    };
});
