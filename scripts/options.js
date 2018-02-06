$(document).ready(function () {
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

            $("table").append('<tr><td>' + bookmark.name + '</td><td><a href="' + bookmark.link + '">' + bookmark.link + '</a></td><td><button type="button" class="delete"><i class="material-icons">delete</i></button></td></tr>');
        });

        if (countBookmarks < 1) {
            $("#error-message").html("Bookmarks not found. Please add your bookmarks.");
        }
    }).catch(function (error) {
        $("#error-message").html(error);
    });

    
});