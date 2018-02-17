/*
    * Chrome Dashboard Extension
    * Copyright © 2018 Cenk SARI
    * Website : http://www.cenksari.com
    * Github : https://github.com/cenksari
    *
    * Contact : cenk@cenksari.com
    * Licensed under MIT
*/
let userName;
let bookmarks;
let weatherLocation;
let extensionBackground;

$(function () {
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

        fillFormFields();
        organizeBookmarks();
        setOptionsFormFields();
        organizeBackgroundImages();
    });

    $(".add-button").click(function (e) {
        e.preventDefault();

        $(".add-bookmark").show();

        $("#add").text("Add bookmark");

        $("#bname").focus();
    });

    $(".add-bookmark a").click(function (e) {
        e.preventDefault();

        $(".add-bookmark").hide();

        $("#bname,#burl,#bid").val("");
    });

    $("#bookmark").submit(function (e) {
        e.preventDefault();

        const id = $.trim($("#bid").val());
        const url = $.trim($("#burl").val());
        const name = $.trim($("#bname").val());

        if (name == "") {
            $.alert({
                title: 'Error!',
                content: 'Please enter bookmark name.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        }
        else if (url == "") {
            $.alert({
                title: 'Error!',
                content: 'Please enter bookmark url.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        }
        else if (!isUrl(url)) {
            $.alert({
                title: 'Error!',
                content: 'Invalid url format. Please correct.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        }
        else {
            if (bookmarks == null) {
                bookmarks = [];
            }

            if (id != "") {
                $.each(bookmarks, function () {
                    if (this.id == id) {
                        this.name = name;
                        this.url = url;
                        return false;
                    }
                });
            }
            else {
                const bookmark = {
                    "id": guid(),
                    "name": name,
                    "url": url,
                    "order": $(bookmarks).length
                };

                bookmarks.push(bookmark);
            }

            chrome.storage.sync.set({
                "bookmarks": JSON.stringify(bookmarks)
            }, function () {
                showNotification("Chrome dashboard", "Bookmark successfully saved.");

                $(".add-bookmark").hide();

                $("#bname,#burl,#bid").val("");
            });
        }
    });

    $(document).on("click", ".delete", function (e) {
        const id = $(this).parents().eq(1).attr("data-id");

        $.confirm({
            title: 'Confirm!',
            content: 'Are you sure you want to delete bookmark?',
            type: 'red',
            boxWidth: '400px',
            useBootstrap: false,
            typeAnimated: true,
            buttons: {
                delete: {
                    text: 'Yes, Delete',
                    btnClass: 'btn-red',
                    action: function () {
                        bookmarks = bookmarks.filter(function (bookmark) {
                            return bookmark.id != id;
                        });

                        $.each(bookmarks, function (index) {
                            this.order = index
                        });

                        chrome.storage.sync.set({
                            "bookmarks": JSON.stringify(bookmarks)
                        });
                    }
                },
                close: function () {
                }
            }
        });
    });

    $(document).on("click", ".edit", function (e) {
        const id = $(this).parents().eq(1).attr("data-id");

        const selectedBookmark = findBookmark(id);

        $(".add-bookmark").show();

        $("#add").text("Edit bookmark");

        $("#bname").val(selectedBookmark.name);
        $("#burl").val(selectedBookmark.url);
        $("#bid").val(selectedBookmark.id);

        $("html,body").animate({
            scrollTop: $(".add-bookmark").offset().top - 20
        }, 500);
    });

    $("#options").submit(function (e) {
        e.preventDefault();

        const name = $.trim($("#uname").val());
        const location = $("#ulocation").val();

        if (name == "") {
            $.alert({
                title: 'Error!',
                content: 'Please enter your name.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        }
        else {
            chrome.storage.sync.set({
                "userName": name,
                "weatherLocation": location
            }, function () {
                showNotification("Chrome dashboard", "Options successfully saved.");
            });
        }
    });

    $(document).on("click", "ol li a", function (e) {
        e.preventDefault();

        const selectedBackground = $(this).attr("data-image");

        chrome.storage.sync.set({
            "extensionBackground": selectedBackground
        });
    });

    $("tbody").sortable({
        axis: "y",
        placeholder: "sort-ph",
        update: function (event, ui) {
            let id;

            $("tbody tr").each(function (index) {
                id = $(this).attr("data-id");

                setOrderPosition(id, index);
            });

            chrome.storage.sync.set({
                "bookmarks": JSON.stringify(bookmarks)
            });
        },
        start: function (event, ui) {
            ui.item.find(".hide").hide();
        },
        stop: function (event, ui) {
            ui.item.find(".hide").show();
        }
    }).disableSelection();
});

chrome.storage.onChanged.addListener(function (changes) {
    let storageChange;

    for (let key in changes) {
        storageChange = changes[key];

        if (key == "userName") {
            userName = storageChange.newValue;

            setOptionsFormFields();
        }

        if (key == "weatherLocation") {
            weatherLocation = storageChange.newValue;

            setOptionsFormFields();
        }

        if (key == "bookmarks") {
            bookmarks = JSON.parse(storageChange.newValue);

            organizeBookmarks();
        }

        if (key == "extensionBackground") {
            extensionBackground = storageChange.newValue;

            organizeBackgroundImages();
        }
    }
});

function fillFormFields() {
    const locations = [
        "Istanbul, TR",
        "Ankara, TR",
        "Izmir, TR",
        "London, UK"
    ]

    $(locations).each(function () {
        $("#ulocation").append('<option value="' + this + '">' + this + '</option>');
    });
}

function organizeBackgroundImages() {
    $("ol").empty();

    const images = [
        "dashboard_background.jpg",
        "dashboard_background2.jpg",
        "dashboard_background3.jpg",
        "dashboard_background4.jpg",
        "dashboard_background5.jpg",
        "dashboard_background6.jpg",
        "dashboard_background7.jpg",
        "dashboard_background8.jpg",
        "dashboard_background9.jpg",
        "dashboard_background10.jpg",
        "dashboard_background11.jpg",
        "dashboard_background12.jpg"
    ]

    let template;

    $(images).each(function () {
        if (this == extensionBackground) {
            template = '<li><a href="#" data-image="' + this + '"><img src="../images/thumbnails/' + this + '" width="184" height="110" alt="" /><div><i class="material-icons">check_circle</i>Current background</div></a></li>';
        }
        else {
            template = '<li><a href="#" data-image="' + this + '"><img src="../images/thumbnails/' + this + '" width="184" height="110" alt="" /></a></li>';
        }

        $("ol").append(template);
    });
}

function organizeBookmarks() {
    $("table tbody").empty();

    if (bookmarks == null || bookmarks.length == 0) {
        $("table").hide();
        $(".error-message").html("Bookmarks not found. Please add your bookmarks.").show();
    }
    else {
        $("table").show();
        $(".error-message").empty().hide();

        const orderedBookmarks = bookmarks.sort(function (a, b) {
            return parseInt(a.order) - parseInt(b.order);
        });

        $.each(orderedBookmarks, function () {
            $("table tbody").append('<tr data-id="' + this.id + '"><td><a><i class="material-icons">import_export</i></a> ' + this.name + '</td><td class="hide"><a href="' + this.url + '">' + this.url + '</a></td><td class="hide"><button type="button" class="edit">E</button><button type="button" class="delete">X</button></td></tr>');
        });
    }
}

function findBookmark(id) {
    let bookmark = {};

    $.each(bookmarks, function (index) {
        if (this.id == id) {
            bookmark = bookmarks[index];
            return false;
        }
    });

    return bookmark;
}

function setOptionsFormFields() {
    $("#uname").val(userName);
    $("#ulocation").val(weatherLocation);
}

function setOrderPosition(id, order) {
    $.each(bookmarks, function () {
        if (this.id == id) {
            this.order = order;
            return false;
        }
    });
}