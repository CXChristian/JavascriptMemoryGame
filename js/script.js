// Used CoPilot to assist and provide code snippets
import { gameMessages, gameComponents } from  "../lang/messages/en/user.js";

class Button {
    constructor(id, color){
        this.id = id;
        this.height = "5em";
        this.width = "10em";
        this.color = color;
        this.fontSize = "24px";
    }
    
    static createButtonArr(userInput) {
        let buttonArray = [];
        for (let i = 0; i < userInput; i++) {
            let color = this.getRandomColor();
            buttonArray.push(new Button(i, color));
        };
        return buttonArray;
    }

    static getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}

class Game{
    constructor(uiHandler){
        const uiHeight = uiHandler.startDiv.offsetHeight;
        this.gameDiv = document.getElementById("gameWindow");
        this.windowWidth = window.outerWidth;
        this.windowHeight = window.outerHeight - uiHeight;
    }

    setupGameWindow(uiHandler){
        const uiHeight = uiHandler.startDiv.offsetHeight;
        this.gameDiv.style.display = "block";
        this.windowWidth = window.outerWidth;
        this.windowHeight = window.outerHeight - uiHeight;
        this.gameDiv.style.width = this.windowWidth + "px";
        this.gameDiv.style.height = this.windowHeight + "px"; 
    }

    // Clears game memory
    clearGameWindow(){
        while (this.gameDiv.firstChild) {
            this.gameDiv.removeChild(this.gameDiv.firstChild);
        }
    }

    lineButtons(buttonArray, uiHandler){
        this.setupGameWindow(uiHandler);
        this.gameDiv.style.display = "flex";
        this.gameDiv.style.flexDirection = "row";
        this.gameDiv.style.flexWrap = "wrap";

        for (let button of buttonArray) {
            let newButton = document.createElement("div");
            newButton.id = button.id;
            newButton.style.backgroundColor = button.color;
            newButton.style.height = button.height;
            newButton.style.width = button.width;
            
            // relative font size of div and positioning
            newButton.style.position = "relative";
            newButton.style.margin = "2px 5px";
            newButton.style.border = "2px solid grey";
            
            // Set number on button
            newButton.textContent = button.id + 1;
            newButton.style.display = "flex";
            newButton.style.alignItems = "center";
            newButton.style.justifyContent = "center";
            newButton.style.fontSize = button.fontSize; 

            this.gameDiv.appendChild(newButton);
        }        
    }

    // Function to scramble buttons every second
    scrambleButtons(uiHandler){
        const uiHeight = uiHandler.startDiv.offsetHeight;
        return new Promise((resolve) => {
            let buttonsDiv = document.querySelectorAll('#gameWindow > div');       
            let scramble = setInterval(() => { 
                this.setupGameWindow(uiHandler)
                // Logic to keep each button within window
                buttonsDiv.forEach((buttonDiv) => {
                    buttonDiv.style.position = "absolute";
                    let buttonWidth = parseFloat(buttonDiv.style.width) * parseFloat(buttonDiv.style.fontSize);
                    let buttonHeight = parseFloat(buttonDiv.style.height) * parseFloat(buttonDiv.style.fontSize);
                    buttonDiv.style.top = Math.floor(Math.random() * (this.windowHeight - buttonHeight - uiHeight) + uiHeight) + "px";
                    buttonDiv.style.left = Math.floor(Math.random() * (this.windowWidth - buttonWidth - uiHeight) + uiHeight) + "px";
                });
            }, 1000);
            
            // Stops interval after n seconds and clear number
            setTimeout(() => {
                clearInterval(scramble);
                buttonsDiv.forEach((buttonDiv) => {
                    buttonDiv.textContent = "";
                });
                resolve();
            }, (buttonsDiv.length) * 1000)
        });
    }

    playGame() {
        let buttonsDiv = document.querySelectorAll('#gameWindow > div');       
        let count = 0;
    
        buttonsDiv.forEach((buttonDiv) => {
            buttonDiv.addEventListener("click", buttonClickListener);
        });

        function buttonClickListener(event) {
            if (count == event.target.id) { // Correct option
                count++;
                buttonsDiv[event.target.id].textContent = parseInt(event.target.id) + 1;
            } else { // Wrong option
                alert(gameMessages.gameFailMesg);
                buttonsDiv.forEach((buttonDiv, index) => {
                    buttonDiv.textContent = index + 1;
                    buttonDiv.removeEventListener("click", buttonClickListener);
                });
                return;
            }
    
            if (count == buttonsDiv.length) { // Win game
                alert(gameMessages.gameSuccessMesg);
                buttonsDiv.forEach((buttonDiv) => {
                    buttonDiv.removeEventListener("click", buttonClickListener);
                });
            }
        }
    }

    // clones and replaces button to remove old listener for new restart
    restart(){
        const startButton = document.getElementById("startButton");
        const newStartButton = startButton.cloneNode(true);
        startButton.parentNode.replaceChild(newStartButton, startButton);

        newStartButton.addEventListener("click", () => {
            this.clearGameWindow();
            run(); // Restart the game
        });
    }
}

class UIHandler{   
    constructor(){
        this.startDiv = document.getElementById("gameStart");
    }

    // Displays user message and input field to start game
    startup(){
        this.startDiv.innerHTML = gameMessages.startupCountMesg;
        this.startDiv.appendChild(document.createElement("br"));
        
        const inputField = document.createElement("input");
        inputField.type = "text";
        inputField.id = "userInput";
        inputField.placeholder = gameComponents.inputFieldMesg; 
        this.startDiv.appendChild(inputField);

        const startButton = document.createElement("button");
        startButton.id = "startButton";
        startButton.innerHTML = gameComponents.startButtonMesg;
        this.startDiv.appendChild(startButton);
    }

    retrieveInput(){
        return new Promise((resolve) => { // Async promise to return user input
            const startButton = document.getElementById("startButton");
            let userInput = 0;
            
            startButton.addEventListener("click", () => {
                userInput = document.getElementById("userInput").value;
                
                if (!isNaN(userInput) && userInput >= 3 && userInput <= 7) {  
                    resolve(userInput);
                } else {
                    alert(gameComponents.invalidInputMesg);
                }
            });
        })
    }
}

async function run() {
    let uiHandler = new UIHandler();
    let game = new Game(uiHandler);

    uiHandler.startup();
    let userInput = await uiHandler.retrieveInput();
    let buttonArray = Button.createButtonArr(userInput);

    game.lineButtons(buttonArray, uiHandler);
    await new Promise(resolve => setTimeout(resolve, userInput * 1000)); // Wait for n seconds
    
    await game.scrambleButtons(uiHandler);
    game.playGame();

    game.restart();
}

run();