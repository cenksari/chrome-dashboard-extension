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
getWeatherFromApi = () => {
    if (locationData !== undefined && locationData !== null) {
        $('#weather').html(locationData.title);

        const d = new Date();

        date = [
            d.getFullYear(),
            ('0' + (d.getMonth() + 1)).slice(-2),
            ('0' + d.getDate()).slice(-2)
        ].join('/');

        $.getJSON(`https://api.allorigins.win/get?url=https://www.metaweather.com/api/location/${locationData.woeid}/${date}/`, function () {
        })
            .done(function (data) {
                const contents = JSON.parse(data.contents);

                $.each(contents, function (k, o) {
                    const template = `${locationData.title} - ${o.weather_state_name} - ${Math.round(o.the_temp)}&deg;<img src="https://www.metaweather.com/static/img/weather/${o.weather_state_abbr}.svg" alt="" />`;

                    $('#weather').html(template);

                    return false;
                });
            })
            .fail(function () {
                console.log('An error occured getting weather results.');
            });
    }
};