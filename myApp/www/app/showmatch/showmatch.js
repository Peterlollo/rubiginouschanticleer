angular.module( 'moviematch.showmatch', [] )

.controller( 'ShowmatchController', function( $scope, FetchMovies, Session, Auth, $routeParams ) {

  Session.getSession()
  .then( function( session ) {
    $scope.session = session;
  });
  $scope.user = {};
  $scope.user.name = Auth.getUserName();
  $scope.imgPath = 'http://image.tmdb.org/t/p/w500';

  $scope.currMovie = {};
  var id = parseInt( $routeParams.id );

  FetchMovies.getMovie( id )
  .then( function( movie ) {
    $scope.currMovie = movie;
  });

});
