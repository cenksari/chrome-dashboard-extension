/*
    * Chrome Dashboard Extension
    * Copyright (c) 2018 Cenk SARI
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

        organizeBookmarks();
        setOptionsFormFields();
        organizeBackgroundImages();
    });

    $('.add-button').click(function (e) {
        e.preventDefault();

        $('.add-bookmark').show();

        $('#add').text('Add bookmark');

        $('#bname').focus();
    });

    $('.add-bookmark a').click(function (e) {
        e.preventDefault();

        $('.add-bookmark').hide();

        $('#bname,#burl,#bid').val('');
    });

    $('#bookmark').submit(function (e) {
        e.preventDefault();

        const id = $.trim($('#bid').val());
        const url = $.trim($('#burl').val());
        const name = $.trim($('#bname').val());

        if (name === '') {
            $.alert({
                title: 'Error!',
                content: 'Please enter bookmark name.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        } else if (url === '') {
            $.alert({
                title: 'Error!',
                content: 'Please enter bookmark url.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        } else if (!isUrl(url)) {
            $.alert({
                title: 'Error!',
                content: 'Invalid url format.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        } else {
            if (bookmarks === null) {
                bookmarks = [];
            }

            if (id !== '') {
                $.each(bookmarks, function () {
                    if (this.id === id) {
                        this.name = name;
                        this.url = url;
                        return false;
                    }
                });
            } else {
                const bookmark = {
                    id: guid(),
                    name: name,
                    url: url,
                    order: $(bookmarks).length,
                };

                bookmarks.push(bookmark);
            }

            chrome.storage.sync.set({
                bookmarks: JSON.stringify(bookmarks),
            }, function () {
                $('.add-bookmark').hide();

                $('#bname,#burl,#bid').val('');

                showNotification('Chrome dashboard', 'Bookmark successfully saved.');
            });
        }
    });

    $(document).on('keyup', '#ulocation', function (e) {
        const keywordLength = 2;
        const keyword = $.trim($(this).val());
        const autocompleterField = $('.autocompleter');

        if (e.keyCode === 9 || e.keyCode === 13 || e.keyCode === 16 || e.keyCode === 17 || e.keyCode === 18 || e.keyCode === 20 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40) {
            return false;
        }

        if (keyword === '') {
            $(autocompleterField).hide().find('ul').empty();
        }

        if (keyword === '' || keyword.length < keywordLength) {
            $(autocompleterField).hide().find('ul').empty();
            return false;
        }

        $(autocompleterField).hide().find('ul').empty();

        if (e.key === "Escape") {
            $(this).val('');
            $('#woeid').val('');
            $('#location').val('');
            return false;
        }

        let template = '';

        $.getJSON(`https://api.allorigins.win/get?url=https://www.metaweather.com/api/location/search/?query=${keyword}`, function () {
        })
            .done(function (data) {
                $.each(data, function (k, o) {
                    template += `
                        <li>
                            <a data-woeid="${o.woeid}" href="">${o.title}</a>
                        </li>
                    `;
                });

                if (data.length <= 0) {
                    template = "<li><a>No results found for this search keyword.</a></li>";
                }
            })
            .fail(function () {
                template = '<li><a>An error occured getting results.</a></li>';
            })
            .always(function () {
                $(autocompleterField).show().find('ul').html(template);
            });
    });

    $(document).on('click', '.autocompleter ul li a', function (e) {
        e.preventDefault();

        const title = $(this).text();
        const woeid = $(this).attr('data-woeid');

        if (woeid === undefined || woeid === null || woeid === '') {
            $('#woeid').val('');
            $('#location').val('');
            $('#ulocation').val('');
        } else {
            $('#woeid').val(woeid);
            $('#location').val(title);
            $('#ulocation').val(title);
        }

        $('.autocompleter').hide().find('ul').empty();
    });

    $(document).on('click', '.delete', function () {
        const id = $(this).parents().eq(1).attr('data-id');

        $.confirm({
            title: 'Confirm!',
            content: 'Are you sure you want to delete this bookmark?',
            type: 'red',
            boxWidth: '400px',
            useBootstrap: false,
            typeAnimated: true,
            buttons: {
                delete: {
                    text: 'Yes, Delete',
                    btnClass: 'btn-red',
                    action: function () {
                        bookmarks = bookmarks.filter(bookmark => {
                            return bookmark.id != id;
                        });

                        $.each(bookmarks, function (index) {
                            this.order = index
                        });

                        chrome.storage.sync.set({
                            bookmarks: JSON.stringify(bookmarks),
                        });

                        $('.add-bookmark').hide();

                        $('#bname,#burl,#bid').val('');
                    }
                }
            },
        });
    });

    $(document).on('click', '.edit', function () {
        const id = $(this).parents().eq(1).attr('data-id');

        const selectedBookmark = findBookmark(id);

        $('.add-bookmark').show();

        $('#add').text('Edit bookmark');

        $('#bname').val(selectedBookmark.name);
        $('#burl').val(selectedBookmark.url);
        $('#bid').val(selectedBookmark.id);

        $('html,body').animate({
            scrollTop: $('.add-bookmark').offset().top - 20
        }, 500);
    });

    $('#options').submit(function (e) {
        e.preventDefault();

        const name = $.trim($('#uname').val());
        const woeid = $.trim($('#woeid').val());
        const title = $.trim($('#location').val());

        locationData = {
            woeid,
            title,
        };

        if (name === '') {
            $.alert({
                title: 'Error!',
                content: 'Please enter your name.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        } else if (woeid === '') {
            $.alert({
                title: 'Error!',
                content: 'Please enter your city for weather forecast data.',
                type: 'red',
                boxWidth: '400px',
                useBootstrap: false,
                typeAnimated: true,
            });
        } else {
            chrome.storage.sync.set({
                userName: name,
                locationData: JSON.stringify(locationData),
            }, function () {
                showNotification('Chrome dashboard', 'Options successfully saved.');
            });
        }
    });

    $(document).on('click', 'ol li a', function (e) {
        e.preventDefault();

        const selectedBackground = $(this).attr('data-image');

        chrome.storage.sync.set({
            extensionBackground: selectedBackground,
        });
    });

    $('tbody').sortable({
        axis: 'y',
        placeholder: 'sort-ph',
        update: function () {
            let id;

            $('tbody tr').each(function (index) {
                id = $(this).attr('data-id');

                setOrderPosition(id, index);
            });

            chrome.storage.sync.set({
                bookmarks: JSON.stringify(bookmarks),
            });
        },
        start: function (event, ui) {
            ui.item.find('.hide').hide();
        },
        stop: function (event, ui) {
            ui.item.find('.hide').show();
        }
    }).disableSelection();
});

chrome.storage.onChanged.addListener(changes => {
    let storageChange;

    for (let key in changes) {
        storageChange = changes[key];

        if (key === 'userName') {
            userName = storageChange.newValue;

            setOptionsFormFields();
        }

        if (key === 'locationData') {
            locationData = storageChange.newValue;

            setOptionsFormFields();
        }

        if (key === 'bookmarks') {
            bookmarks = JSON.parse(storageChange.newValue);

            organizeBookmarks();
        }

        if (key === 'extensionBackground') {
            extensionBackground = storageChange.newValue;

            organizeBackgroundImages();
        }
    }
});

organizeBackgroundImages = () => {
    $('ol').empty();

    const images = [
        'dashboard_background.jpg',
        'dashboard_background2.jpg',
        'dashboard_background3.jpg',
        'dashboard_background4.jpg',
        'dashboard_background5.jpg',
        'dashboard_background6.jpg',
        'dashboard_background7.jpg',
        'dashboard_background8.jpg',
        'dashboard_background9.jpg',
        'dashboard_background10.jpg',
        'dashboard_background11.jpg',
        'dashboard_background12.jpg',
    ];

    let template;

    $(images).each(function () {
        if (this == extensionBackground) {
            template = `
                <li>
                    <a href="#" data-image="${this}"><img src="../images/thumbnails/${this}" width="181" height="110" alt="" /><div><i class="material-icons">check_circle</i>Current background</div></a>
                </li>
            `;
        } else {
            template = `
                <li>
                    <a href="#" data-image="${this}"><img src="../images/thumbnails/${this}" width="181" height="110" alt="" /></a>
                </li>
            `;
        }

        $('ol').append(template);
    });
};

organizeBookmarks = () => {
    $('table tbody').empty();

    if (bookmarks === null || bookmarks.length === 0) {
        $('table').hide();
        $('.error-message').html('Bookmarks not found. Please add your bookmarks.').show();
    } else {
        $('table').show();
        $('.error-message').empty().hide();

        const orderedBookmarks = bookmarks.sort((a, b) => {
            return parseInt(a.order) - parseInt(b.order);
        });

        $.each(orderedBookmarks, function () {
            $('table tbody').append(`<tr data-id="${this.id}"><td><a><i class="material-icons">import_export</i></a> ${this.name}</td><td class="hide"><a href="${this.url}">${this.url}</a></td><td class="hide"><button type="button" class="edit">E</button><button type="button" class="delete">X</button></td></tr>`);
        });
    }
};

findBookmark = id => {
    let bookmark = {};

    $.each(bookmarks, function (index) {
        if (this.id === id) {
            bookmark = bookmarks[index];
            return false;
        }
    });

    return bookmark;
};

setOptionsFormFields = () => {
    $('#uname').val(userName);

    if (locationData !== undefined && locationData !== null) {
        $('#woeid').val(locationData.woeid);
        $('#ulocation,#location').val(locationData.title);
    }
};

setOrderPosition = (id, order) => {
    $.each(bookmarks, function () {
        if (this.id === id) {
            this.order = order;
            return false;
        }
    });
};