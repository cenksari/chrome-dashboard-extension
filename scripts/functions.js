/*
    * Chrome Dashboard Extension
    * Copyright © 2018 Cenk SARI
    * Website : http://www.cenksari.com
    * Github : https://github.com/cenksari
    *
    * Contact : cenk@cenksari.com
    * Licensed under MIT
*/
$(function () {
    $(this).bind("contextmenu", function (e) {
        e.preventDefault();
    });
});

function showNotification(title, notificationDescription) {
    new Notification(title, {
        icon: '../icons/icon48.png',
        body: notificationDescription
    });
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function isUrl(url) {
    const regex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/

    return regex.test(url);
}