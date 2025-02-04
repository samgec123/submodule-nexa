if (typeof SpeechServiceEndpoint === 'undefined') {
    let SpeechServiceEndpoint;
  }

  if (typeof SpeechServiceRegion === 'undefined') {
    let SpeechServiceRegion;
  }

  if (typeof SpeechServiceKey === 'undefined') {
    let SpeechServiceKey;
  }


function fetchConfig() {
    return fetch("https://dev-virtualassist.marutisuzuki.com/api/config/speech")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json(); // Assuming the response is in JSON format
        })
        .then((data) => {
            // Access the keys from the response
            let config = {
                SpeechServiceRegion: data.speechServiceRegion,
                SpeechServiceEndpoint: data.speechServiceEndpoint,
                SpeechServiceKey: data.speechServiceKey
            };
            return config;
        })
        .catch((error) => {
            console.error("Error:", error.message);
        });
}

function ChatApp() {
    this.styleOptions = {
        backgroundColor: '#F2F2F2',
        bubbleBackground: '#F2F2F2',
        bubbleBorder: 'solid 1px #6495ED',
        bubbleBorderRadius: 20,
        bubbleFromUserBackground: '#586B83',
        bubbleFromUserBorder: 'solid 1px #6495ED',
        bubbleFromUserBorderRadius: 20,
        bubbleFromUserTextColor: '#FFFFFF',
        bubbleTextColor: '#18171A',
        hideUploadButton: true,
        botAvatarInitials: '',
        userAvatarInitials: '',
        botAvatarImage: '../../icons/bot-icon.png',
        userAvatarImage: '../../icons/user-icon.png',
        bubbleMinWidth: '90%',




        // Timestamp options
        timestampColor:'#767879',
        fontSizeSmall:'12px',

        // common Avatar options (common for bot and user)
        avatarBorderRadius:'100%',
        avatarSize:32,

        //user avatar options
        userAvatarBackgroundColor:'#586B83',
        userAvatarInitialsColor:'#FFFFFF',

        //send box -> user input field
        sendBoxBackground:'#F2F2F299',
        sendBoxPlaceholderColor:'#767879', //inactive
        sendBoxTextColor: '#18171A', //active

        // bot avatar fill
        botAvatarBackgroundColor:'#18181A',// filling with image so setting this to transparent
        //chips
        suggestedActionBackgroundColor:'#000000 !IMPORTANT',
        suggestedActionTextColor:'#FFFFFF',
        suggestedActionBorderColor:'#000000' ,
        suggestedActionBorderRadius :'18px !IMPORTANT',
        suggestedActionHeight: 24,
        suggestedActionImageHeight:10,
        suggestedActionBorderWidth: 1,
        suggestedActionLayout: 'flow',
        paddingWide: 12,
        suggestedActionBorderStyle: 'solid',


        primaryFont: 'Fira_Sans_regular',
        paddingRegular:10



    };



    this.directLineToken = '';
    this.webSpeechPonyfillFactory = null;
    this.webChatStore = null;
    this.localizedStrings = [];
    this.language = 'en-IN-NeerjaNeural';
    this.selectedContext = this.selectedContext.bind(this)
    this.userId = null;
    this.dl = null;
    this.localizationObject = null;
    this.clipboardMessage = '';
    this.isSpeaking = false;
}

