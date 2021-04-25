import React from 'react'
import './App.css'
import InfoBox from './components/InfoBox'
import Map from './Map'
import Table from './Table'
import LineGraph from './LineGraph'
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
  const VaccineData = [];
  const [countries, setcountries] = useState([])
  const [country, setcountry] = useState('worldwide')
  const [countryInfo, setcountryInfo] = useState({}) //For covid
  const [vaccineInfo, setvaccineInfo] = useState({}) //For vaccine
  const [tableData, settableData] = useState([])
  const [casesType, setCasesType] = useState("cases");
  const [currvaccine, setcurrvaccine] = useState(0)
  const [totalvaccine, settotalvaccine] = useState(0)
  const [mapCenter, setmapCenter] = useState({ lat: 34.80746, lng: -40.4796 })
  const [mapCountries, setmapCountries] = useState([])
  //This are like the world center co-ordinates
  const [mapZoom, setmapZoom] = useState(3)
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

  useEffect(() => {
    const fetchData = async () => {
      const worldInfo = axios.get('https://disease.sh/v3/covid-19/all');
      const worldVaccInfo = axios.get('https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=2');
      axios.all([worldInfo, worldVaccInfo]).then(axios.spread((...iniData) => {
        setcountryInfo(iniData[0].data);
        setmapZoom(4);
        setvaccineInfo(iniData[1].data);
        let lastPoint;
        for (let date in iniData[1].data) {
          if (lastPoint) {
            let newp = iniData[1].data[date];
            setcurrvaccine(newp - lastPoint);
          }
          lastPoint = iniData[1].data[date];
        }
        settotalvaccine(lastPoint);
      }))
    }
    fetchData();
  }, [])

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    console.log(event.target);
    setcountry(event.target.value)
    //url and vurl are my 2 url
    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    const vurl = countryCode === 'worldwide' ? "https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=2" : `https://disease.sh/v3/covid-19/vaccine/coverage/countries/${countryCode}?lastdays=2`;
    const getCovidInfo = axios.get(url);
    const getVaccInfo = axios.get(vurl);
    axios.all([getCovidInfo, getVaccInfo]).then(axios.spread((...allData) => {
      const covidInfo = allData[0].data
      const covidVInfo = allData[1].data;
      setcountryInfo(covidInfo)
      setvaccineInfo(covidVInfo);
      console.log(countryInfo)
      let lastPoint;
      for (let date in allData[1].data) {
        lastPoint = allData[1].data[date];
      }
      console.log(lastPoint);
      let p;
      for (let item in lastPoint) {

        if (p) {
          let n = lastPoint[item];
          setcurrvaccine(n - p);
        }
        p = lastPoint[item]
      }
      settotalvaccine(p);

    }))



  }
  //timeline["4/23/21"]

  return (
    <div className='app'>
      <div className="app-left">
        <div className='app-header'>
          <h1>Coronavirus Tracker</h1>
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
          <InfoBox
            isRed
            active={casesType === 'cases'}
            onClick={e => setCasesType('cases')}
            title="Coronavirus Cases"
            total={prettyPrintStat(countryInfo.cases)}
            current={prettyPrintStat(countryInfo.todayCases)}
          ></InfoBox>
          <InfoBox
            active={casesType === 'recovered'}
            onClick={e => setCasesType('recovered')}
            title="Recovered" total={prettyPrintStat(countryInfo.recovered)} current={prettyPrintStat(countryInfo.todayRecovered)}></InfoBox>
          <InfoBox
            isRed
            active={casesType === 'deaths'}
            onClick={e => setCasesType('deaths')}
            title="Deaths" total={prettyPrintStat(countryInfo.deaths)} current={prettyPrintStat(countryInfo.todayDeaths)}></InfoBox>
          <InfoBox
            active={casesType === 'vaccines'}
            title="Vaccination Doses" total={prettyPrintStat(totalvaccine)} current={prettyPrintStat(currvaccine)}></InfoBox>
        </div>
        <Map center={mapCenter} zoom={mapZoom} countries={mapCountries} casesType={casesType}></Map>
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
