import supertest from "supertest";

import app from "../src/index";

const request = supertest(app);

describe("Test GET /healthcheck request", () => {
    it("Should return 200 response", async () => {
        const response = await request.get("/healthcheck");

        expect(response.status).toEqual(200);
    });
});

describe("Test an invalid request", () => {
    it("Should return 400 response", async () => {
        const response = await request.get("/invalid");

        expect(response.status).toEqual(400);
    });
});
