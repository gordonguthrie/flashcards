var ESP = {};

ESP.supports_html5_storage = function () {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
};

ESP.sendRequest = function (url, callback, postData) {
    var req = ESP.createXMLHTTPObject();
    if (!req) {
        return;
    };
    var method = (postData) ? "POST" : "GET";
    req.overrideMimeType("application/json");
    req.open(method,url,true);
    req.setRequestHeader('User-Agent','XMLHTTP/1.0');
    if (postData) {
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    };
    req.onreadystatechange = function () {
        if (req.readyState != 4) return;
        if (req.status != 200 && req.status != 304) {
            // alert('HTTP error ' + req.status);
            return;
        }
        callback(req);
    }
    if (req.readyState == 4) {
        return;
    };
    req.send(postData);
}

ESP.createXMLHTTPObject = function() {
    var xmlhttp = false;
    for (var i=0; i < ESP.data.XMLHttpFactories.length; i++) {
        try {
            xmlhttp = ESP.data.XMLHttpFactories[i]();
        }
        catch (e) {
            continue;
        }
        break;
    }
    return xmlhttp;
}

ESP.select_language = function (event) {
    console.log("select language");
    console.log(event.target.value);
};

ESP.select_difficulty = function (event) {
    console.log("select difficulty");
    console.log(event);
    console.log(event.target.value);
};

ESP.click_answer = function () {
    console.log("answer clicked");
    document.getElementById("score_buttons").style.display = "block";
    document.getElementById("ready_button").style.display = "none";
};

ESP.click_score = function (event) {
    console.log("click score");
    console.log(event.target.id);
    document.getElementById("ready_button").style.display = "block";
    document.getElementById("score_buttons").style.display = "none";
};

ESP.write_to_page = function (string) {
    document.getElementById("content").innerHTML = string;
};

ESP.bind = function (event, id, fun) {
    var elem = document.getElementById(id).addEventListener(event, fun);
};

ESP.get_version = function () {
    var version;
    version = document.getElementsByTagName("body")[0].getAttribute("data-version");
    return version;
}

ESP.maybe_load_wordlist = function () {
    var currentversion, storedversion, url, callback, key;
    currentversion = ESP.get_version();
    storedversion = localStorage.getItem("version");
    if (currentversion !== storedversion) {
        url = "./wordlist.json";
        callback = function(wordlist) {
            var words, i, esperanto, english, description, difficulty;
            words = JSON.parse(wordlist.response)["wordlist"];
            for (i = 0; i < words.length; i++) {
                difficulty = words[i]["difficulty"];
                if (! ESP.data.wordlists[difficulty]) {
                    ESP.data.wordlists[difficulty] = [];
                };
                ESP.data.wordlists[difficulty].push(words[i]);
            }
            for (key in ESP.data.wordlists) {
                localStorage.setItem(key, ESP.data.wordlists[key]);
            };
        };
        return ESP.sendRequest(url, callback, false);
    };
};

// ESP Data Structures

ESP.data = {};

ESP.data.XMLHttpFactories = [
    function () {return new XMLHttpRequest()},
    function () {return new ActiveXObject("Msxml2.XMLHTTP")},
    function () {return new ActiveXObject("Msxml3.XMLHTTP")},
    function () {return new ActiveXObject("Microsoft.XMLHTTP")}
];

ESP.data.wordlists = {};

ESP.main = function () {
    var LocalStorage;
    LocalStorage = ESP.supports_html5_storage();
    if ( !LocalStorage) {
        ESP.write_to_page("Esperanto Flashcards required local storage to work");
        return false;
    } else {
        ESP.bind("click", "answer",     ESP.click_answer);
        ESP.bind("click", "right",      ESP.click_score);
        ESP.bind("click", "ish",        ESP.click_score);
        ESP.bind("click", "wrong",      ESP.click_score);
        ESP.bind("click", "difficulty", ESP.select_difficulty);
        ESP.bind("click", "language",   ESP.select_language);
        // ESP.write_to_page(" ");
        ESP.maybe_load_wordlist();
    };
}

ESP.main();