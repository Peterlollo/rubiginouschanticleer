angular.module( 'moviematch.lobbyServices', [] )

.factory( 'Lobby', function( $http ) {
  return {
    getUsersInOneSession: function( sessionName ) {
      return $http.get( '/api/sessions/users/' + sessionName )
      .then( function( res ) {
        return res.data;
      } ,
      function( err ) {
        console.error( err );
      } );
    }
  }
});
