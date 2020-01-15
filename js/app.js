$(document).ready(function() {
  const Device = require("js-scc");
  let display;

  class Display extends Device {
      constructor(config) {
          super(config, logfunction);
          this.default_persons = [
          	{name:"Piet jan | hints", subname:"Verveelt zich", time:"Just now", messages:["Hoi!"], image:"https://api.adorable.io/avatars/128/mirza.png"},
          	{name:"Jan Piet", subname:"Verveelt zich", time:"Just now", messages:["Hoi!"], image:"https://api.adorable.io/avatars/128/mirza.png"}
          	];
          this.persons = []
          this.person_index = 0;
      }

      getStatus() {
          return {
              "currentPerson": this.person[person_index].name
          }
      }

      performInstruction(action) {
          switch (action.instruction) {
              case "hint": {
                  this.showHint(action.value)
                  break;
              }
              case "person_1":{
              	this.showMessage(person[1], action.value)
              }
              default: {
                  return false;
              }
          }
          this.statusChanged();
          return true;
      }

      test() {
          this.showHint(test)
          this.statusChanged();
      }

      reset() {
          this.person_index = 0;
          this.persons = this.default_persons;
          this.statusChanged();
      }

      showHint(hint){
      	this.persons[0].messages.push(hint)
      }
  }


  // get config file from server
  $.get("/display_config.json", function(config) {
      display = new Display(JSON.parse(config));
      display.start();
  });
});


function showPersons(persons){
	let list = ""
	for (const person of persons){
		list = list + personHTML(person);
	}
	$("mdl-list").html(list);
}

function personHTML(person){
	let html = '\
		<li class="mdl-list__item mdl-list__item--two-line mdl-button"> \
	        <span class="mdl-list__item-primary-content">\
	            <img class="mdl-list__item-avatar" src="https://api.adorable.io/avatars/128/mirza.png" />\
	            <span>' + person.name + '</span>\
	            <span class="mdl-list__item-sub-title"> ' + person.subname + '</span>\
	        </span>\
	        <span class="mdl-list__item-secondary-content">\
	            <span class="mdl-list__item-secondary-info"> ' + person.time + '</span>\
	        </span>\
	    </li>';
	return html;
}

currentTime = function(){

}

logfunction = function (date, level, message) {
  const formatDate = function (date) {
      return (
          date.getDate() +
          "-" +
          date.getMonth() +
          1 +
          "-" +
          date.getFullYear() +
          " " +
          date.getHours() +
          ":" +
          date.getMinutes() +
          ":" +
          date.getSeconds()
      );
  };
  console.log(
      "time=" + formatDate(date) + " level=" + level + " msg=" + message
  ); // call own logger);
};