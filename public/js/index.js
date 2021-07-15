$(document).ready(function () {

    const IMG_PATH = '/public/images/';

    const now = new Date().toISOString();
    const today = now.substr(0, 10);

    let currency1 = $('#currency1').val();
    let currency2 = $('#currency2').val();

    let startDate = $('#start-date').val();
    let endDate = $('end-date').val();


    showCurrencyTable();

    $('#start-date, #end-date').attr({
        'max': today,
        'min': '2006-01-01'
    });

    $('#swap-button').click(function () {

        $('#currency1').val(currency2);
        $('#currency2').val(currency1);

        currency1 = $('#currency1').val();
        currency2 = $('#currency2').val();

        showCurrencyTable();
    });

    $('#currency1, #currency2').change(function () {

        currency1 = $('#currency1').val();
        currency2 = $('#currency2').val();

        showCurrencyTable();
    });

    $('#period-button').click(function () {

        startDate = $('#start-date').val();
        endDate = $('#end-date').val();

        showQuotationPeriod();
    });

    //Exibe a tabela da moeda
    function showCurrencyTable() {

        let selectedCoins = `${currency1}${currency2}`;

        if (verifyCoins(currency1, currency2)) {

            $('#last-output').html(`<img id="loading" src="${IMG_PATH}waiting.png">`);
            $.get(`https://economia.awesomeapi.com.br/last/${currency1}-${currency2}`, function (data) {
                
               
                    $('#last-output').html(`
                    <table>
                        <caption>Last Quotation</caption>
                        <tr>
                            <th>Quotation</th>
                            <td>${currency2} ${data[selectedCoins].bid}</td>
                        </tr>

                        <tr>
                            <th>High</th>
                            <td>${currency2} ${data[selectedCoins].high}</td>
                        </tr>

                        <tr>
                            <th>Low</th>
                            <td>${currency2} ${data[selectedCoins].low}</td>
                        </tr>

                        <tr>
                            <th>Date and Hour</th>
                            <td>${data[selectedCoins].create_date}</td>
                        </tr>
                    </table>`)
                    
            });

        } else {

            $('#last-output').html(`<span class="error-msg">Please, select differents currency</span>`);

        }
    }

    //Valida as moedas
    function verifyCoins(currency1, currency2) {

        let valid = true;

        if (currency1 == currency2) {
            valid = false;
        }

        return valid;
    }

    //Exibe a lista dos fechamentos da moeda dentro de um determinado período
    function showQuotationPeriod() {

        const numberOfDays = ((Date.parse(endDate) - Date.parse(startDate)) / (1000 * 3600 * 24)) + 1;
        const formatedStartDate = formatDate(startDate);
        const formatedEndDate = formatDate(endDate);

        let dateCounter = Date.parse(startDate)

        $('#period-output').show();
        $('main').hide();

        emptyOutput();

        if (verifyDate(formatedStartDate, formatedEndDate) && verifyCoins(currency1, currency2)) {

            $('#period-output').append(`
                <table id="period-table">
                    <caption style="background: rgb(66, 67, 68);">Quotation ${currency1} in ${currency2}</caption>
                    <tr style="background-color: rgb(47, 47, 48);">
                        <th>Quotation</th>
                        <td>Date</tr>
                    </tr>        
                </table>`);

            for (let i = 1; i <= numberOfDays; i++) {

                let currentEndDate = new Date(dateCounter).toISOString().substr(0, 10);
                currentEndDate = formatDate(currentEndDate);

                $.get(`https://economia.awesomeapi.com.br/json/daily/${currency1}-${currency2}/?start_date=${formatedStartDate}&end_date=${currentEndDate}`, function (data) {

                $('#period-table').append(`
                    <tr>
                        <th>${currency2} ${data[0].bid}</th>
                        <td>${currentEndDate.substr(6,2)}-${currentEndDate.substr(4,2)}-${currentEndDate.substr(0,4)}</td>
                    </tr>`);
                });
                dateCounter += 1000 * 3600 * 24;
            }

        } else {
            $('#period-output').append('<span>Invalid data input</span>');
        }

        $('#period-output').append(`<button id="return-button">Return</button>`);

        $('#return-button').click(function () {

            $('#period-output').hide();
            $('main').show();
        });
    }

    //Formata a data para a API
    function formatDate(date) {
        let dateFormated = date.replaceAll('-', '')
        return dateFormated;
    }

    //Valida as datas
    function verifyDate(startDate, endDate) {

        const formatedToday = formatDate(today);

        let valid = true;

        if (startDate == '' || endDate == '') {
            valid = false;
        } else if (startDate > formatedToday || endDate > formatedToday) {
            valid = false;
        } else if (startDate > endDate) {
            valid = false
        }

        return valid;
    }

    //Apaga a saída de dados
    function emptyOutput() {
        if ($('#period-output').html() != '') {
            $('#period-output').empty();
        }
    }
});