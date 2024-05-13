import { format, parseISO } from 'date-fns';
import React from 'react';
import WeatherIcon from './WeatherIcon';
import { getDayOrNightIcon } from '../utils/getDayOrNightIcon';
import { convertKelvinToFarenheit } from '../utils/convertKelvinToFarenheit';

type Props = {
    dt_txt: any;
    icon: any;
    temp: number;
};

let firstHour = true;

export default function ForecastParse(props: Props) {
    let curHour = format(parseISO(props.dt_txt), "ha");
    if(curHour === "12AM" && firstHour != true){
        firstHour = false;
        return (
            <div 
                className="flex flex-col justify-between gap-2 items-center text-xs font-semibold border-l-2 border-l-gray-400 border-dashed"
                >
                <p className="whitespace-nowrap">
                    {format(parseISO(props.dt_txt), "h:mm a")}
                </p>
                <WeatherIcon 
                    iconName={getDayOrNightIcon(props.icon, props.dt_txt)}
                />
                <p>
                    {convertKelvinToFarenheit(props.temp ?? 0)}°
                </p>
            </div>
        );
    } else {
        firstHour = false;
        return (
            <div 
                className="flex flex-col justify-between gap-2 items-center text-xs font-semibold pr-0"
                >
                <p className="whitespace-nowrap">
                    {format(parseISO(props.dt_txt), "h:mm a")}
                </p>
                <WeatherIcon 
                    iconName={getDayOrNightIcon(props.icon, props.dt_txt)}
                />
                <p>
                    {convertKelvinToFarenheit(props.temp ?? 0)}°
                </p>
            </div>
        );
    }
}