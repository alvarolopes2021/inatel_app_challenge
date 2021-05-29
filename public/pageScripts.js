function I(i) {
    return document.getElementById(i);
}
//INITIALIZE SPEEDTEST
var s = new Speedtest(); //create speedtest object

var meterBk = /Trident.*rv:(\d+\.\d+)/i.test(navigator.userAgent) ? "#EAEAEA" : "#80808040";
var dlColor = "#6060AA",
    ulColor = "#616161";
var progColor = meterBk;

//CODE FOR GAUGES
function drawMeter(c, amount, bk, fg, progress, prog) {
    var ctx = c.getContext("2d");
    var dp = window.devicePixelRatio || 1;
    var cw = c.clientWidth * dp,
        ch = c.clientHeight * dp; //clieentwidth and clientheight 
    var sizScale = ch * 0.0055;
    if (c.width == cw && c.height == ch) {
        ctx.clearRect(0, 0, cw, ch);
    } else {
        c.width = cw;
        c.height = ch;
    }
    ctx.beginPath();
    ctx.strokeStyle = bk;
    ctx.lineWidth = 12 * sizScale;
    ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, Math.PI * 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = fg;
    ctx.lineWidth = 12 * sizScale;
    ctx.arc(c.width / 2, c.height - 58 * sizScale, c.height / 1.8 - ctx.lineWidth, -Math.PI * 1.1, amount * Math.PI * 1.2 - Math.PI * 1.1);
    ctx.stroke();
    if (typeof progress !== "undefined") {
        ctx.fillStyle = prog;
        ctx.fillRect(c.width * 0.3, c.height - 16 * sizScale, c.width * 0.4 * progress, 4 * sizScale);
    }
}

function mbpsToAmount(s) {
    return 1 - (1 / (Math.pow(1.3, Math.sqrt(s))));
}

function format(d) {
    d = Number(d);
    if (d < 10) return d.toFixed(2);
    if (d < 100) return d.toFixed(1);
    return d.toFixed(0);
}

//UI CODE
var uiData = null;

function startStop() {
    if (s.getState() == 3) {
        //speedtest is running, abort
        s.abort();
        data = null;
        if (darkModePage) {
            let startStopButton = I("startStopBtn");
            startStopButton.className = "stoppedDarkMode"; // return the element with this parameter
            if (pageLanguage === "pt-br") {
                startStopButton.innerHTML = allTranslations.langStart.pt_br.valueOf();
            } else {
                startStopButton.innerHTML = allTranslations.langStart.eng.valueOf();
            }
        } else {
            I("startStopBtn").className = "stoppedLightMode"; // return the element with this parameter
            if (pageLanguage === "pt-br") {
                startStopButton.innerHTML = allTranslations.langStart.pt_br.valueOf();
            } else {
                startStopButton.innerHTML = allTranslations.langStart.eng.valueOf();
            }
        }
        initUI();
    } else {
        //test is not running, begin
        let startStopBtn = I("startStopBtn");
        startStopBtn.className = "running"; // the button turns into running mode
        if (pageLanguage === "pt-br") {
            startStopBtn.innerHTML = allTranslations.langAbort.pt_br.valueOf();
        } else {
            startStopBtn.innerHTML = allTranslations.langAbort.eng.valueOf();
        }
        s.onupdate = function(data) {
            uiData = data; //on each speedtest update the uiData gets the data
        };
        s.onend = function(aborted) {
            if (darkModePage) {
                I("startStopBtn").className = "stoppedDarkMode";
                if (pageLanguage === "pt-br") {
                    startStopBtn.innerHTML = allTranslations.langStart.pt_br.valueOf();
                } else {
                    startStopBtn.innerHTML = allTranslations.langStart.eng.valueOf();
                }
            } else {
                I("startStopBtn").className = "stoppedLightMode";
                if (pageLanguage === "pt-br") {
                    startStopBtn.innerHTML = allTranslations.langStart.pt_br.valueOf();
                } else {
                    startStopBtn.innerHTML = allTranslations.langStart.eng.valueOf();
                }
            }

            updateUI(true);
        };
        s.start();
    }
}
//this function reads the data sent back by the test and updates the UI
function updateUI(forced) {
    if (!forced && s.getState() != 3) return;
    if (uiData == null) return;
    var status = uiData.testState;
    I("ip").textContent = uiData.clientIp;
    I("dlText").textContent = (status == 1 && uiData.dlStatus == 0) ? "..." : format(uiData.dlStatus);
    drawMeter(I("dlMeter"), mbpsToAmount(Number(uiData.dlStatus * (status == 1 ? oscillate() : 1))), meterBk, dlColor, Number(uiData.dlProgress), progColor);
    I("ulText").textContent = (status == 3 && uiData.ulStatus == 0) ? "..." : format(uiData.ulStatus);
    drawMeter(I("ulMeter"), mbpsToAmount(Number(uiData.ulStatus * (status == 3 ? oscillate() : 1))), meterBk, ulColor, Number(uiData.ulProgress), progColor);
    I("pingText").textContent = format(uiData.pingStatus);
    I("jitText").textContent = format(uiData.jitterStatus);
}

