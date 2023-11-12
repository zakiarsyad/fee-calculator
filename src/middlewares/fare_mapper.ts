
import moment from "moment";

import { FARE_CAP, FARE_RULES, SATURDAY_PEAK_HOURS, SUNDAY_PEAK_HOURS, VALID_LINES, WEEKDAYS_PEAK_HOURS } from "../Config";

const saturdayPeakHours: PeakHour[] = JSON.parse(SATURDAY_PEAK_HOURS);
const sundayPeakHours: PeakHour[] = JSON.parse(SUNDAY_PEAK_HOURS);
const weekdaysPeakHours: PeakHour[] = JSON.parse(WEEKDAYS_PEAK_HOURS);
const fareRules: FareRule = JSON.parse(FARE_RULES);
const fareCap: FareCap = JSON.parse(FARE_CAP);
export const validLines: string[] = JSON.parse(VALID_LINES);

interface PeakHour {
    start: string;
    end: string;
}

interface FareRule {
    [key: string]: {
        [key: string]: number;
    }
}

interface FareCap {
    [key: string]: {
        daily: number;
        weekly: number;
    }
}

interface WeekFare {
    total: number;
    [key: string]: number;
}

interface Route {
    total: number;
    [key: string]: WeekFare | number;
}

export interface TotalFare {
    total: number;
    [key: string]: Route | number;
}



const isTimeInRange = (current: moment.Moment, start: string, end: string): boolean => {
    const startTime = current.hour(Number(start.slice(0, 2))).minute(Number(start.slice(3, 5)));
    const endTime = current.hour(Number(end.slice(0, 2))).minute(Number(end.slice(3, 5)));
    return current.isBetween(startTime, endTime);
}

const isTimeInDayRanges = (date: moment.Moment, ranges: { start: string; end: string }[]): boolean => {
    return ranges.some(range => isTimeInRange(date, range.start, range.end));
}

const isPeakHour = (date: moment.Moment): boolean => {
    const day = date.format('dddd');

    switch (day) {
        case 'Monday':
        case 'Tuesday':
        case 'Wednesday':
        case 'Thursday':
        case 'Friday':
            return isTimeInDayRanges(date, weekdaysPeakHours);
        case 'Saturday':
            return isTimeInDayRanges(date, saturdayPeakHours);
        case 'Sunday':
            return isTimeInDayRanges(date, sundayPeakHours);
        default:
            return false;
    }
}

const calculateFare = (route: string, date: moment.Moment): number => {
    const peak = isPeakHour(date) ? 'peak' : 'nonpeak';

    return fareRules[peak][route];
}

export const fareMapper = (data: TotalFare, route: string, date: moment.Moment): TotalFare => {
    const dataCopy = { ...data };
    const week = date.format('W');
    const day = date.format('dddd');
    const fare = calculateFare(route, date);

    const newFare = fare < fareCap[route].daily ? fare : fareCap[route].daily;

    if (dataCopy[route] === undefined) {
        const newRoute: Route = {
            total: newFare,
            [week]: {
                total: newFare,
                [day]: newFare,
            },
        }

        dataCopy[route] = newRoute;
        dataCopy.total += newFare;
    } else {
        const routeData = dataCopy[route] as Route;

        if (routeData[week] === undefined) {
            const newWeekFare: WeekFare = {
                total: newFare,
                [day]: newFare,
            }

            routeData[week] = newWeekFare;
            routeData.total += newFare;
            dataCopy.total += newFare;
        } else {
            const weekData = routeData[week] as WeekFare;
            const newlyAddedFare = weekData.total + newFare < fareCap[route].weekly ? newFare : fareCap[route].weekly - weekData.total;

            if (weekData[day] === undefined) {
                weekData[day] = newFare;
            } else {
                const dailyFare = weekData[day] + newFare < fareCap[route].daily ? weekData[day] + newFare : fareCap[route].daily;

                weekData[day] = dailyFare;
            }

            weekData.total += newlyAddedFare;
            routeData.total += newlyAddedFare;
            dataCopy.total += newlyAddedFare;
        }
    }

    return dataCopy;
};