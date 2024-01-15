function displayMessage(message) {
    const chatMessages = document.getElementById('chatMessages');

    const response = document.createElement('p');
    response.textContent = "ChatGPT4: Beep boop!";
    chatMessages.prepend(response);
    const messageDiv = document.createElement('p');
    messageDiv.textContent = "You: " + message;
    chatMessages.prepend(messageDiv);

}

async function fetchAndUpdateContent(message) {
    try {
        // Fetch and update HTML content
        const htmlResponse = await fetch(`${message}.html`);
        const htmlContent = await htmlResponse.text();
        document.getElementById('contentArea').innerHTML = htmlContent;

        // Fetch and update CSS content
        const cssResponse = await fetch(`${message}.css`);
        const cssContent = await cssResponse.text();
        let styleTag = document.getElementById('dynamic-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'dynamic-style';
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = cssContent;

        // Fetch and execute JS content
        const jsResponse = await fetch(`${message}.js`);
        if (jsResponse.ok) {
            const jsContent = await jsResponse.text();
            if (jsContent != "") {
                const scriptTag = document.createElement('script');
                scriptTag.textContent = jsContent;
                document.body.appendChild(scriptTag);
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}

let currentIndex = 0;
let chatData = [];


fetch('/chatSimData.json')
    .then(response => response.json())
    .then(data => {
        displayMessage("Hey ! I'm ChatGPT and here to help you make a website.");
        const a = chatData[currentIndex];
        document.getElementById(`chatInput`).value = data[0].inputText;
        chatData = data;
    });

function displayNextMessage() {
    if (currentIndex < chatData.length) {
        const item = chatData[currentIndex];
        displayMessage(item.inputText);
        fetchAndUpdateContent(item.content);
        if (currentIndex < chatData.length) {
            const a = chatData[currentIndex+1];
            document.getElementById(`chatInput`).value = a.inputText;
            this.style.height = 'auto'; // Reset height
            this.style.height = (this.scrollHeight) + 'px'; // Set to scroll height
        }
        currentIndex++;
    }

}

document.addEventListener('press', function (event) {
    if (event.code === 'Space') {
        displayNextMessage();
    }
});


document.getElementById('chatButton').addEventListener('click', displayNextMessage);

document.querySelectorAll('#menu li').forEach(item => {
    item.addEventListener('click', function () {
        // Get target section ID from data attribute
        const target = document.getElementById(this.getAttribute('data-target'));
        // Calculate the indicator position and width
        const targetBounds = target.getBoundingClientRect();
        const indicator = document.getElementById('indicator');
        indicator.style.width = `${targetBounds.width}px`;
        indicator.style.left = `${targetBounds.left}px`;
        // Update the active class on menu
        document.querySelectorAll('#menu li').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

