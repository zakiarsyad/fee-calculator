import { errorHandler } from "../../src/middlewares/error_handler";
import { Request, Response, NextFunction } from "express";

describe("errorHandler", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
  });

  it("should return 400 with error message for invalid API key", () => {
    const err = new Error("INVALID_API_KEY");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error_code: "INVALID_API_KEY",
      error_message: "Your API key is invalid.",
    });
  });

  it("should return 400 with error message for API validation error", () => {
    const err = new Error("API_VALIDATION_ERROR");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error_code: "API_VALIDATION_ERROR",
      error_message: "Invalid API request.",
    });
  });

  it("should return 400 with error message for CSV validation error", () => {
    const err = new Error("CSV_VALIDATION_ERROR");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      error_code: "CSV_VALIDATION_ERROR",
      error_message: "Invalid CSV format.",
    });
  });

  it("should return 500 with generic error message for other errors", () => {
    const err = new Error("SOME_OTHER_ERROR");

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      error_code: "SERVER_ERROR",
      error_message: "Something went wrong!",
    });
  });
});
