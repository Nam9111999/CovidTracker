const baseURL = 'https://restcountries.com/v3.1/'

const fetchJson = async (url) => {
    const response = await fetch(url)
    return response.json()
}

const countryAPI = {
    getCountryByCode: async(code)=>{
        return await fetchJson(baseURL+'alpha/'+code)
    },
}