ChatApp.prototype.appendChatWidgetIfNotExists = function () {

    // Check if the chat-icon already exists
    const existingChatIcon = document.getElementById('chat-icon');
    // If it doesn't exist, create and append it
    if (!existingChatIcon) {
        const chatIconDiv = document.createElement('div');

        // Set the inner HTML of the new div element
        chatIconDiv.innerHTML = `<div id="chat-icon" onclick="chatApp.toggleWebChat()">
            <img src="../../icons/bot-icon.png" alt="Nexa Logo" style="width: 100%; height: auto;">
        </div>`;

        // Append the new div element to the body
        document.body.appendChild(chatIconDiv)
    }

    // Check if the copyToClipboard already exists
    const existingCopyToClipboard = document.getElementById('copyToClipboard');
    // If it doesn't exist, create and append it
    if (!existingCopyToClipboard) {
        const copyToClipboardButton = document.createElement('div');

        // Set the inner HTML of the new div element
        copyToClipboardButton.innerHTML = `<button type="button" id="copyToClipboard"  onclick="chatApp.copyToClipboard()">Copy</button>`;

        // Append the new button element to the body
        document.body.appendChild(copyToClipboardButton)
    }

    // Check if the webchat-container already exists
    const existingWebChatContainer = document.getElementById('webchat-container');

    // If it doesn't exist, create and append it
    if (!existingWebChatContainer) {
        // Create a new div element
                 const webChatContainerDiv = document.createElement('div');
                 webChatContainerDiv.classList.add('outerDiv');
                 // Set the inner HTML of the new div element
                 webChatContainerDiv.innerHTML = `
                <div id="webchat-header-notch" style="display:none;" class="polygon">
                </div>

                <div id="webchat-container">
                    <div id="webchat-header">
                      <span id="webchat-span">Akira AI</span>
                      <div id="maximize-button" style="display: none;" onclick="chatApp.maximizeWebChat();">
                      <svg width="17" height="17" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.5 17.5L10 17.5L10 16L14.9557 16L2 3.04425L2 8L0.5 8L0.499999 0.5L8 0.5L8 2L3.04425 2L16 14.9557L16 10L17.5 10L17.5 17.5Z" fill="white"/>
                      </svg>
                      </div>
                      <div id="minimize-to-standard" style="display:none;" onclick="chatApp.minimizeToStandardWebChat();">
                      <svg width="19" height="19" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.5 18.4557L18.4557 19.5L11.5 12.5442L11.5 17.5L10 17.5L10 10L17.5 10L17.5 11.5L12.5442 11.5L19.5 18.4557ZM10 10L2.5 10L2.5 8.5L7.45575 8.5L0.499999 1.54425L1.54425 0.5L8.5 7.45575L8.5 2.5L10 2.5L10 10Z" fill="white"/>
                      </svg>
                      </div>
                      <div id="minimize-button" onclick="chatApp.minimizeWebChat()">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path id="minimize-icon" d="M11.25 12.75H5.5V11.25H11.25H12.75H18.5V12.75H12.75H11.25Z" fill="#ffffff"/>
                        </svg>
                      </div>
                    </div>

                    <div id="loadingMessage">
                      Please wait, while we are connecting..
                    </div>

                    <div id="pre-chat-container">
                      <div id="menu-items-container" style="display: none; justify-content: flex-end; align-items: center;">
                        <div id="menuContainer">
                          <!-- Content will be dynamically added here -->
                        </div>
                      </div>
                    </div>

                    <div id="webchat" style="display:none;"></div>
                </div>
                <div class="blur-background"></div>
             `;

        // Append the new div element to the body
        document.body.appendChild(webChatContainerDiv)
    }

    setTimeout(() => this.initializeMenuAndSubMenus(), 1000)
}

ChatApp.prototype.initializeMenuAndSubMenus = function () {
    this.menu = document.createElement('div');
    this.menu.className = 'menu';
    this.menu.id = "menu";
    this.menuItems = document.createElement('div');
    this.menuItems.className = 'menu-items';
    this.menuItems.id = "menuItems";
    this.menuItems.style.display = 'none';
    this.selectedDepartment = 'Automotive'
    this.setupMenu();
    this.setupMenuItems();
};

ChatApp.prototype.displayMenuContainer = function (userID) {
    document.getElementById("menu-items-container").style.display = "flex";
    document.getElementById("webchat-heading").style.display = "block";
    let speakButton = document.getElementById('speak');
    speakButton.onclick = function () {
        startRecording(userID);
    };
};

