import React from 'react'
import './App.css'
import InfoBox from './components/InfoBox'
import Map from './components/Map'
import Table from './components/Table'
import LineGraph from './components/LineGraph'
import { useState, useEffect } from 'react'
import { FormControl, Select, MenuItem, Card, CardContent } from '@material-ui/core'
import axios from 'axios'
import { sortData, prettyPrintStat } from './util'
import 'leaflet/dist/leaflet.css'

function App() {

  let today = new Date();
  let yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterday = yesterday.toLocaleDateString();
  today = today.toLocaleDateString();

  //Assigning all the necessary variables

  const [countries, setcountries] = useState([])
  const [country, setcountry] = useState('worldwide')
  const [countryInfo, setcountryInfo] = useState({}) //For covid
  const [vaccineInfo, setvaccineInfo] = useState({}) //For vaccine
  const [tableData, settableData] = useState([])
  const [casesType, setCasesType] = useState("cases");
  const [currvaccine, setcurrvaccine] = useState(0)
  const [totalvaccine, settotalvaccine] = useState(0)
  const [mapCenter, setmapCenter] = useState({ lat: 34.80746, lng: -40.4796 }) //This are like the world center co-ordinates
  const [mapCountries, setmapCountries] = useState([])


  const [mapZoom, setmapZoom] = useState(3)

  //Getting all the countries data
  useEffect(() => {
    //What you input is very important as this useEffect if input is empty will run once when app is started and not again
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          let sortedData = sortData(data);
          setcountries(countries);
          setmapCountries(data);
          settableData(sortedData);
        });
    };

    getCountriesData();
  }, [])

  //Getting worldwide data for covid-19 cases and vaccination doses administered

  useEffect(() => {
    const fetchData = async () => {
      const worldInfo = axios.get('https://disease.sh/v3/covid-19/all');
      const worldVaccInfo = axios.get('https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=3');
      axios.all([worldInfo, worldVaccInfo]).then(axios.spread((...iniData) => {
        setcountryInfo(iniData[0].data);
        setmapZoom(4);
        setvaccineInfo(iniData[1].data);
        let lastPoint;
        let count = 0;
        for (let date in iniData[1].data) {
          if (lastPoint && count === 0) {
            let newp = iniData[1].data[date];
            setcurrvaccine(newp - lastPoint);
            count++;
          }
          lastPoint = iniData[1].data[date];
        }
        settotalvaccine(lastPoint);
      }))
    }
    fetchData();
  }, [])

  //Getting covid data for particular countries

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setcountry(event.target.value)
    //url and vurl are my 2 url for covid cases and vaccination data
    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    const vurl = countryCode === 'worldwide' ? "https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=2" : `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${countryCode}?lastdays=3`;
    const getCovidInfo = axios.get(url);
    const getVaccInfo = axios.get(vurl);

    axios.all([getCovidInfo, getVaccInfo]).then(axios.spread((...allData) => {
      const covidInfo = allData[0].data
      const covidVInfo = allData[1].data;
      setcountryInfo(covidInfo)
      setvaccineInfo(covidVInfo);

      let lastPoint;
      for (let date in allData[1].data) {
        lastPoint = allData[1].data[date];
      }
      console.log(lastPoint);
      let presentCount;
      let count = 0;

      for (let item in lastPoint) {

        if (presentCount && count === 0) {
          let n = lastPoint[item];
          setcurrvaccine(n - presentCount);
          count++;
        }
        presentCount = lastPoint[item]
      }
      settotalvaccine(presentCount);

    }))



  }
  //timeline["4/23/21"]

  return (
    <div className='app'>
      <div className="app-left">
        <div className='app-header'>
          <h1>Covid-19 Tracker</h1>
          <FormControl className='app-dropdown'>
            <Select variant='outlined' value={country} onChange={onCountryChange}>
              <MenuItem value='worldwide'>Worldwide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div className='app-stats'>
          <InfoBox className="stats-box"
            isRed
            active={casesType === 'cases'}
            onClick={e => setCasesType('cases')}
            title="Coronavirus Cases"
            total={prettyPrintStat(countryInfo.cases)}
            current={prettyPrintStat(countryInfo.todayCases)}
          ></InfoBox>
          <InfoBox className="stats-box"
            active={casesType === 'recovered'}
            onClick={e => setCasesType('recovered')}
            title="Recovered" total={prettyPrintStat(countryInfo.recovered)} current={prettyPrintStat(countryInfo.todayRecovered)}></InfoBox>
          <InfoBox className="stats-box"
            isRed
            active={casesType === 'deaths'}
            onClick={e => setCasesType('deaths')}
            title="Deaths" total={prettyPrintStat(countryInfo.deaths)} current={prettyPrintStat(countryInfo.todayDeaths)}></InfoBox>
          <InfoBox className="stats-box"
            active={casesType === 'vaccines'}
            onClick={e => setCasesType('vaccines')}
            title="Vaccination Doses" total={prettyPrintStat(totalvaccine)} current={prettyPrintStat(currvaccine)}></InfoBox>
        </div>
        <Map center={mapCenter} zoom={mapZoom} countries={mapCountries} casesType={casesType} vaccinedoses={totalvaccine}></Map>
      </div>
      <Card className="app-right">
        <CardContent>
          <h1>Live Cases by Country</h1>
          <Table countries={tableData}></Table>
          <h3>Worldwide new {casesType}</h3>
          <LineGraph casesType={casesType} className="app-graph" />
        </CardContent>
      </Card>
    </div>
  )
}

export default App
