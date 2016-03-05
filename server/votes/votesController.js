var helpers = require( '../config/helpers' );
var Vote = require( './votes' );
var Session_User = require( '../sessions_users/sessions_users' );
var mController = require( '../movies/moviesController' );
var Session = require( '../sessions/sessions' );
var User = require( '../users/users' );
var Session_Movie = require('../sessions_movies/sessions_movies');
var env = require('../env/env.js');
var api_key = env.api_key;
var request = require('request');

var getAllVotes = function() {};

var addVote = function( req, res ) {
  var addVote = function( session_user, movie, vote, sessionId, dbId ) {
    Vote.addVote( session_user, movie, vote, sessionId, dbId ) // add vote to db
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
              addVote( session_user, movie, vote, req.body.sessionId, req.body.dbId );
            }
          });
        } else { // session and user not provided, session_user also not provided
          send400( 'No session, user, or session_user id provided' );
          return;
        }
      } else { // session_user is provided
        addVote( session_user, movie, vote, req.body.sessionId, req.body.dbId);
      }
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
  });
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
          var matched = voteData.reduce( function( memo, curr ) {
            if( curr.vote === false ) {
              memo = false;
            }
            return memo;
          }, true);
          // if they are all true
          if( matched ) {
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

var getCompromise = function ( req, res, next ) {
  var sessionId = req.body.sessionId;
  Vote.findAll({where: {sessionId: sessionId}})
  .then(function (sessionMovieArray) {
    var result = [];
    var mostVotes = 0;
    winningMovie = null;
    var votesObj = {};
    for(var i = 0; i < sessionMovieArray.length; i ++) {
      result.push(sessionMovieArray[i].dataValues);
    }
    result.forEach(function(movie) {
      votesObj[movie.dbId] = votesObj[movie.dbId] || 0;
      if(movie.vote === true) {
        votesObj[movie.dbId] = votesObj[movie.dbId] += 1;
      }
    });
    for(var movie in votesObj) {
      if(votesObj[movie] > mostVotes) {
        mostVotes = votesObj[movie];
        winningMovie = movie;
      }
    }
    if(winningMovie) {
      var options = {
        method: 'GET',
        url: 'http://api.themoviedb.org/3/movie/'+ winningMovie,
        qs:
          {
            api_key: api_key
        },
        headers:
          {
            'postman-token': '617cd5a3-78db-0ae0-0d80-cffed6da26e4',
            'cache-control': 'no-cache'
          }
        };

      request(options, function (error, response, body) {
       if (error) throw new Error(error);
       console.log('winning movie back from API???========>>>>>>', body);
       res.end(body);
      });
    } else {
      res.end(false);
    }
  });
    // } else {
    //   for(var i = 0; i < sessionMovieArray.length; i++) {
    //     var movieId = sessionMovieArray.dataValues[i].movie_id;
        //have: movieId, sessionId
        //Get: session_user
        //Find and tally individ movie votes from votes db with: session_user & movie_id
        //any db's with votes/movie_id's listed together? I have session id as well
        //need to find limit by session_users, so get that with session id?
      // }
};



module.exports = {

  getAllVotes: getAllVotes,
  addVote: addVote,
  getSessMovieVotes: getSessMovieVotes,
  checkMatch: checkMatch,
  getCompromise: getCompromise

};
