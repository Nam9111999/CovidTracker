const baseApi = 'https://api.covid19api.com/'



const covidAPI = {
    getSummary: async()=>{
        return await fetchJson(baseApi+'summary')
    },
    worldAllTime: async()=>{
        return await fetchJson(baseApi+'world')
    },
    countryALlTime: async(country,status)=>{
        
        if(country=='united-states'){
            const dayRange =  getDaysRange(7)
            return await fetchJson(baseApi+`country/${country}/status/${status}?from=${dayRange.startDate}&to=${dayRange.endDate}&province=california`)
        }
        return await fetchJson(baseApi+`dayone/country/${country}/status/${status}`)
    },
    countryDaysCase: async(country,status)=>{
        const dayRange =  getDaysRange(30)
        return await fetchJson(baseApi+`country/${country}/status/${status}?from=${dayRange.startDate}&to=${dayRange.endDate}`)
    },
    worldDaysCase: async()=>{
        const dayRange =  getDaysRange(30)
        return await fetchJson(baseApi+`world?from=${dayRange.startDate}&to=${dayRange.endDate}`)
    },
    countryTodayCase: async (country)=> {
        const date = new Date()
        const today = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()-1}`
        console.log(today)
        return await fetchJson(baseApi+`live/country/${country}/status/confirmed/date/${today}`)
    }

    
}

getDaysRange = (days) => {
    const day = new Date()
    const fromDay = new Date(day.getTime()-(days*24*60*60*1000))
    const toDate = `${day.getUTCFullYear()}-${day.getUTCMonth()}-${day.getUTCDate()}`
    const fromDate = `${fromDay.getUTCFullYear()}-${fromDay.getUTCMonth()}-${fromDay.getUTCDate()}` 
    return {
        startDate: fromDate,
        endDate: toDate
    }
}