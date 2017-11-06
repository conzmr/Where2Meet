var app = angular.module('Where2Meet', ['ngMaterial', 'gm']);

app.controller('mainCtrl', function($scope, $mdToast, $mdDialog, $location, $window) {

  $scope.$on('gmPlacesAutocomplete::placeChanged', function(){
       var location = $scope.autocomplete1.getPlace().geometry.location;
       $scope.lat = location.lat();
       $scope.lng = location.lng();
       $scope.$apply();
   });

   $scope.map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 51.503186, lng: -0.126446 },
            zoom: 15
        });

        $scope.infoWindow = new google.maps.InfoWindow();
        $scope.service = new google.maps.places.PlacesService($scope.map);


$scope.cancel = function() {
 $mdDialog.cancel();
};

});
