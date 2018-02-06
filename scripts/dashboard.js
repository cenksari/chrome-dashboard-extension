let userName
let weatherLocation;

chrome.storage.sync.get({
    userName: 'Chrome user',
    weatherLocation: 'Istanbul, TR'
}, function (items) {
    userName = items.userName;
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
    }
});

$(document).ready(function () {
    startLocalTime();

    getWeatherFromApi();

    getBookmarksFromFile();

    let isMenuOpened = false;

    $(".menu a").click(function (e) {
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
        $("#weather").html('' + weatherLocation + ' <i class="material-icons">cloud_queue</i> <strong>' + weather.temp + '&deg;' + weather.units.temp + '</strong>');
    }).catch(function (error) {
        $("#weather").html(error);
    });
}

function getBookmarksFromFile() {
    const getBookmarks = new Promise(function (resolve, reject) {
        $.ajax({
            url: chrome.extension.getURL('bookmarks.json'),
            dataType: 'json',
            success: function (bookmarks) {
                resolve(bookmarks);
            },
            error: function () {
                reject("Can't get bookmarks from settings. Please refresh this page.");
            }
        });
    });

    getBookmarks.then(function (bookmarks) {
        let countBookmarks = 0;

        $.each(bookmarks, function (i, bookmark) {
            countBookmarks++;

            $("#bookmarks").append('<li><a href="' + bookmark.link + '"><i class="material-icons">grade</i>' + bookmark.name + '</a></li>');
        });

        if (countBookmarks < 1) {
            $(".menu").html("Bookmarks not found. Please add your bookmarks via options page.");
        }
    }).catch(function (error) {
        $(".menu").html(error);
    });
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