ChatApp.prototype.setupMenu = function () {
    this.menu.innerHTML = `
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAKfSURBVHgB7VRPTxNBFH8zu1uKXvYABWPR3Zs3682b7cGkrCbizZvhE1g/AfAJ0G+AN2/WhJQaDqw3j/XGbRdY4hJMXBMopduZ8b3BIvYvnuTAS7bdzLx5v/f77W8ewHX872DjEqbKe0XGYIEDfwZMObSmFDTwZIPLdCWuu+Go83zYhl0M7Jn5aNUw2AeDQcIm2qWDWp7RYzFYxIOfFc9sUQ7lwr8woAOZSWsLi3xtnaSVxHeTQXnOQmCftM1lpdij9klaGpQ3EIC6QiHYwcZcRQOWA8c0jIdcQksxbispW0yI7cNNt0H7ufloDQv9ONjIvx4LMFv+5igutk6b6QPqSH8DDtmbzY4f+m7rPO/pXrHT6cD3uutrJqkVMKGex/U5/2I9sxdAMrHMQa5Q8WkvKBi8A/G6WzcQOOdFS908JSCxuPlpFtmFVTfMeXtvJZoBt0YDoGPui5S/0UWkcS+u3Xk//TgqxPVbJMdiNy/3ZHdt4lj4R1mDioZcmmvEHN8rIwEwCoebea0tSaP/LXiF0q0IIeyMBSBkmkiqipLl5ne1bNhAOONFTm+xoTbVcin4yxVUvDeU4vaIEgMZ7JCudIGIgVMMss3fHV5Muu1FZzIC0wymvaigABqXAfizKawvxzdYkYP6SVbsrnOVLu/X8g3tMKG29aKEAupxCQAFAZimg28hdY12dNCOVbJjN4VYocPK6LAWMm3QxeSMLTHZLo0H6Il4fc4n+lPl3Rd4abJoxeQIpSN2ce1MtolJC+0rPw6aS2MBKA5r2lV99PVIyWZWFVOFdrNTGnS2H4CBLdvKJn3PlwRL0jQNu7OGRkcGMi8ZVxW8LO9OsfiwedU3Kma8/YDmED7hRVD8uYvfp2vJHalU1TCgShLCdVzp+AWrZDTHBsBAkgAAAABJRU5ErkJggg==" alt="Context">
        <p id="webchat-context" tab="Automotive">Automotive</p>
    `;
    document.getElementById('menuContainer').appendChild(this.menu);
};

ChatApp.prototype.setupMenuItems = function () {
    this.menuItems.innerHTML = `
            <div class="menu-item"><label><input type="radio" name="menuOption" value="Automotive">Automotive</label></div>
    `;
    document.getElementById('menuContainer').appendChild(this.menuItems);
};

ChatApp.prototype.getButtonsBasedOnDepartment = async function (sharedValue) {
    //to set the data of department according to the selected language
    let detail = [];
    try {
        const response = await fetch(`webchat_${this.language}.json`);
        const data = await response.json();
        this.localizedStrings = data;
        detail = this.localizedStrings[sharedValue.toLowerCase()];
    }
    catch (error) {
        console.error('Error loading language file:', error);
    }
    return detail;
};

ChatApp.prototype.updateMenuText = function (value) {
    let textNode = this.menu.querySelector('p');
    textNode.innerText = value;
    textNode.setAttribute('tab', value);
    document.getElementById("menu").style.display = "flex";
    document.getElementById("menuItems").style.display = "none";
};

ChatApp.prototype.fetchDoMObjects = function () {
    this.directLineToken = '';
    this.webChatContainer = document.getElementById('webchat-container');
    this.webChatContainerNotch = document.getElementById('webchat-header-notch');
    this.webChat = document.getElementById('webchat');
    this.chatIcon = document.getElementById('chat-icon');
    this.minimizeButton = document.getElementById('minimize-button');
    this.loadingContainer = document.getElementById('loadingMessage');
    this.preChatContainer = document.getElementById("pre-chat-container");
    this.copyToClipboardBtn = document.getElementById("copyToClipboard");
    this.maximizeButton = document.getElementById('maximize-button');
    this.minimizeToStandard = document.getElementById('minimize-to-standard');
    this.maximizeButton.style.display = "block";
    this.minimizeToStandard.style.display = "none";
    this.copyToClipboardBtn.style.display = "none";
    this.webSpeechPonyfillFactory = null;
}

