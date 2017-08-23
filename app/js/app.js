var app = angular.module('chatApp',[]);

app.controller('chatCtrl',function($scope){

$scope.welcomeMessage = "Welcome to Chat 210 v0.0.1";
$scope.msgs = [{"message":"dsdsdsds"},{"message":"dsdsds"}];

$scope.sendMessage = function(){

$scope.msgs.push({"message":$scope.chatMessage})
$scope.chatMessage='';
}

});