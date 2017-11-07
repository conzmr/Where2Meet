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

app.controller('mainCtrl', function($scope, Map) {

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
