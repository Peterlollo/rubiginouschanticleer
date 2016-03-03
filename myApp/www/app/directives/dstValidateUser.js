angular.module( 'moviematch.dstValidateUser', [] )

.directive ('dstValidateUser',  function($q, $http) {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, elm, attrs, ngModel ) {
        ngModel.$asyncValidators.uniqueUsername = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          // Lookup user by username
          return $http.get('/api/users/' + value)
            .then(function resolved() {
               //username exists, this means validation fails
               scope.error.userInput = 'User exists, choose another name';
               scope.error.pwdInput = '';
               return $q.reject('exists');
             }, function rejected() {
               //username does not exist, therefore this validation passes
               scope.error.userInput = '';
               scope.error.pwdInput = '';
               return true;
             });
           };
        }
      }
});
