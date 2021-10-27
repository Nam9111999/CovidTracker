const COLORS = {
    confirmed: "#ff0000",
    recovered: "#008000",
    deaths: "#373c43",
};

const CASE_STATUS = {
    confirmed: "confirmed",
    recovered: "recovered",
    deaths: "deaths",
};

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const body = $("body");
const confirmTotal = $("#confirm-total");
const confirmRecover = $("#confirm-recover");
const confirmDeath = $("#confirm-death");
const tableCountries = $("#table-countries");
const allTimeChart = $("#all-times-chart");
const daysChart = $("#days-chart");


window.onload = async () => {
    initTheme();
    await showAllTimesChart();
    await loadSummary("Global");
   
};

isGlobal = (country) => {
    return country === "Global";
};

startLoading = () => {
    body.classList.add("loading");
};

endLoading = () => {
    body.classList.remove("loading");
};

loadSummary = async (country) => {
    startLoading();
    const summaryData = await covidAPI.getSummary();
    const countryData = summaryData.Countries.sort((a, b) => b.TotalConfirmed - a.TotalConfirmed);
    tableCountries.innerHTML = "";
    
    countryData.forEach((data) => {
     
        const row = document.createElement('tr')
        
        row.onclick = async()=>{
            startLoading()
            await loadCountryInfo(data.CountryCode)
            await loadAllTimeChart(data.Slug)
            confirmTotal.textContent = numberWithCommas(data.TotalConfirmed)
            confirmRecover.textContent = numberWithCommas(data.TotalRecovered)
            confirmDeath.textContent =numberWithCommas(data.TotalDeaths)
            $('.content').classList.add('hide');
            $('.modal').classList.remove('hide');
            $('.modal').classList.add('active');
            setTimeout(endLoading,2000)
        }
        let cell = row.insertCell(-1);
        cell.textContent = data.Country
        cell = row.insertCell(-1);
        cell.textContent = numberWithCommas(data.TotalConfirmed)
        cell = row.insertCell(-1);
        cell.textContent = numberWithCommas(data.TotalRecovered)
        cell = row.insertCell(-1);
        cell.textContent = numberWithCommas(data.TotalDeaths)
        
        
        tableCountries.appendChild(row)
    })
    const box = pagination({
        table: $('#dataTable table'),
        box_mode: "list",
    });
    box.className = "boxPagination";
    document.getElementById("table_box_bootstrap").innerHTML = ''
    document.getElementById("table_box_bootstrap").appendChild(box);



    await loadAllTimeChart(country);

    endLoading();
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

showData = async (data, country) => {
    let countryData = [];
    if (isGlobal(country)) {
        confirmTotal.textContent = numberWithCommas(data.Global.TotalConfirmed);
        confirmRecover.textContent = numberWithCommas(data.Global.TotalRecovered);
        confirmDeath.textContent = numberWithCommas(data.Global.TotalDeaths);
    } else {
        countryData = await covidAPI.countryTodayCase(country);
        confirmTotal.textContent = numberWithCommas(countryData[0].Confirmed);
        confirmRecover.textContent = numberWithCommas(countryData[0].Recovered);
        confirmDeath.textContent = numberWithCommas(countryData[0].Deaths);
    }
};

showAllTimesChart = async () => {
    const options = {
        chart: {
            type: "line",
            zoom: {
                enabled: false,
            },
        },
        grid: {
            row: {
                colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                opacity: 0.5,
            },
        },

        colors: [COLORS.confirmed, COLORS.recovered, COLORS.deaths],
        series: [],
        xaxis: {
            categories: [],
            labels: {
                show: false,
            },
        },

        stoke: {
            curve: "smooth",
        },
    };

    allTime = new ApexCharts(allTimeChart, options);
    allTime.render();
};

renderData = (countryData) => {
    let res = [];
    countryData.forEach((e) => res.push(e.Cases));
    return res;
};

renderWorldData = (worldData, status) => {
    let res = [];
    worldData.forEach((e) => {
        switch (status) {
            case CASE_STATUS.confirmed:
                res.push(e.TotalConfirmed);
                break;
            case CASE_STATUS.recovered:
                res.push(e.TotalRecovered);
                break;
            case CASE_STATUS.deaths:
                res.push(e.TotalDeaths);
                break;
        }
    });
    return res;
};

loadAllTimeChart = async (country) => {
    let labels = [];
    let confirmedData, recoveredData, deathsData;
    if (isGlobal(country)) {
        let worldData = await covidAPI.worldAllTime();
        worldData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
        worldData.forEach((e) => {
            const date = new Date(e.Date);
            labels.push(`${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`);
        });
        confirmedData = renderWorldData(worldData, CASE_STATUS.confirmed);
        recoveredData = renderWorldData(worldData, CASE_STATUS.recovered);
        deathsData = renderWorldData(worldData, CASE_STATUS.deaths);
    } else {
        let confirmed = await covidAPI.countryALlTime(country, CASE_STATUS.confirmed);
        let recovered = await covidAPI.countryALlTime(country, CASE_STATUS.recovered);
        let deaths = await covidAPI.countryALlTime(country, CASE_STATUS.deaths);

        confirmedData = renderData(confirmed);
        recoveredData = renderData(recovered);
        deathsData = renderData(deaths);
        confirmed.forEach((e) => {
            const date = new Date(e.Date);
            labels.push(`${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`);
        });
    }
    let series = [
        {
            name: "Confirmed",
            data: confirmedData,
        },
        {
            name: "Recovered",
            data: recoveredData,
        },
        {
            name: "Deaths",
            data: deathsData,
        },
    ];

    allTime.updateOptions({
        series: series,
        xaxis: {
            categories: labels,
        },
    });
};

showDayChart = async () => {
    const options = {
        chart: {
            type: "line",
            zoom: {
                enabled: false,
            },
        },
        grid: {
            row: {
                colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                opacity: 0.5,
            },
        },

        colors: [COLORS.confirmed, COLORS.recovered, COLORS.deaths],
        series: [],
        xaxis: {
            categories: [],
            labels: {
                show: false,
            },
        },

        stoke: {
            curve: "smooth",
        },
    };

    dayChart = new ApexCharts(daysChart, options);
    dayChart.render();
};

loadDayChart = async (country) => {
    let labels = [];
    let confirmedData, recoveredData, deathsData;
    if (isGlobal(country)) {
        let worldData = await covidAPI.worldDaysCase();
        worldData.sort((a, b) => new Date(a.Date) - new Date(b.Date));
        worldData.forEach((e) => {
            const date = new Date(e.Date);
            labels.push(`${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`);
        });
        confirmedData = renderWorldData(worldData, CASE_STATUS.confirmed);
        recoveredData = renderWorldData(worldData, CASE_STATUS.recovered);
        deathsData = renderWorldData(worldData, CASE_STATUS.deaths);
    } else {
        let confirmed = await covidAPI.countryDaysCase(country, CASE_STATUS.confirmed);
        let recovered = await covidAPI.countryDaysCase(country, CASE_STATUS.recovered);
        let deaths = await covidAPI.countryDaysCase(country, CASE_STATUS.deaths);

        confirmedData = renderData(confirmed);
        recoveredData = renderData(recovered);
        deathsData = renderData(deaths);

        confirmed.forEach((e) => {
            const date = new Date(e.Date);
            
            labels.push(`${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`);
        });
    }
    let series = [
        {
            name: "Confirmed",
            data: confirmedData,
        },
        {
            name: "Recovered",
            data: recoveredData,
        },
        {
            name: "Deaths",
            data: deathsData,
        },
    ];
    dayChart.updateOptions({
        series: series,
        xaxis: {
            categories: labels,
        },
    });
};

initTheme = () => {
    const darkModeSwitch = $("#darkModeBtn");
    darkModeSwitch.onclick = () => {
        darkModeSwitch.classList.toggle("dark");
        body.classList.toggle("dark");
        setDarkChart(body.classList.contains("dark"));
    };
};

setDarkChart = (dark) => {
    const theme = {
        theme: {
            mode: dark ? "dark" : "light",
        },
        grid: {
            row: {
                colors: ["transparent", "transparent"], // takes an array which will be repeated on columns
                opacity: 0.5,
            },
        },
    };
    allTime.updateOptions(theme);
    dayChart.updateOptions(theme);
};

renderCountrySelectList = (list) => {
    const countrySelectList = $("#country-select__list");
    countrySelectList.querySelectorAll("div").forEach((e) => e.remove());
    list.forEach((e) => {
        const item = document.createElement("div");
        item.classList.add("country-item");
        item.textContent = e.Country;
        item.onclick = async () => {
            $("#country-select span").textContent = e.Country;
            countrySelectList.classList.toggle("active");
            await loadSummary(e.Slug);
            await loadCountryInfo(e.CountryCode)
        };
        countrySelectList.appendChild(item);
    });
};

loadCountrySelectList = async () => {
    const data = await covidAPI.getSummary();
    countryList = data.Countries;
    const countrySelectList = $("#country-select__list");
    const item = document.createElement("div");
    item.classList.add("country-item");
    item.textContent = "Global";
    item.onclick = async () => {
        $("#country-select span").textContent = e.Country;
        countrySelectList.classList.toggle("active");
        await loadSummary("Global");
    };
    countrySelectList.appendChild(item);
    renderCountrySelectList(countryList);
};

initCountryFilter = () => {
    let input = $("#country-select__list input");
    input.onkeyup = () => {
        let filtered = countryList.filter((e) => e.Country.toLowerCase().includes(input.value));
        renderCountrySelectList(filtered);
    };
};

loadCountryInfo = async(countryCode) => {
    const countryData = await countryAPI.getCountryByCode(countryCode)
    const imgElement = document.createElement('img');
    
    imgElement.src = countryData[0].flags.png;
    imgElement.classList.add('country-flag-img')
    $('#country-info').innerHTML = ''
    $('#country-info').appendChild(imgElement)
    $('#country-name').textContent =  countryData[0].name.common
    $('#country-capital').textContent = 'Capital: ' + countryData[0].capital[0]
    $('#country-population').textContent = 'Population: ' + numberWithCommas(countryData[0].population)
    $('#country-region').textContent = 'Region: ' + countryData[0].region
    $('#country-subregion').textContent ='SubRegion: ' + countryData[0].subregion
}

$('#backBtn').onclick = () => {
    $('.modal').classList.add('hide')
    $('.content').classList.remove('hide');
    $('.modal').classList.remove('active')
}