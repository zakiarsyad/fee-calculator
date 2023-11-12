import moment from "moment";
import {
  isTimeInRange,
  isTimeInDayRanges,
  isPeakHour,
  calculateFare,
  fareMapper,
  TotalFare,
} from "../../src/middlewares/fare_mapper";

jest.mock("../../src/config", () => ({
  FARE_RULES:
    '{"peak":{"greengreen":2,"redred":3,"greenred":4,"redgreen":3},"nonpeak":{"greengreen":1,"redred":2,"greenred":3,"redgreen":2}}',
  FARE_CAP:
    '{"greengreen":{"daily":8,"weekly":55},"redred":{"daily":12,"weekly":70},"greenred":{"daily":15,"weekly":90},"redgreen":{"daily":15,"weekly":90}}',
  WEEKDAYS_PEAK_HOURS:
    '[{"start":"08:00","end":"10:00"},{"start":"16:30","end":"19:00"}]',
  SATURDAY_PEAK_HOURS:
    '[{"start":"10:00","end":"14:00"},{"start":"18:00","end":"23:00"}]',
  SUNDAY_PEAK_HOURS: '[{"start":"18:00","end":"23:00"}]',
  VALID_LINES: '["green","red"]',
}));

describe("isTimeInRange", () => {
  it("should return true if the current time is within the specified range", () => {
    const current = moment("2023-11-12T19:58:30");
    const start = "18:00";
    const end = "20:00";

    const result = isTimeInRange(current, start, end);

    expect(result).toBe(true);
  });

  it("should return false if the current time is outside the specified range", () => {
    const current = moment("2023-11-12T15:58:30");
    const start = "18:00";
    const end = "20:00";

    const result = isTimeInRange(current, start, end);

    expect(result).toBe(false);
  });

  it("should return true if the current time is equal to the start time", () => {
    const current = moment("2023-11-12T18:00:00");
    const start = "18:00";
    const end = "20:00";

    const result = isTimeInRange(current, start, end);

    expect(result).toBe(true);
  });

  it("should return true if the current time is equal to the end time", () => {
    const current = moment("2023-11-12T20:00:00");
    const start = "18:00";
    const end = "20:00";

    const result = isTimeInRange(current, start, end);

    expect(result).toBe(true);
  });
});

describe("isTimeInDayRanges", () => {
  it("should return true if the current time is within the first of the specified ranges", () => {
    const current = moment("2023-11-12T19:58:30");
    const ranges = [
      { start: "18:00", end: "20:00" },
      { start: "22:00", end: "23:59" },
    ];

    const result = isTimeInDayRanges(current, ranges);

    expect(result).toBe(true);
  });

  it("should return true if the current time is within the second of the specified ranges", () => {
    const current = moment("2023-11-12T22:58:30");
    const ranges = [
      { start: "18:00", end: "20:00" },
      { start: "22:00", end: "23:59" },
    ];

    const result = isTimeInDayRanges(current, ranges);

    expect(result).toBe(true);
  });

  it("should return false if the current time is outside all of the specified ranges", () => {
    const current = moment("2023-11-12T15:58:30");
    const ranges = [
      { start: "18:00", end: "20:00" },
      { start: "22:00", end: "23:59" },
    ];

    const result = isTimeInDayRanges(current, ranges);

    expect(result).toBe(false);
  });

  it("should return true if the current time is equal to the start time of any of the specified ranges", () => {
    const current = moment("2023-11-12T18:00:00");
    const ranges = [
      { start: "18:00", end: "20:00" },
      { start: "22:00", end: "23:59" },
    ];

    const result = isTimeInDayRanges(current, ranges);

    expect(result).toBe(true);
  });

  it("should return true if the current time is equal to the end time of any of the specified ranges", () => {
    const current = moment("2023-11-12T23:59:00");
    const ranges = [
      { start: "18:00", end: "20:00" },
      { start: "22:00", end: "23:59" },
    ];

    const result = isTimeInDayRanges(current, ranges);

    expect(result).toBe(true);
  });
});

describe("isPeakHour", () => {
  const peakHoursCases = [
    ["2023-11-12T19:58:30", true], // Sunday
    ["2023-11-13T09:58:30", true], // Monday
    ["2023-11-14T09:58:30", true], // Tuesday
    ["2023-11-15T09:58:30", true], // Wednesday
    ["2023-11-16T09:58:30", true], // Thursday
    ["2023-11-17T09:58:30", true], // Friday
    ["2023-11-18T11:58:30", true], // Saturday
  ];
  describe.each(peakHoursCases)(
    "when the current time is within the peak hours",
    (time, expected) => {
      it(`should return ${expected}`, () => {
        const current = moment(time as string);
        const result = isPeakHour(moment(current));
        expect(result).toBe(expected);
      });
    },
  );

  const nonpeakHoursCases = [
    ["2023-11-12T15:58:30", false], // Sunday
    ["2023-11-13T11:58:30", false], // Monday
    ["2023-11-14T11:58:30", false], // Tuesday
    ["2023-11-15T11:58:30", false], // Wednesday
    ["2023-11-16T11:58:30", false], // Thursday
    ["2023-11-17T11:58:30", false], // Friday
    ["2023-11-18T15:58:30", false], // Saturday
  ];
  describe.each(nonpeakHoursCases)(
    "when the current time is outside the peak hours",
    (time, expected) => {
      it(`should return ${expected}`, () => {
        const current = moment(time as string);
        const result = isPeakHour(moment(current));
        expect(result).toBe(expected);
      });
    },
  );
});

