let userName;
let bookmarks;
let weatherLocation;
let extensionBackground;

$(document).ready(function () {
    chrome.storage.sync.get({
        "userName": "Chrome user",
        "bookmarks": null,
        "weatherLocation": "Istanbul, TR",
        "extensionBackground": "dashboard_background.jpg"
    }, function (items) {
        userName = items.userName;
        bookmarks = JSON.parse(items.bookmarks);
        weatherLocation = items.weatherLocation;
        extensionBackground = items.extensionBackground;

        startLocalTime();
        organizeBookmarks();
        getWeatherFromApi();
        setBackgroundImage();
    });

    $(".search input").focus();

    $(this).bind("contextmenu", function (e) {
        e.preventDefault();
    });

    let isMenuOpened = false;

    $(document).on("click", ".menu a", function (e) {
        e.preventDefault();

        if (isMenuOpened) {
            $("ul").hide();

            isMenuOpened = false;
        }
        else {
            $("ul").show();

            isMenuOpened = true;
        }
    });

    $("section,footer,.weather").click(function (e) {
        if (isMenuOpened) {
            $("ul").hide();

            isMenuOpened = false;
        }
    });

    $(document).on('click', '#options', function (e) {
        e.preventDefault();

        chrome.tabs.create({ 'url': 'chrome-extension://' + chrome.runtime.id + '/pages/options.html' });
    });

    $("#search").submit(function (e) {
        e.preventDefault();

        const keyword = $.trim($("#q").val());

        if (keyword == "") {
            $("input").focus();
        }
        else {
            document.forms[0].submit();
        }
    });

    $(".todo-icon a").click(function (e) {
        e.preventDefault();

        if (window.Notification) {
            showNotification('Chrome dashboard', 'This feature is coming soon!');
        }
    });
});

chrome.storage.onChanged.addListener(function (changes) {
    for (key in changes) {
        let storageChange = changes[key];

        if (key == "userName") {
            userName = storageChange.newValue;

            startLocalTime();
        }

        if (key == "weatherLocation") {
            weatherLocation = storageChange.newValue;

            getWeatherFromApi();
        }

        if (key == "bookmarks") {
            bookmarks = JSON.parse(storageChange.newValue);

            organizeBookmarks();
        }

        if (key == "extensionBackground") {
            extensionBackground = storageChange.newValue;

            setBackgroundImage();
        }
    }
});

function showNotification(title, notificationDescription) {
    new Notification(title, {
        icon: '../icons/icon48.png',
        body: notificationDescription
    });
}

function setBackgroundImage() {
    $("body").css({
        "background-image": "url('../images/backgrounds/" + extensionBackground + "')"
    });
}

function getWeatherFromApi() {
    const getWeather = new Promise(function (resolve, reject) {
        $.simpleWeather({
            unit: 'c',
            woeid: '',
            location: weatherLocation,
            success: function (weather) {
                resolve(weather);
            },
            error: function (error) {
                reject(error);
            }
        });
    });

    getWeather.then(function (weather) {
        $("#weather").html('' + weatherLocation + ' <i class="icon-' + weather.code + '"></i> <strong>' + weather.temp + '&deg;' + weather.units.temp + '</strong>');
    }).catch(function (error) {
        $("#weather").html(error);
    });
}

function organizeBookmarks() {
    $("#bookmarks").empty();

    if (bookmarks == null || bookmarks.length == 0) {
        $(".menu").html("Bookmarks not found. Please <a href='#' id='options'>click here</a> to add your bookmarks.");
    }
    else {
        $(".menu").html('<a href="#"><i class="material-icons">menu</i></a>');

        const orderedBookmarks = bookmarks.sort(function (a, b) {
            return parseInt(a.order) - parseInt(b.order);
        });

        let bookmark;

        for (let i = 0; i < orderedBookmarks.length; i++) {
            bookmark = orderedBookmarks[i];

            $("#bookmarks").append('<li><a href="' + bookmark.url + '"><i class="material-icons">grade</i>' + bookmark.name + '</a></li>');
        }
    }
}

function startLocalTime() {
    const today = new Date();

    const h = today.getHours();

    let m = today.getMinutes();

    if (m < 10) {
        m = "0" + m
    };

    $("#time").text(h + ":" + m);

    const t = setTimeout(startLocalTime, 1000);

    let salutation = '';

    if (h < 4) {
        salutation = "Good night";
    }
    else if (h < 12) {
        salutation = "Good morning";
    }
    else if (h < 18) {
        salutation = "Good afternoon";
    }
    else {
        salutation = "Good evening";
    }

    $("#salute").text(salutation + ', ' + userName);
}