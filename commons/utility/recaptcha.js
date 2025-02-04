const Recaptcha = {
  isCaptchaVerified: false,
  createPopupWindow: () => {
    const popupContainer = document.createElement("div");
    popupContainer.id = "recaptcha-popup";
    popupContainer.className = "recaptcha-popup";

    // Create the popup content
    const popupContent = document.createElement("div");
    popupContent.classList = "recaptcha-popup-wrapper";

    popupContent.innerHTML = `
    <div class="recaptcha-modal-body">
      <div class="modal-content">
        <div class="modal-close-captcha">
          <button type="button" class="close-captcha-btn" data-dismiss="modal" aria-label="Close">
           <span aria-hidden="true">×</span>
          </button>
        </div>
        <div class="modal-body">
           <div class="left">
             <h6>Please Enter Captcha to continue</h6>
           </div>
           <div class="right">
            <div class="captcha-container">
                <div class="canvasHolder">
                    <canvas id="captchaCanvas" width="160" height="50"></canvas>
                </div>
                  <span class="refresh-icon" id="refreshCaptcha" title="Refresh"
                  ></span>
                </div>
                <div class="captcha-input">
                    <input type="text" id="captchaInput" placeholder="Enter Captcha" />
                     <div id="captchaStatus" style="font-size:13px;text-align:left !important; font-weight: bold"></div>
                    <button class="submitCaptcha" id="submitCaptcha">Submit</button>
                </div>
               
           </div>
        </div>
      </div>
    </div>
  `;

    // Append the popup content to the container
    popupContainer.appendChild(popupContent);

    // Stop page Scroll
    document.body.style.overflow = "hidden";

    // Append the container to the body
    document.body.appendChild(popupContainer);
    Recaptcha.createCaptcha();

    // Close functionality
    document
      .querySelector(".close-captcha-btn")
      .addEventListener("click", () => {
        popupContainer.remove();
        document.body.style.overflow = "";
      });
  },

  createCaptcha: () => {
    // Character pool for captcha
    const alpha = [
      "A",
      "B",
      "G",
      "e",
      "f",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "#",
      "@",
      "R",
      "V",
      "W",
      "X",
      "Y",
      "Z",
      "a",
      "b",
      "S",
      "T",
      "U",
      "c",
      "d",
      "g",
      "h",
      "i",
      "j",
      "k",
      "C",
      "D",
      "E",
      "F",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "H",
      "I",
      "J",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      "$",
      "%",
    ];
    const Nums = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    let generatedCaptcha = "";

    // Function to generate random numbers
    const getRandom = () => Math.random();

    // Function to generate captcha code
    function generateCode() {
      const emptyArr = [];
      for (let i = 1; i <= 5; i++) {
        emptyArr.push(alpha[Math.floor(getRandom() * alpha.length)]);
      }
      const num = Nums[Math.floor(getRandom() * Nums.length)];
      emptyArr.splice(((emptyArr.length + 1) * getRandom()) | 0, 0, num);
      return emptyArr.join("");
    }

    // Function to create captcha on canvas
    function createCanvas(canvas, captchaVal) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear previous content
      ctx.font = "italic bold 25px Arial";
      ctx.letterSpacing = "1px";
      ctx.fillStyle = "white";
      let x = 10,
        y = 42;

      // Draw the CAPTCHA letters
      for (let i = 0; i < captchaVal.length; i++) {
        if (i === 0 || i === 4) {
          ctx.fillText(captchaVal[i], x, y - 12);
        } else {
          ctx.fillText(captchaVal[i], x, y);
        }
        x += 25;
      }

      // Random lines
      ctx.strokeStyle = "Brown";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(getRandom() * 30, getRandom() * 50);
      ctx.lineTo(150, getRandom() * 50);
      ctx.stroke();
    }

    // Function to display captcha
    function showCaptcha() {
      const canvas = document.getElementById("captchaCanvas");
      generatedCaptcha = generateCode();
      createCanvas(canvas, generatedCaptcha);
    }

    // Function to validate captcha
    function validateCaptcha() {
      const inputVal = document.getElementById("captchaInput").value;
      const statusDiv = document.getElementById("captchaStatus");
      if (inputVal === generatedCaptcha) {
        Recaptcha.isCaptchaVerified = true;
      } else {
        statusDiv.textContent = "Invalid Captcha!";
        statusDiv.style.color = "red";
        Recaptcha.isCaptchaVerified = false;
      }
    }

    // Refresh captcha
    function refreshCaptcha() {
      document.getElementById("captchaInput").value = "";
      document.getElementById("captchaStatus").textContent = "";
      showCaptcha();
    }

    // Event listeners
    document
      .getElementById("refreshCaptcha")
      .addEventListener("click", refreshCaptcha);
    document
      .getElementById("submitCaptcha")
      .addEventListener("click", validateCaptcha);

    showCaptcha();
  },
};
export default Recaptcha;
