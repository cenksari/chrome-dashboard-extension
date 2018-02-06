chrome.storage.sync.get({
    userName: 'Chrome user',
    weatherLocation: 'Istanbul, TR'
}, function (items) {
    $("#name").val(items.userName);
    $("#location").val(items.weatherLocation);
});

$(document).ready(function () {
    getBookmarksFromFile();

    $(document).on("click", ".delete", function (e) {
        let link = $(this).attr("data-id");

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

                    }
                },
                close: function () {
                }
            }
        });
    });

    $("#options").submit(function (e) {
        e.preventDefault();

        let name = $.trim($("#name").val());
        let location = $("#location").val();

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
});

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

            $("table").append('<tr><td>' + bookmark.name + '</td><td><a href="' + bookmark.link + '">' + bookmark.link + '</a></td><td><button type="button" class="delete" data-id="' + bookmark.link + '"><i class="material-icons">delete</i></button></td></tr>');
        });

        if (countBookmarks < 1) {
            $("#error-message").html("Bookmarks not found. Please add your bookmarks.");
        }
    }).catch(function (error) {
        $("#error-message").html(error);
    });
}