/*
    * Chrome Dashboard Extension
    * Copyright (c) 2021 Cenk SARI
    * Website : http://www.cenksari.com
    * Github : https://github.com/cenksari
    * Project : https://github.com/cenksari/chrome-dashboard-extension
    *
    * Contact : cenk@cenksari.com
    * Licensed under MIT
*/
let userName;
let bookmarks;
let locationData;
let extensionBackground;

$(function () {
    chrome.storage.sync.get({
        userName: 'Chrome user',
        bookmarks: null,
        locationData: null,
        extensionBackground: 'dashboard_background.jpg',
    }, function (items) {
        userName = items.userName;
        bookmarks = JSON.parse(items.bookmarks);
        locationData = JSON.parse(items.locationData);
        extensionBackground = items.extensionBackground;

        startLocalTime();
        organizeBookmarks();
        getWeatherFromApi();
        setBackgroundImage();
    });

    $('.search input').focus();

    let isMenuOpened = false;

    $(document).on('click', '.menu a', function (e) {
        e.preventDefault();

        if (isMenuOpened) {
            $('ul').hide();

            isMenuOpened = false;
        } else {
            $('ul').show();

            isMenuOpened = true;
        }
    });

    $('section,footer,.weather').click(function () {
        if (isMenuOpened) {
            $('ul').hide();

            isMenuOpened = false;
        }
    });

    $(document).on('click', '#options', function (e) {
        e.preventDefault();

        chrome.tabs.create({
            'url': `chrome-extension://${chrome.runtime.id}/pages/options.html`,
        });
    });

    $('#search').submit(function (e) {
        e.preventDefault();

        const keyword = $.trim($('#q').val());

        if (keyword === '') {
            $('input').focus();
        } else {
            document.forms[0].submit();
        }
    });
});

chrome.storage.onChanged.addListener(changes => {
    let storageChange;

    for (let key in changes) {
        storageChange = changes[key];

        if (key === 'userName') {
            userName = storageChange.newValue;

            startLocalTime();
        }

        if (key === 'locationData') {
            locationData = storageChange.newValue;

            getWeatherFromApi();
        }

        if (key === 'bookmarks') {
            bookmarks = JSON.parse(storageChange.newValue);

            organizeBookmarks();
        }

        if (key === 'extensionBackground') {
            extensionBackground = storageChange.newValue;

            setBackgroundImage();
        }
    }
});

setBackgroundImage = () => {
    $('body').css({
        'background-image': `url('../images/backgrounds/${extensionBackground}')`,
    });
};

organizeBookmarks = () => {
    $('#bookmarks').empty();

    if (bookmarks === null || bookmarks.length === 0) {
        $('.menu').html('Bookmarks not found. Please <a href="#" id="options">click here</a> to add your bookmarks.');
    } else {
        $('.menu').html('<a href="#"><i class="material-icons">menu</i></a>');

        const orderedBookmarks = bookmarks.sort((a, b) => {
            return parseInt(a.order) - parseInt(b.order);
        });

        $.each(orderedBookmarks, function () {
            $('#bookmarks').append(`<li><a href="${this.url}"><i class="material-icons">grade</i>${this.name}</a></li>`);
        });
    }
};

startLocalTime = () => {
    const today = new Date();

    const h = today.getHours();

    let m = today.getMinutes();

    let s = today.getSeconds();

    if (m < 10) {
        m = '0' + m
    }

    if (s < 10) {
        s = '0' + s
    }

    $('#time').html(`<time><hours>${h}:${m}</hours></time>`);

    setTimeout(startLocalTime, 1000);

    let salutation = '';

    if (h < 4) {
        salutation = 'Good night';
    } else if (h < 12) {
        salutation = 'Good morning';
    } else if (h < 18) {
        salutation = 'Good afternoon';
    } else {
        salutation = 'Good evening';
    }

    $('#salute').text(`${salutation}, ${userName}`);
}