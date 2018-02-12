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

$(document).ready(function () {
    $("#uname").val(userName);
    $("#ulocation").val(weatherLocation);

    organizeBookmarks();

    $(this).bind("contextmenu", function (e) {
        e.preventDefault();
    });

    $(".add-button").click(function (e) {
        e.preventDefault();

        $(".add-bookmark").show();
    });

    $(".add-bookmark a").click(function (e) {
        e.preventDefault();

        $(".add-bookmark").hide();
    });

    $("#bookmark").submit(function (e) {
        e.preventDefault();

        let url = $.trim($("#burl").val());
        let name = $.trim($("#bname").val());

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

            let bookmark = {
                "id": guid(),
                "name": name,
                "url": url,
                "order": 9999
            };

            bookmarks.push(bookmark);

            chrome.storage.sync.set({
                bookmarks: JSON.stringify(bookmarks)
            }, function () {
                organizeBookmarks();

                updated("Bookmark saved!");

                $("#bname,#burl").val("");
                $(".add-bookmark").hide();
            });
        }
    });

    $(document).on("click", ".delete", function (e) {
        let id = $(this).parents().eq(1).attr("data-id");

        $.confirm({
            title: 'Confirm!',
            content: 'Are you sure you want to delete item?',
            type: 'red',
            boxWidth: '400px',
            useBootstrap: false,
            typeAnimated: true,
            buttons: {
                delete: {
                    text: 'Yes, Delete',
                    btnClass: 'btn-red',
                    action: function () {
                        let newArray = bookmarks.filter(function (bookmark) {
                            return bookmark.id != id;
                        });

                        chrome.storage.sync.set({
                            bookmarks: JSON.stringify(newArray)
                        }, function () {
                            bookmarks = newArray;

                            setOrderPositions();

                            organizeBookmarks();

                            updated("Bookmark deleted!");
                        });
                    }
                },
                close: function () {
                }
            }
        });
    });

    $("#options").submit(function (e) {
        e.preventDefault();

        let name = $.trim($("#uname").val());
        let location = $("#ulocation").val();

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
                userName: name,
                weatherLocation: location
            }, function () {
                $.alert({
                    title: 'Success!',
                    content: 'Options successfully saved.',
                    type: 'blue',
                    boxWidth: '400px',
                    useBootstrap: false,
                    typeAnimated: true,
                    autoClose: 'okButton|9000',
                    buttons: {
                        okButton: {
                            text: "OK"
                        }
                    }
                });
            });
        }
    });

    $("tbody").sortable({
        axis: "y",
        placeholder: "sort-ph",
        update: function (event, ui) {
            setOrderPositions();

            chrome.storage.sync.set({
                bookmarks: JSON.stringify(bookmarks)
            }, function () {
                organizeBookmarks();

                updated("Bookmark saved!");
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

function organizeBookmarks() {
    $("table tbody").empty();

    if (bookmarks == null || bookmarks.length == 0) {
        $("table").hide();
        $(".error-message").html("Bookmarks not found. Please add your bookmarks.").show();
    }
    else {
        $("table").show();
        $(".error-message").empty().hide();

        let orderedBookmarks = bookmarks.sort(function (a, b) {
            return parseInt(a.order) - parseInt(b.order);
        });

        for (var i = 0; i < orderedBookmarks.length; i++) {
            let bookmark = orderedBookmarks[i];

            $("table tbody").append('<tr data-id="' + bookmark.id + '"><td><a><i class="material-icons">import_export</i></a> ' + bookmark.name + '</td><td class="hide"><a href="' + bookmark.url + '">' + bookmark.url + '</a></td><td class="hide"><button type="button" class="delete">X</button></td></tr>');
        }
    }
}

function setOrderPositions() {
    $("tbody tr").each(function (index) {
        let id = $(this).attr("data-id");

        setOrderPosition(id, index);
    });
}

function setOrderPosition(id, order) {
    $.each(bookmarks, function (key, value) {
        if (value.id == id) {
            value.order = order;
        }
    });
}

function isUrl(url) {
    var regex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/
    return regex.test(url);
}

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function updated(text) {
    $("#updated").html(text).show();

    setTimeout(function () {
        $("#updated").empty().hide();
    }, 1000);
}