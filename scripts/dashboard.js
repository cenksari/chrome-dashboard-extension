let userName;
let bookmarks;
let weatherLocation;

chrome.storage.sync.get({
    userName: 'Chrome user',
    bookmarks: null,
    weatherLocation: 'Istanbul, TR'
}, function (items) {
    userName = items.userName;
    bookmarks = JSON.parse(items.bookmarks);
    weatherLocation = items.weatherLocation;
});

chrome.storage.onChanged.addListener(function (changes) {
    for (key in changes) {
        var storageChange = changes[key];

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

            getBookmarksFromSettings();
        }
    }
});

$(document).ready(function () {
    startLocalTime();

    getWeatherFromApi();

    getBookmarksFromSettings();

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
});

function getWeatherFromApi() {
    const getWeather = new Promise(function (resolve, reject) {
        $.simpleWeather({
            location: weatherLocation,
            woeid: '',
            unit: 'c',
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

function getBookmarksFromSettings() {
    $("#bookmarks").empty();

    if (bookmarks.length == 0) {
        $(".menu").html("Bookmarks not found. Please add your bookmarks to options page.");
    }
    else {
        $(".menu").html('<a href="#"><i class="material-icons">menu</i></a>');

        $.each(bookmarks, function (i, bookmark) {
            $("#bookmarks").append('<li><a href="' + bookmark.url + '"><i class="material-icons">grade</i>' + bookmark.name + '</a></li>');
        });
    }
}

function startLocalTime() {
    let today = new Date();

    let h = today.getHours();
    let m = today.getMinutes();

    m = checkTime(m);

    $("#time").text(h + ":" + m);

    let t = setTimeout(startLocalTime, 500);

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

function checkTime(i) {
    if (i < 10) {
        i = "0" + i
    };

    return i;
}