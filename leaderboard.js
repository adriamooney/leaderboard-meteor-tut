
// Create a MongoDB Collection
PlayersList = new Mongo.Collection('players');

// Code that only runs on the client (within the web browser)
//you can also achieve this by putting this code inside a folder called 'client' 
//(same for server), to avoid using conditionals.  Meteor knows what to do
if(Meteor.isClient){

//subscribe to data sent from the server
Meteor.subscribe('thePlayers');


  // Helper functions execute code within templates
Template.leaderboard.helpers({
    'player': function(){
        var currentUserId = Meteor.userId();
        // Retrieve all of the data from the "PlayersList" collection, created by the current logged in user
        //sort by score in descending order, then by name in ascending order
        //createdBy is not needed here because that is what is being published by server, and subscribed to above in Meteor.subscribe
        return PlayersList.find({}, {sort: {score: -1, name: 1}})
        
    },
    'selectedClass': function() {
        var playerId = this._id;  //this refers to the player, since it is referenced inside the each loop in the template
        var selectedPlayer = Session.get('selectedPlayer'); //gets the session variable (player id) that was set in the click event
        
        if (playerId == selectedPlayer) {
            return 'selected' //returns a string called 'selected', used in our template to set the class
        }
    },
    'showSelectedPlayer': function() {
        var selectedPlayer = Session.get('selectedPlayer');
        return PlayersList.findOne(selectedPlayer);
    }
});

Template.leaderboard.events({
    'click .player': function(){
        var playerId = this._id;
        Session.set('selectedPlayer', playerId);  //name and value of session variable
        //var selectedPlayer = Session.get('selectedPlayer'); //this will get the value, which would be the playerID
        //console.log(selectedPlayer);
    },
    'click .increment': function() {
        var selectedPlayer = Session.get('selectedPlayer');
        //console.log(selectedPlayer);
        //PlayersList.update(selectedPlayer, {$set: {score: 5} });  //sets value to 5, without deleting te other key value pairs 
        //PlayersList.update(selectedPlayer, {$inc: {score: 5} }); //increments by 5 each time
        Meteor.call('modifyPlayerScore', selectedPlayer, 5);
    }, 
    'click .decrement': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        //PlayersList.update(selectedPlayer, {$inc: {score: -5} }); //decrements by 5
        Meteor.call('modifyPlayerScore', selectedPlayer, -5);
    },
    'click .remove': function(){
        var selectedPlayer = Session.get('selectedPlayer');
        var conf = confirm('do you really want to delete this player?');
        if (conf == true) {
            Meteor.call('removePlayerData', selectedPlayer);
        }


    }
});

Template.addPlayerForm.events({
    'submit form': function(e) {
        e.preventDefault();

        var playerNameVar = e.target.playerName.value;
        var playerScoreVar = parseInt(e.target.playerScore.value);

       // var currentUserId = Meteor.userId(); // returns the unique ID of the currently logged in user.


      /*  PlayersList.insert({
            name: playerNameVar,
            score:playerScoreVar,
            createdBy: currentUserId
        }); */

        //empty field when done
       e.target.playerName.value = '';

       Meteor.call('insertPlayerData', playerNameVar, playerScoreVar);


    }
});

}

// Code that only runs on the server (where the application is hosted)
if(Meteor.isServer){

    //Meteor.methods used to create code that should execute on the server but can be called on the client

    Meteor.methods({
        'insertPlayerData': function(playerNameVar, playerScoreVar){
            var currentUserId = Meteor.userId();
            PlayersList.insert({
                name: playerNameVar,
                score: playerScoreVar,
                createdBy: currentUserId
            });
        },
        'removePlayerData': function(selectedPlayer) {
            PlayersList.remove(selectedPlayer);
        },
        'modifyPlayerScore': function(selectedPlayer, scoreValue){
            PlayersList.update(selectedPlayer, {$inc: {score: scoreValue} });
        }
    });

    //publish data on the server that can be subscribed to by the client
    Meteor.publish('thePlayers', function(){

        var currentUserId = this.userId; //currently logged in user. syntax is different when used on the client (Meteor.userId())
        return PlayersList.find({createdBy: currentUserId})
    });

}