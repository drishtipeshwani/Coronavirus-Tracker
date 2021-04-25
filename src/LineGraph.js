import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import './LineGraph.css'
import axios from 'axios'

const options = {
    fill: true,
    legend: {
        display: false,
    },
    elements: {
        point: {
            radius: 0,
        },
    },
    maintainAspectRatio: false,
    tooltips: {
        mode: "index",
        intersect: false,
        callbacks: {
            label: function (tooltipItem, data) {
                return numeral(tooltipItem.value).format("+0,0");
            },
        },
    },
    scales: {
        xAxes: [
            {
                type: "time",
                time: {
                    format: "MM/DD/YY",
                    tooltipFormat: "ll",
                },
            },
        ],
        yAxes: [
            {
                gridLines: {
                    display: false,
                },
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function (value, index, values) {
                        return numeral(value).format("0a");
                    },
                },
            },
        ],
    },
};

function LineGraph({ casesType, ...props }) {
    const [data, setData] = useState({});

    const buildChartData = (data, casesType, vdata) => {
        let chartData = [];
        let lastDataPoint;
        if (casesType === 'vaccines') {
            for (let date in vdata.cases) {
                if (lastDataPoint) {
                    let newDataPoint = {
                        x: date,
                        y: vdata[date] - lastDataPoint,
                    };
                    chartData.push(newDataPoint);
                }
                lastDataPoint = vdata[date];
            }
        } else {
            for (let date in data.cases) {
                if (lastDataPoint) {
                    let newDataPoint = {
                        x: date,
                        y: data[casesType][date] - lastDataPoint,
                    };
                    chartData.push(newDataPoint);
                }
                lastDataPoint = data[casesType][date];
            }
        }
        return chartData;
    };
    useEffect(() => {
        const fetchData = async () => {
            const worldInfo = axios.get('https://disease.sh/v3/covid-19/historical/all?lastdays=120');
            const worldVaccInfo = axios.get('https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=120');
            axios.all([worldInfo, worldVaccInfo]).then(axios.spread((...iniData) => {
                let chartData = buildChartData(iniData[0].data, casesType, iniData[1].data);
                setData(chartData)
            }))
        }
        fetchData();
    }, [casesType]);

    return (
        <div className={props.className}>
            {data?.length > 0 && (
                <Line
                    data={{
                        datasets: [
                            {
                                label: 'Currrent Data',
                                backgroundColor: "rgba(204, 16, 52, 0.5)",
                                borderColor: "#CC1034",
                                data: data,
                            },
                        ],
                    }}
                    options={options}
                />
            )}
        </div>
    );
}

export default LineGraph;