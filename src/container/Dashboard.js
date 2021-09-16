import React, { useState, useEffect } from "react";
import covidAPI from "../api/covidAPI";
import FieldSelectCountry from "../components/FieldSelectCountry";
import { Row, Col } from "antd";
import { Card } from "../components/Card";
import LineChart from "../components/LineChart";
import Map from "../components/Map";

const Dashboard = () => {
  const [countrySelectedId, setCountrySelectedId] = useState("vietnam");
  const [countries, setCountries] = useState([]);
  const [conuntryData, setCountryData] = useState([]);
  const [sumaryData, setSumaryData] = useState([]);
  const [mapData, setMapData] = useState({});

  useEffect(() => {
    const getAllCountries = async () => {
      const countriesData = await covidAPI.fetchAllCoutries();
      setCountries(countriesData.data);
    };
    getAllCountries();
  }, []);

  useEffect(() => {
    const getCountryData = async () => {
      const response = await covidAPI.fetchCountryData(countrySelectedId);
      setCountryData(response.data);
      setSumaryData(summaryData(response.data));
      getMapData();
    };
    getCountryData();
  }, [countrySelectedId, countries]);

  const handleSelectedCountry = (countryId) => {
    setCountrySelectedId(countryId);
  };

  const getMapData = async () => {
    if (countrySelectedId && countries.length !== 0) {
      const selectedCountry = countries.find(
        (country) => country.Slug === countrySelectedId
      );
      const countryId = selectedCountry.ISO2.toLowerCase();
      const mapDataJSON = await import(
        `@highcharts/map-collection/countries/${countryId}/${countryId}-all.geo.json`
      );
      setMapData(mapDataJSON);
    }
    return {};
  };

  // To get the latest data = the current date
  const summaryData = (data) => {
    if (data && data.length) {
      const latestData = data[data.length - 1];
      return [
        {
          title: "Total cases",
          count: latestData.Confirmed,
          type: "confirmed",
        },
        {
          title: "Recovered cases",
          count: latestData.Recovered,
          type: "recovered",
        },
        {
          title: "Death cases",
          count: latestData.Deaths,
          type: "death",
        },
      ];
    }
    return [];
  };

  return (
    <div>
      <Row>
        <Col span={16}>
          <div className="dashboard__header">
            <h1>COVID-19 Tracker</h1>
            <FieldSelectCountry
              countries={countries}
              handleSelectedCountry={handleSelectedCountry}
            />
          </div>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={16}>
          <div>
            <div className="box-wrapper mb-2">
              <Row gutter={16}>
                {sumaryData &&
                  sumaryData.map((sumaryInfo) => {
                    const { type, title, count } = sumaryInfo;
                    return <Card type={type} title={title} count={count} />;
                  })}
              </Row>
            </div>
            <div className="box-wrapper line-chart">
              <LineChart data={conuntryData} />
            </div>
          </div>
        </Col>
        <Col span={8}>
          <div className="box-wrapper ">
            <Map mapData={mapData} />
          </div>
        </Col>
      </Row>
    </div>
  );
};
export default Dashboard;