describe("calculateFare", () => {
  const testCases = [
    ["greengreen", "2023-11-12T19:58:30", 2], // Peak hour
    ["redred", "2023-11-12T19:58:30", 3], // Peak hour
    ["greenred", "2023-11-12T19:58:30", 4], // Peak hour
    ["redgreen", "2023-11-12T19:58:30", 3], // Peak hour
    ["greengreen", "2023-11-12T15:58:30", 1], // Non peak hour
    ["redred", "2023-11-12T15:58:30", 2], // Non peak hour
    ["greenred", "2023-11-12T15:58:30", 3], // Non peak hour
    ["redgreen", "2023-11-12T15:58:30", 2], // Non peak hour
  ];

  describe.each(testCases)(
    "with this current time",
    (route, time, expected) => {
      it(`should return ${expected} for ${route} route at this time ${time}`, () => {
        const date = moment(time);

        const result = calculateFare(route as string, date);

        expect(result).toBe(expected);
      });
    },
  );
});

describe("fareMapper", () => {
  const testCases = [
    // The data is empty
    {
      data: {
        total: 0,
      },
      route: "greengreen",
      date: moment("2023-11-12T19:58:30"),
      expected: {
        greengreen: {
          total: 2,
          "45": {
            total: 2,
            Sunday: 2,
          },
        },
        total: 2,
      },
    },
    // The data is filled with a different route
    {
      data: {
        redred: {
          total: 2,
          "45": {
            total: 2,
            Saturday: 2,
          },
        },
        total: 2,
      },
      route: "greengreen",
      date: moment("2023-11-12T19:58:30"),
      expected: {
        redred: {
          total: 2,
          "45": {
            total: 2,
            Saturday: 2,
          },
        },
        greengreen: {
          total: 2,
          "45": {
            total: 2,
            Sunday: 2,
          },
        },
        total: 4,
      },
    },
    // The data is filled with a same route but different week
    {
      data: {
        greengreen: {
          total: 2,
          "44": {
            total: 2,
            Saturday: 2,
          },
        },
        total: 2,
      },
      route: "greengreen",
      date: moment("2023-11-12T19:58:30"),
      expected: {
        greengreen: {
          total: 4,
          "44": {
            total: 2,
            Saturday: 2,
          },
          "45": {
            total: 2,
            Sunday: 2,
          },
        },
        total: 4,
      },
    },
    // The data is filled with a same route and a same week
    {
      data: {
        greengreen: {
          total: 2,
          "45": {
            total: 2,
            Saturday: 2,
          },
        },
        total: 2,
      },
      route: "greengreen",
      date: moment("2023-11-12T19:58:30"),
      expected: {
        greengreen: {
          total: 4,
          "45": {
            total: 4,
            Saturday: 2,
            Sunday: 2,
          },
        },
        total: 4,
      },
    },
    // The data is filled with a same route, a same week, and a same day
    {
      data: {
        greengreen: {
          total: 2,
          "45": {
            total: 2,
            Sunday: 2,
          },
        },
        total: 2,
      },
      route: "greengreen",
      date: moment("2023-11-12T19:58:30"),
      expected: {
        greengreen: {
          total: 4,
          "45": {
            total: 4,
            Sunday: 4,
          },
        },
        total: 4,
      },
    },
    // The data is filled with a same route, a same week, a same day, but reach max weekly cap
    {
      data: {
        greengreen: {
          total: 55,
          "45": {
            total: 55,
            Sunday: 8,
            Monday: 8,
            Tuesday: 8,
            Wednesday: 8,
            Thursday: 8,
            Friday: 8,
            Saturday: 7,
          },
        },
        total: 55,
      },
      route: "greengreen",
      date: moment("2023-11-12T19:58:30"),
      expected: {
        greengreen: {
          total: 55,
          "45": {
            total: 55,
            Sunday: 8,
            Monday: 8,
            Tuesday: 8,
            Wednesday: 8,
            Thursday: 8,
            Friday: 8,
            Saturday: 7,
          },
        },
        total: 55,
      },
    },
    // The data is filled with a same route, a same week, a same day, but reach max weekly cap
    {
      data: {
        greengreen: {
          total: 8,
          "45": {
            total: 8,
            Sunday: 8,
          },
        },
        total: 8,
      },
      route: "greengreen",
      date: moment("2023-11-12T19:58:30"),
      expected: {
        greengreen: {
          total: 8,
          "45": {
            total: 8,
            Sunday: 8,
          },
        },
        total: 8,
      },
    },
  ];

  testCases.forEach(({ data, route, date, expected }) => {
    it(`should return ${JSON.stringify(
      expected,
    )} for ${route} route at ${date}`, () => {
      const result = fareMapper(data as TotalFare, route, date);
      expect(result).toEqual(expected);
    });
  });
});
