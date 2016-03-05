var express = require( 'express' );
var db = require( './config/db' );
var app = express();

var http = require( 'http' ).Server( app );
var io = require( 'socket.io' )( http );
var Session = require( './sessions/sessions' );
var User = require( './users/users' );
var Session_User = require('./sessions_users/sessions_users');

io.on( 'connect' , function( socket ){
  console.log( 'we are connected!!' );
  socket.on( 'disconnect', function() {
    console.log( 'were not connected anymore' );
  });

  //this recieves the create event emitted in client/sessions/sessions.js-handleCreate
  socket.on( 'session', function( data ) {
    Session.findOne( { where: { id: data.sessionId } } )
    .then( function( session ) {
      //this function emits an event named newSession and sends the newly created session
      io.emit( 'newSession', session.dataValues );
    } );
  } );

  //this function listens to the new join event in client/sessions/sessions.js-handleJoin
  socket.on( 'newJoin', function( data ) {
    //this function creates a new or joins an existing socket-room
    socket.join( data.sessionId );
    User.findOne( { where: { username: data.username } } )
    .then( function( user ) {
      //this function emits a newUser event and the new user to a specific room
      io.to( data.sessionId).emit( 'newUser', user );
    } );
  } );

  socket.on( 'startSession', function( data ) {
    socket.join( data.sessionId );
    io.to( data.sessionId ).emit( 'sessionStarted' );
  } );

  // This listener handles broadcasting a matched movie to connected clients.
  socket.on( 'foundMatch', function( data ) {
    socket.join( data.sessionId );
    io.to( data.sessionId ).emit( 'matchRedirect', data.movie.id );
  });

  socket.on( 'addMovie', function (data) {
    console.log("SOCKET2 recieved data: ", data);
    socket.join( data.sessionId );
    io.to( data.sessionId ).emit( 'newMovie', {title: data.movie.title, year: data.movie.release_date, poster_path: data.movie.poster_path});
  });

  socket.on( 'doneUser', function (data) {
    socket.join( data.sessionId );
    io.to( data.sessionId ).emit( 'newUser');
  });

  socket.on( 'compromise', function (data) {
    socket.join( data.sessionId );
    io.to( data.sessionId ).emit( 'compromiseNow');
  });

});

const PORT = 8000;

require( './config/middleware' )( app, express );
require( './config/routes' )( app, express );

http.listen( process.env.PORT || PORT );
console.log( 'Listening on port ' + PORT );

module.exports = app;
