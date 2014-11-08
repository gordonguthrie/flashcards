var ESP = {};

ESP.supports_html5_storage = function () {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
};

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
    console.log("writing " + string + " to page");
    console.log(document.getElementById("content"));
    document.getElementById("content").innerHTML = string;
};

ESP.bind = function (event, id, fun) {
    console.log("in bind id is " + id);
    var elem = document.getElementById(id).addEventListener(event, fun);
};

ESP.main = function () {
    var hasLocalStorage;
    hasLocalStorage = ESP.supports_html5_storage();
    if ( !hasLocalStorage) {
        ESP.write_to_page("Esperanto Flashcards required local storage to work");
        return false;
    } else {
        ESP.bind("click", "answer",     ESP.click_answer);
        ESP.bind("click", "right",      ESP.click_score);
        ESP.bind("click", "ish",        ESP.click_score);
        ESP.bind("click", "wrong",      ESP.click_score);
        ESP.bind("click", "difficulty", ESP.select_difficulty);
        ESP.bind("click", "language",   ESP.select_language);
        ESP.write_to_page("Yay");
    };
}

ESP.main();