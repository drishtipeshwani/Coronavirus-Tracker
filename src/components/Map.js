import React from "react";
import { MapContainer as LeafletMap, TileLayer } from "react-leaflet";
import "./Map.css";
import { showMapData } from '../util'
import { showVaccineData } from '../util'

function Map({ center, zoom, countries, casesType, vaccinedoses }) {

    let vaccineType = true;

    if (casesType !== 'vaccines') {
        vaccineType = false;
    }

    //Depending on the type of cases the data is rendered


    return (
        <div className="map">
            {!vaccineType ?
                <LeafletMap center={center} zoom={zoom}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {showMapData(countries, casesType, vaccinedoses)}
                </LeafletMap>
                :
                <LeafletMap center={center} zoom={zoom}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {showVaccineData(countries, casesType, vaccinedoses)}
                </LeafletMap>
            }
        </div>
    );
}

export default Map;