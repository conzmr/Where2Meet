var app = angular.module('Where2Meet', ['ngMaterial', 'gm']);

app.service('Map', function($q) {

  this.markers=[];
  this.counter = 0;
  var geocoder = new google.maps.Geocoder;
  var posImgs = ['/img/location-a.png', '/img/location-b.png'];
  this.loaded = false;

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

  $scope.loading = false;

  $scope.place = {};
  $scope.place2 = {};

  Map.init();

  function initialize(position) {
        var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
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
