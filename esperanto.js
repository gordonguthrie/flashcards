var ESP = {};

ESP.settings_module = function () {

    var api, elem1, elem1, language, difficulty;

    // api

    get_language_fn = function () {
        return language;
    };

    get_difficulty_fn = function () {
        return difficulty;
    };

    reset_fn = function () {
        elem1 = document.getElementById("language");
        elem2 = document.getElementById("difficulty");
        language = elem1.options[elem1.selectedIndex].value;
        difficulty = elem2.options[elem2.selectedIndex].value;
    };

    api = {
        "get_language_fn":   get_language_fn,
        "get_difficulty_fn": get_difficulty_fn,
        "reset_fn":          reset_fn
    };

    // now call reset on itself for init
    reset_fn();

    return api;
};

ESP.words_module = function () {
    var api, words, test, difficulty, language;
    var load_words_fn, make_test_fn;
    var get_next_fn, get_anser_fn, get_no_left_fn;

    // internal fns

    load_words_fn = function (difficulty) {
        var string = localStorage.getItem(difficulty);
        return JSON.parse(string);
    };

    make_test_fn = function (words, language) {
        var array, currentIndex, tempVal, randomIndex;
        array = words;
        currentIndex = array.length;
        while (0 !== currentIndex) {
            // decrement the index 'cos the length is max index +1
            currentIndex = currentIndex - 1;
            console.log(currentIndex);
            randomIndex = Math.floor(Math.random() * currentIndex);

            tempVal = array[currentIndex];
            console.log(tempVal);
            console.log(randomIndex);
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = tempVal;
        };
        return array;
    };

    // API
    get_next_fn = function () {
        return "yurp";
    };

    get_answer_fn = function () {
        return "smurg";
    };

    get_no_left_fn = function () {
        return 2;
    };

    difficulty = ESP.settings.get_difficulty_fn();
    language = ESP.settings.get_language_fn();
    words = load_words_fn(difficulty);
    console.log(words);
    test = make_test_fn(words, language);
    console.log(test);

    api = {
        "get_next_fn":    get_next_fn,
        "get_answer_fn":  get_answer_fn,
        "get_no_left_fn": get_no_left_fn
    };
    return api;
};

ESP.scores_module = function () {
    var api, difficulty, language, number;
    var load_scores_fn, write_scores_fn, render_scores_fn;
    var update_scores_fn, running_scores, current_score;

    // Define some internal funs

    load_scores_fn = function () {
        scores = localStorage.getItem("scores");
    };

    write_scores_fn = function() {
        localStorage.setItem("scores", JSON.stringify(running_scores));
    };

    // Define the API funs

    render_scores_fn = function () {
        return "bleh";
    };

    update_scores_fn = function (score) {
        console.log("in update scores...");
        console.log(score);
    };

    // Initialise the thing

    score = load_scores_fn();
    if (!score) {
        score = {};
    };

    api = {
        "render_scores_fn": render_scores_fn,
        "update_scores_fn": update_scores_fn
    };

    return api;
};

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
    // req.setRequestHeader('User-Agent','XMLHTTP/1.0');
    if (postData) {
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
    };
    req.onreadystatechange = function () {
        if (req.readyState != 4) return;
        if (req.status != 200 && req.status != 304) {
            alert('HTTP error ' + req.status);
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
};

ESP.select_language = function (event) {
    ESP.settings.reset_fn();
    ESP.draw_page("changed");
};

ESP.select_difficulty = function (event) {
    ESP.settings.reset_fn();
    ESP.draw_page("changed");
};

ESP.click_answer = function () {
    ESP.write_to_page(ESP.words.get_answer_fn());
    document.getElementById("score_buttons").style.display = "block";
    document.getElementById("ready_button").style.display = "none";
};

ESP.click_score = function (event) {
    document.getElementById("ready_button").style.display = "block";
    document.getElementById("score_buttons").style.display = "none";
    ESP.write_to_page(ESP.words.get_next_fn());
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
    var currentversion, storedversion, url, callback, key, string;
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
                string = JSON.stringify(ESP.data.wordlists[key]);
                localStorage.setItem(key, string);
            };
            // capture the version number and store that
            localStorage.setItem("version", currentversion);
        };
        return ESP.sendRequest(url, callback, false);
    };
};

ESP.draw_page = function (type) {
    document.getElementById("ready_button").style.display = "block";
    document.getElementById("score_buttons").style.display = "none";
    ESP.write_to_page(ESP.words.get_next_fn());
    ESP.scores.render_scores_fn();
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

// main function

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
        ESP.maybe_load_wordlist();
        ESP.scores = ESP.scores_module();
        ESP.settings = ESP.settings_module();
        ESP.words = ESP.words_module();
        ESP.draw_page("intial load");
    };
}

ESP.main();