ChatApp.prototype.fetchSpeechServiceToken = async function dd() {
    let authorizationToken;
    let region;
    let config = await fetchConfig();
    let speechServiceEndpoint = config.SpeechServiceEndpoint;
    let speechServiceRegion = config.SpeechServiceRegion;
    let speechServiceKey = config.SpeechServiceKey;

    const speechServicesTokenRes = await fetch(
        config.SpeechServiceEndpoint, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': speechServiceKey
        }
    });

    if (speechServicesTokenRes.status === 200) {
        region = speechServiceRegion;
        authorizationToken = await speechServicesTokenRes.text();
    } else {
        throw new Error('Error fetching speech services token!');
    }

    try {
        this.webSpeechPonyfillFactory = await window.WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
            credentials: {
                authorizationToken: authorizationToken,
                region: region
            }
        });
    } catch (error) {
        if (error.message.includes("401") || error.message.includes("WebSocket connection to")) { // Check if the error message includes "401"
            // Re-fetch the token and retry
            return this.fetchSpeechServiceToken();
        } else {
            throw error; // If the error is not about token expiration, just throw it
        }
    }
}


ChatApp.prototype.getInitialDirectLineToken = async function () {
    try {
        const response = await fetch("https://dev-virtualassist.marutisuzuki.com/api/config/direct-line-token", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        this.directLineToken = data.token;
        this.TokenType = data.tokenType;
    } catch (error) {
        console.error('Error fetching initial token:', error);
    }
};

ChatApp.prototype.refreshDirectLineToken = async function () {
    try {
        const response = await fetch("https://dev-virtualassist.marutisuzuki.com/api/config/direct-line-token", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        this.directLineToken = data.token;
        this.TokenType = data.tokenType

        // Update Web Chat with the new token
        this.updateWebChatToken();
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
};

ChatApp.prototype.updateWebChatToken = function () {
    // Destroy the existing Web Chat instance
    this.webChatContainer.innerHTML = '';

    this.renderWebChat();
};

ChatApp.prototype.maximizeWebChat = function () {
    try {
        this.webChatContainer.style.width='721px';
        this.maximizeButton.style.display = "none";
        this.minimizeToStandard.style.display = "block";
        //turn on minimzetostandard icon.
        console.log('maximizeWebChat clicked');
    } catch (error) {
        console.error(error);
    }
}
ChatApp.prototype.minimizeToStandardWebChat = function () {
    try {
        this.webChatContainer.style.width='400px';
        this.maximizeButton.style.display = "block";
        this.minimizeToStandard.style.display = "none";
        //turn on minimzetostandard icon.
        console.log('standard size clicked');
    } catch (error) {
        console.error(error);
    }
}

ChatApp.prototype.initializeWebChat = async function () {
    try {
        this.appendChatWidgetIfNotExists()

        this.fetchDoMObjects();

        await this.fetchSpeechServiceToken();

        await this.getInitialDirectLineToken();

        if (this.tokenType == 'Token') {
            // Set up a timer to refresh the Direct Line token before it expires
            setInterval(() => this.refreshDirectLineToken(), 30 * 60 * 1000); // Refresh every 30 minutes (adjust as needed)
        }

        this.renderWebChat();
    } catch (error) {
        console.error(error);
    }
};

ChatApp.prototype.renderWebChat = async function () {

    const response = await fetch('/scripts/chatbot-overrides.json');
    const data = await response.json();
    this.localizationObject = {
        locale: this.language, // Replace with your locale
        localizedStrings: data
    };
    this.dl = this.tokenType == 'Token' ? window.WebChat.createDirectLine({ token: this.directLineToken }) : window.WebChat.createDirectLine({ secret: this.directLineToken });

    this.webChatStore = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
        if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
            // Hide the loading container once Web Chat is connected
            this.loadingContainer.style.display = 'none';
            this.preChatContainer.style.display = 'block';

            // Show the Web Chat container
            this.webChat.style.display = 'block';

            dispatch({
                type: 'WEB_CHAT/SEND_EVENT',
                payload: {
                    name: 'webchat/join',
                    value: { locale: this.localizationObject.locale }
                }
            });
        } else if (action.type === 'DIRECT_LINE/CONNECT_REJECTED') {
            this.loadingContainer.style.display = 'Connection failed, please try again.';
            this.preChatContainer.style.display = 'none';
        } else if (action.type === 'DIRECT_LINE/INCOMING_ACTIVITY') {
            const { activity } = action.payload;

            // Check if the activity contains an Adaptive Card with actions
            const isAdaptiveCardWithActions = activity.type === 'message' &&
            activity.attachments &&
            activity.attachments.length > 0 &&
            activity.attachments[0].content?.actions &&
            activity.attachments[0].content.actions.length > 0 ;

            if (isAdaptiveCardWithActions) {
                let btnArr = document.getElementsByClassName("ac-pushButton");

                if(btnArr && btnArr.length > 0) {
                    // Convert the HTMLCollection to an array for easier manipulation
                    let btnArray = Array.from(btnArr);

                    // Filter out disabled elements
                    let activeButtons = btnArray.filter(button => !button.disabled);

                    // If you want to do something with the active buttons, you can iterate through them
                    activeButtons.forEach(activeButton => {
                        activeButton.disabled = true;
                    });
                }
            }

            // Check if the activity contains an Adaptive Card with SuggestedActions
            if (activity.type === 'message' && activity.suggestedActions) {
                // Add the "Copy to Clipboard" button to the SuggestedActions
                const actions = activity.suggestedActions.actions || [];

                // Insert the "Copy to Clipboard" button as the second last item
                actions.splice(actions.length - 1, 0, { type: 'postBack', title: '📋', value: 'copyToClipboard' });

                if (this.isSpeaking)
                {
                    // Insert the "Mute" button as the last item
                    actions.splice(actions.length, 0, { type: 'postBack', title: '🔇', value: 'mute' });
                }
                // Update the suggestedActions with the modified actions array
                activity.suggestedActions = {
                    ...activity.suggestedActions,
                    actions: actions
                };

                if (activity.attachments && activity.attachments.length > 0 &&
                    activity.attachments[0]?.content && activity.attachments[0]?.content?.body &&
                    Array.isArray(activity.attachments[0].content.body)
                ) {
                    const textBlocks = activity.attachments[0]?.content.body
                        .filter(element => element.type === 'TextBlock');

                    if (textBlocks.length > 0) {
                        const answerText = textBlocks[0].text || '';
                        localStorage.setItem('answerText', answerText);
                    }
                }
            }
        }
        else if (action.type === 'DIRECT_LINE/POST_ACTIVITY' && (action?.payload?.activity?.text == 'copyToClipboard' || action?.payload?.activity?.value == 'copyToClipboard')) {
            this.copyToClipboard();
            // Return null to prevent the action from being sent to the bot API
            return null;
        }
        else if (action?.type === 'WEB_CHAT/SEND_POST_BACK' && action?.payload?.value === 'copyToClipboard') {

            // Check if the incoming action is the placeholder action for a local message and prevent it from being sent to the bot
            // Display a local message to the user
            if (this.clipboardMessage === '') {
                this.clipboardMessage = 'Content copied to clipboard successfully!';
            }
            sendMessageToUser(this.clipboardMessage);
            this.copyToClipboard();
            removeElementsByClass('webchat__suggested-actions__item-box');
            return null;
        }
        else if (action?.type === 'WEB_CHAT/SEND_POST_BACK' && action?.payload?.value === 'mute')
        {
            this.mute = !this.mute;
            this.webChatStore.dispatch({
                type: 'WEB_CHAT/STOP_SPEAKING',
                payload: { text: this.mute }
            });
            this.isSpeaking = false;
            return null;
        }

        else if (action.type === 'WEB_CHAT/SET_DICTATE_STATE') {
            this.isSpeaking = true;
        }

        function removeElementsByClass(className) {
            const elements = document.getElementsByClassName(className);
            while (elements.length > 0) {
                elements[0].parentNode.removeChild(elements[0]);
            }
        }

        // Function to send a message to the user through Web Chat
        function sendMessageToUser(message) {
            const newActivity = {
                type: 'message',
                id: 'local-' + Date.now(),
                timestamp: new Date(),
                from: { id: 'user', name: 'User' },
                text: message
            };
            dispatch({ type: 'DIRECT_LINE/INCOMING_ACTIVITY', payload: { activity: newActivity } });
        }

        return next(action);
    });

    // Render Web Chat with the initial Direct Line token
    window.WebChat.renderWebChat({
        directLine: this.dl,
        sendTypingIndicator: true,
        styleOptions: this.styleOptions,
        webSpeechPonyfillFactory: this.webSpeechPonyfillFactory,
        store: this.webChatStore,
        locale: this.localizationObject.locale,
        localizedStrings: this.localizationObject.localizedStrings
    }, this.webChat);
};

