import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import numeral from "numeral";
import './LineGraph.css';

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

const buildChartData = (data, casesType) => {
    let chartData = [];
    let lastDataPoint;
    if (casesType !== 'vaccines') {
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
    } else {
        for (let date in data) {
            if (lastDataPoint) {
                let newDataPoint = {
                    x: date,
                    y: data[date] - lastDataPoint,
                };
                chartData.push(newDataPoint);
            }
            lastDataPoint = data[date];
        }
    }
    return chartData;
};

function LineGraph({ casesType, ...props }) {
    const [data, setData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            //Fetching data depending on the type of cases
            if (casesType !== 'vaccines') {
                await fetch("https://disease.sh/v3/covid-19/historical/all?lastdays=120")
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        let chartData = buildChartData(data, casesType);
                        setData(chartData);
                        // buildChart(chartData);
                    });
            } else {
                await fetch("https://disease.sh/v3/covid-19/vaccine/coverage?lastdays=120&fullData=false")
                    .then((response) => {
                        return response.json();
                    })
                    .then((data) => {
                        let chartData = buildChartData(data, casesType);
                        setData(chartData);
                        // buildChart(chartData);
                    });
            }
        };

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