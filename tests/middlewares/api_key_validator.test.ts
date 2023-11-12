import { apiKeyValidator } from "../../src/middlewares/api_key_validator";
import { Request, Response, NextFunction } from "express";

jest.mock("../../src/config", () => ({
  X_API_KEY: "VALID_API_KEY",
}));

describe("apiKeyValidator", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    res = {} as Response;
    next = jest.fn();
  });

  it("should call next if the API key is valid", () => {
    req.headers = { "x-api-key": "VALID_API_KEY" };

    apiKeyValidator(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should throw an error if the API key is invalid", () => {
    req.headers = { "x-api-key": "INVALID_API_KEY" };

    apiKeyValidator(req, res, next);

    expect(next).toHaveBeenCalledWith(new Error("INVALID_API_KEY"));
  });

  it("should throw an error if the API key is missing", () => {
    req.headers = {};

    apiKeyValidator(req, res, next);

    expect(next).toHaveBeenCalledWith(new Error("INVALID_API_KEY"));
  });
});
