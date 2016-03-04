var helpers = require( '../config/helpers' );
var Vote = require( './votes' );
var Session_User = require( '../sessions_users/sessions_users' );
var mController = require( '../movies/moviesController' );
var Session = require( '../sessions/sessions' );
var User = require( '../users/users' );

var getAllVotes = function() {};

var addVote = function( req, res ) {
  var addVote = function( session_user, movie, vote ) {
    Vote.addVote( session_user, movie, vote ) // add vote to db
    .then( function( data ) {
      // add vote to database
      // return 201 created
      matchHandler(); // refactor as necessary
      res.status( 201 );
      res.json( data );
      }, function( err ) {
        helpers.errorHandler( err, req, res );
      });
  };

  var send400 = function( message ) {
    res.status( 400 );
    res.send( message );
  };

  var session_user = parseInt( req.body.session_user_id );
  var movie = parseInt( req.body.movie_id );
  var vote = req.body.vote;
  // var user = parseInt( req.body.user_id );
  // var session = parseInt( req.body.session_id );
  User.findOne({where: {username: req.body.username}})
  .then(function(user){
    var user = user.dataValues.id;
    Session.findOne({where: {id: req.body.sessionId}})
    .then(function(session){
      var session = session.dataValues.id;
      if( !movie ) { // if movie is not provided
        send400( 'Movie ID not provided' );
        return;
      } else if( !session_user ) { // if session_user is not provided
        if( user && session ) { // but user and session are...
         Session_User.getSessionUserBySessionIdAndUserId( session, user ) // try to look up session_user
         .then( function( sessionUser ) {
            session_user = sessionUser.id;
            if( !session_user ) { // we were not able to look up session_user
              // Could not find the given user in the given session
              res.status( 404 );
              res.send();
              return;
            } else { // we were able to look up session_user
              addVote( session_user, movie, vote );
            }
          });
        } else { // session and user not provided, session_user also not provided
          send400( 'No session, user, or session_user id provided' );
          return;
        }
      } else { // session_user is provided
        addVote( session_user, movie, vote );
      };
    });
  });
};

var matchHandler = function() {
    // check if there is a match in current session
    // if so, send socket event to inform users of match
};

var getSessMovieVotes = function( req, res, next ) {
  // expects req.params.session_id
  // expects req.params.movie_id
  // res.json an array of vote objects,
  // Where each object represents a row in the
  // Votes table
  var sessionId = req.params.session_id;
  var movieId = req.params.movie_id;
  Vote.getSessMovieVotes( sessionId, movieId )
  .then( function( voteData ) {
    res.json( voteData );
  }, function( err ) {
    helpers.errorHandler( err );
  })
};

var checkMatch = function( req, res, next ) {
  // Given a session and a movie,
  // We should know whether there is currently a match
  // # of yes votes for a given movie = # of users
  // Respond with movie object if there is a match,
  // Otherwise respond with false
  var sessionID = req.params.session_id;
  var movieID = req.params.movie_id;
  // get number of users in session
  // We are overriding the json method on the response object that our suController receives so that we have
  // access to the object it gives us in this scope.
  Session_User.countUsersInOneSession( sessionID ).then( function( userCount ) {
    // get votedata
    Vote.getSessMovieVotes( sessionID, movieID )
    .then( function( voteData ) {
      // check if votedata is an array
      if( Array.isArray( voteData ) ) {
        // if so, compare # of users to array.length. If they are the same,
        if( voteData.length === userCount ) {
          // reduce votedata array to see if all are true
          console.log('voteDATA.length==============>>>>>>>>>', voteData.length);
          var matched = voteData.reduce( function( memo, curr ) {
            if( curr.vote === false ) {
              memo = false;
            }
            return memo;
          }, true);
          // if they are all true
          if( matched ) {
            console.log('GOT A MATCH!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
            // get movie object for the movie id
            // return movie object
            mController.getMovie( req, res ); // pass response object to mController so it can res.send movie data
          } else { // did not match
            res.json( false );
          } // end if ( matched )
        } else { // voteData.length !== userCount
          res.json( false );
        } // end if ( voteData.length === userCount )
      } else { // voteData is not an array
        res.json( false );
      } // end if ( isArray )
    } );
  } );
};



module.exports = {

  getAllVotes: getAllVotes,
  addVote: addVote,
  getSessMovieVotes: getSessMovieVotes,
  checkMatch: checkMatch

};