ChatApp.prototype.copyToClipboard = function () {
    const textToCopy = localStorage.getItem('answerText');
    // Requesting write access to the clipboard using the Clipboard API
    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            console.log('Text copied to clipboard:', textToCopy);
        })
        .catch((error) => {
            console.error('Error copying to clipboard:', error);

            // Fallback: if the Clipboard API fails, use the execCommand method
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();

            try {
                document.execCommand('copy');
                console.log('Text copied to clipboard:', textToCopy);

            } catch (fallbackError) {
                console.error('Fallback error copying to clipboard:', fallbackError);

            } finally {
                document.body.removeChild(textArea);
            }
        });
}

ChatApp.prototype.sendMessage = function sendMessage(message) {
    this.webChatStore.dispatch({
        type: 'WEB_CHAT/SEND_MESSAGE',
        payload: { text: message }
    });
}

ChatApp.prototype.toggleWebChat = function () {
        if (this.webChatContainer.style.display === 'block') {
            // Close the web chat
            this.webChatContainer.style.display = 'none';
            this.chatIcon.style.backgroundColor = '#3498db'; // Set background color when chat is closed
        } else {
            // Open the web chat with animation
            this.webChatContainer.style.display = 'block';
            this.webChatContainer.style.animation = 'fadeInUp 0.5s ease-in-out';
            this.chatIcon.style.display = 'none'; // Hide the chat icon when web chat is open
            this.webChatContainerNotch.style.display = 'block'; // Show the notch when web chat is open
        }
    };

