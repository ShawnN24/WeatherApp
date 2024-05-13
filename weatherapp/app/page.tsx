'use client'

import Image from "next/image";
import Navbar from "./Components/Navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Container from "./Components/Container";
import { convertKelvinToFarenheit } from "./utils/convertKelvinToFarenheit";
import { metersToKilometers } from "./utils/metersToKilometers";
import WeatherIcon from "./Components/WeatherIcon";
import { getDayOrNightIcon } from "./utils/getDayOrNightIcon";
import WeatherDetails from "./Components/WeatherDetails";
import { convertWindSpeed } from "./utils/convertWindSpeed";
import ForecastWeatherDetail from "./Components/ForecastWeatherDetail";
import ForecastParse from "./Components/ForecastParse";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect } from "react";

// https://api.openweathermap.org/data/2.5/forecast?q=Chandler&APPID=3360bdad0d0ff303e841cea2b2e836f0&cnt=2

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherInfo[];
  city: CityInfo;
}

interface WeatherInfo {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: Weather[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface CityInfo {
  id: number;
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  country: string;
  population: number;
  timezone: number;
  sunrise: number;
  sunset: number;
}

export default function Home() {

  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherData>("repoData", async () => 
    {
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&APPID=${process.env.NEXT_PUBLIC_WEATHER_KEY}&cnt=56`
      );
      return data;
    }
  );

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list[0];

  console.log("data", data);

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      )
    )
  ];

  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if(isLoading) 
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce">Loading...</p>
      </div>
  );

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/* todays data */}
        <section className="space-y-4">
          <div className="space-y-2">
            <h2 className="flex gap-1 text-2xl items-end">
              <p> {format(parseISO(firstData?.dt_txt ?? ""), "EEEE")} </p>
              <p> ({format(parseISO(firstData?.dt_txt ?? ""), "MM/dd/yyyy")}) </p>
            </h2>
            <Container className="gap-10 px-6 items-center">
              {/* temp */}
              <div className="flex flex-col px-4">
                <span className="text-5xl">
                  {convertKelvinToFarenheit(firstData?.main.temp ?? 0)}°
                </span>
                <p className="text-xs space-x-1 whitespace-nowrap">
                  <span>Feels like</span>
                  <span>
                    {convertKelvinToFarenheit(firstData?.main.temp ?? 0)}°
                  </span>
                </p>
                <p className="text-xs space-x-2">
                  <span>
                    {convertKelvinToFarenheit(firstData?.main.temp_min ?? 0)}
                    °↓{" "}
                  </span>
                  <span>
                    {" "}
                    {convertKelvinToFarenheit(firstData?.main.temp_max ?? 0)}
                    °↑
                  </span>
                </p>
              </div>
              {/* time and weather icon */}
              <div className="flex overflow-x-auto w-full justify-between pr-3 pb-3">
                {data?.list.map((d,i) =>
                  <ForecastParse
                    dt_txt={d.dt_txt} 
                    icon={d.weather[0].icon} 
                    temp={d?.main.temp} 
                  />
                )}
              </div>
            </Container>
          </div>





          <div className="flex gap-4">
            {/* left */}
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">
                {firstData?.weather[0].description}{" "}
              </p>
              <WeatherIcon 
                iconName={getDayOrNightIcon(
                  firstData?.weather[0].icon ?? "", 
                  firstData?.dt_txt ?? ""
                )}
              />
            </Container>
            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
              <WeatherDetails 
                visibility={metersToKilometers(firstData?.visibility ?? 0)}
                airPressure={`${firstData?.main.pressure} hPa`}
                humidity={`${firstData?.main.humidity}%`} 
                windSpeed={convertWindSpeed(firstData?.wind.speed ?? 0)} 
                sunrise={format(fromUnixTime(data?.city.sunrise ?? 0), "H:mm")}
                sunset={format(fromUnixTime(data?.city.sunset ?? 0), "H:mm")}
              />
            </Container>

            {/* right */}
          </div>
        </section>





        {/* 7 day forcast*/}
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">Forecast (7 Days)</p>
          {firstDataForEachDate.map((d,i) => (
            <ForecastWeatherDetail 
              key={i} 
              weatherIcon={getDayOrNightIcon(d?.weather[0].icon ?? "01d", "MM/dd/yyyy")}
              date={format(parseISO(d?.dt_txt ?? ""), "MM/dd")} 
              day={format(parseISO(d?.dt_txt ?? ""), "EEEE")} 
              temp={d?.main.temp ?? 0} 
              feels_like={d?.main.feels_like ?? 0} 
              temp_min={d?.main.temp_min ?? 0} 
              temp_max={d?.main.temp_max ?? 0} 
              description={d?.weather[0].description ?? ""} 
              visibility={`${metersToKilometers(d?.visibility ?? 0)}`} 
              humidity={`${d?.main.humidity}%`} 
              windSpeed={`${convertWindSpeed(d?.wind.speed ?? 0)}`} 
              airPressure={`${d?.main.pressure} hPa`} 
              sunrise={format(fromUnixTime(data?.city.sunrise ?? 0), "H:mm")} 
              sunset={format(fromUnixTime(data?.city.sunset ?? 0), "H:mm")}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
