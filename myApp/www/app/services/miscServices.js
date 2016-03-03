angular.module( 'moviematch.miscServices', [] )

.factory( 'FetchMovies', function( $http ) {
  return {

    getMovie: function( id ) {
      return $http.get( '/api/movies/' + id )
      .then( function( res ) {
        return res.data;
      },
      function( err ) {
        console.error( err );
      });
    },

    getNext10Movies: function( packageNumber ) {
      return $http.get( '/api/movies/package/' + packageNumber )
      .then( function( res ) {
        return res.data;
      },
      function( err ) {
        console.error( err );
      } );
    }

  }
} )

.factory( 'Socket', ['socketFactory', function(socketFactory){
  return socketFactory();
}]);