ChatApp.prototype.minimizeWebChat = function () {
    this.webChatContainer.style.display = 'none'; // Hide the web chat container when minimized
    this.webChatContainerNotch.style.display = 'none'; // Show the notch when minimized
    this.chatIcon.style.display = 'flex'; // Show the chat icon when minimized
    this.webChatPopUpDiv = document.getElementById('webchat-popup');
    // this.webChatPopUpDiv.style.display = 'none'; // Hide the pop up when minimized
};

ChatApp.prototype.closePopUp = function () {
    this.webChatPopUpDiv = document.getElementById('webchat-popup');
    this.webChatPopUpDiv.style.display = 'none'; // Hide the web chat container when minimized
};

ChatApp.prototype.staticTextChanges = async function () {
    const response = await fetch(`webchat_${this.language}.json`);
    const data = await response.json();
    this.localizedStrings = data;
    const pageTitleSpan = document.getElementById('webchat-span');
    pageTitleSpan.textContent = this.localizedStrings["title"];
    const heading = document.getElementById('webchat-heading');
    heading.textContent = this.localizedStrings["heading"];
    const context = document.getElementById('webchat-context');
    this.clipboardMessage = this.localizedStrings["clipboardMessage"];
    this.welcomeMessage = this.localizedStrings["welcomeMessage"];
};

//this event is called when user selects the context
ChatApp.prototype.selectedContext = function (context) {
    this.updateMenuText(context);
    if (!this.dl) {
        console.error('DirectLine instance is not initialized.');
        return;
    }

    this.dl.postActivity({
        name: 'userSelectedContext',
        type: 'event',
        value: context
    }).subscribe(
        id => console.log(`Posted activity, assigned ID ${id}`),
        error => console.log(`Error posting activity ${error}`)
    );

};

window.chatApp = new ChatApp();