function oscillate() {
    return 1 + 0.02 * Math.sin(Date.now() / 100);
}
//update the UI every frame
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || (function(callback, element) {
    setTimeout(callback, 1000 / 60);
});

function frame() {
    requestAnimationFrame(frame);
    updateUI();
}
frame(); //start frame loop
//function to (re)initialize UI
function initUI() {
    drawMeter(I("dlMeter"), 0, meterBk, dlColor, 0);
    drawMeter(I("ulMeter"), 0, meterBk, ulColor, 0);
    I("dlText").textContent = "";
    I("ulText").textContent = "";
    I("pingText").textContent = "";
    I("jitText").textContent = "";
    I("ip").textContent = "";
}


/* Dark mode ON/OF switch command and colors*/

var darkModePage = false; // checks if this page is darkmode or not

function getDarkMode(darkMode) { //turns the page to dark mode
    if (darkMode) {
        darkModePage = true;
    }
}

let checkbox = document.getElementById("switchButton"); //event listner to turn the page dark
checkbox.addEventListener('change', function() {
    if (this.checked) {
        getDarkMode(true); //turns the knowledge of the page to dark mode
        let darkModeDocument = document.getElementsByTagName("body")[0];
        darkModeDocument.style.backgroundColor = "#222222";
        darkModeDocument.style.color = "#ddd";
        let links = document.getElementsByTagName("a");
        for (let index = 0; index < links.length; index++) {
            links[index].style.color = "#ddd";
        }
        let startButton = I("startStopBtn");
        startButton.className = "stoppedDarkMode startText"; //turn button to darkmode before hitting it

    } else {
        getDarkMode(false); // turns the knowloedge of the page to light mode
        var darkModeDocument = document.getElementsByTagName("body")[0];
        darkModeDocument.style.backgroundColor = "#eee";
        darkModeDocument.style.color = "#000";
        let links = document.getElementsByTagName("a");
        for (let index = 0; index < links.length; index++) {
            links[index].style.color = "#000";
        }
        let startButton = I("startStopBtn");
        startButton.className = "stoppedLightMode startText";
    }
});

var languagesAvaliable = document.getElementsByName('flags'); //languages avaliable in the page

var allTranslations = getLanguages(); //getes the translations int the languages script
var pageLanguage = "pt-br"; // initializes the page in pt-br

var brazilianFlag = document.getElementById("brazilianFlagImage"); //gets the brazilian flag
brazilianFlag.style.filter = "saturate(300%)"; //makes it visible default
var americanFlag = document.getElementById("americanFlagImage"); //gets the american flag
americanFlag.style.filter = "saturate(50%)";

for (let index = 0; index < languagesAvaliable.length; index++) { // event lister to check the page language
    languagesAvaliable[index].addEventListener("change", function() { //checks for user language
        pageLanguage = languagesAvaliable[index].value;
        if (pageLanguage == "pt-br") {
            brazilianFlag.style.filter = "saturate(300%)"; //turns brazilian flag as default
            americanFlag.style.filter = "saturate(50%)";
            let switchLabel = document.getElementById("switchLabel");
            switchLabel.innerHTML = allTranslations.langDarkMode.pt_br.valueOf(); //translates dark mode label
            let startStopBtn = I("startStopBtn");
            startStopBtn.innerHTML = allTranslations.langStart.pt_br.valueOf(); //on opening the page translates the button
            let sourceCodeLink = I("sourceCodeLink");
            sourceCodeLink.innerHTML = allTranslations.langSourceCode.pt_br.valueOf(); //translates the source code link
            let mainTitle = I("mainTitle");
            mainTitle.innerHTML = allTranslations.langSpeedTest.pt_br.valueOf();
        } else {
            americanFlag.style.filter = "saturate(300%)"; //turns american flag as default
            brazilianFlag.style.filter = "saturate(50%)";
            let switchLabel = document.getElementById("switchLabel");
            switchLabel.innerHTML = allTranslations.langDarkMode.eng.valueOf(); //translates dark mode label
            let startStopBtn = I("startStopBtn");
            startStopBtn.innerHTML = allTranslations.langStart.eng.valueOf(); //on opening the page
            let sourceCodeLink = I("sourceCodeLink");
            sourceCodeLink.innerHTML = allTranslations.langSourceCode.eng.valueOf();

            let mainTitle = I("mainTitle");
            mainTitle.innerHTML = allTranslations.langSpeedTest.eng.valueOf();
        }
    })
}

setTimeout(function() {
    initUI()
}, 100);