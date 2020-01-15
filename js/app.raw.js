$(document).ready(function() {
    const Device = require("js-scc");
    let display;

    class Display extends Device {

        /**

		MQTT library part
  	**/
        constructor(config) {
            super(config, logfunction);
            this.default_persons = [{
                    name: "Sciler de vries",
                    subname: "Bliep blop",
                    time: "Just now",
                    messages: [this.createMessage("Hoi", false, false)],
                    image: "https://api.adorable.io/avatars/140/"
                },
                {
                    name: "Mooie naam",
                    subname: "hoi!",
                    time: "Just now",
                    messages: [this.createMessage("Hallo", false, false)],
                    image: "https://api.adorable.io/avatars/128/mirza.png"
                }
            ];

            this.currentMessage = ""
            this.messages = []

            this.init()

        }

        init() {
        	this.persons = [...this.default_persons];
            this.currentPerson = this.persons[0];
            this.bindHandlers();
            this.updateView();
        }


        getStatus() {
            return {
                "typing": this.currentMessage,
                "currentPerson": this.currentPerson.name,
                "speler-bericht": this.messages[this.messages.length - 1],
                "messages": this.messages,
            }
        }

        performInstruction(action) {
            switch (action.instruction) {
                case "hint": {
                    this.addMessage(this.persons[0], action.value)
                    this.playHintAudio();
                    break;
                }
                case "person":
                    this.addMessage(this.persons[1], action.value)
                    break;
                case "tekst":
                    this.addMessage(this.persons[1], action.value)
                    break;
                default: {
                    return false;
                }
            }
            this.statusChanged();
            this.updateView();
            return true;
        }

        test() {
            this.showHint(test)
            this.statusChanged();
            this.updateView();
        }

        reset() {
        	console.log("ik word gereset")
            this.persons = [...this.default_persons];
            this.currentPerson = this.persons[0];
            this.updateView();
            this.statusChanged();
            console.log("ik ben klaar met resetten")
        }

        /**

		HTML Events Part
		
      **/

        bindHandlers() {
            this.bindTextHandler()
            this.bindButtonHandler()
        }

        bindButtonHandler() {
            let that = this;
            $("button.mdl-js-button").on('click', function(e) {
                let message = that.createMessage(that.currentMessage, true, true)
                that.currentPerson.messages.push(message)
                that.messages.push(message.text);
                that.clearCurrentMessage()
                that.statusChanged();
                that.updateView();
            });
        }

        bindTextHandler() {
            let that = this;
            $("#messagefield").on('change paste keyup', function(e) {
                let text = e.target.value
                that.currentMessage = text;
                that.statusChanged();
            })
        }

        /***
	
		Some logic

      ***/

        clearCurrentMessage() {
            $("#messagefield").val("");
            this.currentMessage = ""
        }

        createMessage(text, self, read) {
            return {
                text: text,
                time: new Date(),
                self: self,
                read: read
            }
        }

        addMessage(person, text) {
            let message = this.createMessage(text, false, false)
            person.messages.push(message)
        }

        updateView() {
            this.showPersons(this.persons);
            this.showMessages(this.currentPerson)
            this.playHintAudio()
        }

        setMessagesRead(person){
        	for (let i = 0; i < person.messages.length; i++){
        		let message = person.messages[i]
        		message.read = true;
        	}
        }


        /***
	
		HTML Generation Part

      ***/
      	showPersons(persons) {
            $(".mdl-list").html("");
            for (let i = 0; i < persons.length; i++) {
            	let person = persons[i]
                $(".mdl-list").append(this.personHTML(person))
            }
        }

         personHTML(person) {
		    let messageCount = 0;
		    for (const message of person.messages) {
		        if (!message.read){
		            messageCount++;
		        }
		    }

		    let messageCountHTML = "";
		    if (messageCount > 0){
		    	messageCountHTML = '<span>' + messageCount + '</span>';
		    }

		    let html = '\
		        <span class="mdl-list__item-primary-content">\
		            <img class="mdl-list__item-avatar" src="' + person.image + '" />\
		            <span>' + person.name + '</span>' + messageCountHTML + '\
		            <span class="mdl-list__item-sub-title"> ' + person.subname + '</span>\
		        </span>\
		        <span class="mdl-list__item-secondary-content">\
		            <span class="mdl-list__item-secondary-info"> ' + person.time + '</span>\
		        </span>';
		    let that = this;
		    let clickableHTML = $("<li>").addClass("mdl-list__item mdl-list__item--two-line mdl-button").html(html).click(function() {
		    	that.currentPerson = person;
		        that.showMessages(person);
		        that.setMessagesRead(person)
		        that.updateView();
		        that.statusChanged();
		        $(".title-name").text(person.name);
		        $(".main-panel .mdl-list__item-avatar").attr("src", person.image);

		    })
		    return clickableHTML;
		}

		showMessages(person) {
		    let list = ""
		    for (const index in person.messages) {
		        list = list + this.messageHTML(person.messages[index]);

		    }
		    $(".chatlist").html(list);
		}

		messageHTML(message) {
		    let htmlClass = !message.self ? "mdl_chatlist_item__left" : "mdl_chatlist_item__right";
		    let html = '\
			<div class="mdl_chatlist_item ' + htmlClass + '">\
				<div class="text">' + message.text + '</div>\
				<div class="time">' + message.time.toLocaleTimeString() + '</div>\
			</div>'

		    return html;
		}

		/***
			Audio playing
		***/

		playHintAudio(){
            console.log("Gaat spelen")
			this.playAudio('/sounds/notification.mp3');
		}

		playAudio(file){
            console.log("speelt muziek af", file);
			var audio = new Audio(file);
			audio.play();
		}
		


    }

    // get config file from server
    $.get("/whatsapp.json", function(config) {
        $(document).on('click touch', function(){
            if(!display){
                display = new Display(config);
                display.start();
                display.statusChanged()
            }
        })
    });
});


logfunction = function(date, level, message) {
    const formatDate = function(date) {
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