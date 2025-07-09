import "reflect-metadata";
import axios from "axios";
import { DIDVCServerClient } from "@/infrastructure/libs/did";
import { IDENTUS_API_URL, IDENTUS_API_TIMEOUT } from "@/consts/utils";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DIDVCServerClient", () => {
  let client: DIDVCServerClient;
  const mockUid = "test-uid";
  const mockToken = "test-token";
  const mockEndpoint = "/test/endpoint";
  const mockData = { test: "data" };

  beforeEach(() => {
    jest.clearAllMocks();
    client = new DIDVCServerClient();
    process.env.API_KEY = "test-api-key";
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("call method - success scenarios", () => {
    it("should make successful GET request and return data", async () => {
      const mockResponse = { data: { result: "success" } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "GET");

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${IDENTUS_API_URL}${mockEndpoint}`,
        {
          headers: {
            "x-api-key": "test-api-key",
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
          timeout: IDENTUS_API_TIMEOUT,
        }
      );
      expect(result).toEqual({ result: "success" });
    });

    it("should make successful POST request with data", async () => {
      const mockResponse = { data: { jobId: "test-job-id" } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "POST", mockData);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${IDENTUS_API_URL}${mockEndpoint}`,
        mockData,
        {
          headers: {
            "x-api-key": "test-api-key",
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
          timeout: IDENTUS_API_TIMEOUT,
        }
      );
      expect(result).toEqual({ jobId: "test-job-id" });
    });

    it("should make successful PUT request", async () => {
      const mockResponse = { data: { updated: true } };
      mockedAxios.put.mockResolvedValue(mockResponse);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "PUT", mockData);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${IDENTUS_API_URL}${mockEndpoint}`,
        mockData,
        {
          headers: {
            "x-api-key": "test-api-key",
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
          timeout: IDENTUS_API_TIMEOUT,
        }
      );
      expect(result).toEqual({ updated: true });
    });

    it("should make successful DELETE request", async () => {
      const mockResponse = { data: { deleted: true } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "DELETE");

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${IDENTUS_API_URL}${mockEndpoint}`,
        {
          headers: {
            "x-api-key": "test-api-key",
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
          timeout: IDENTUS_API_TIMEOUT,
        }
      );
      expect(result).toEqual({ deleted: true });
    });

    it("should use custom timeout when provided", async () => {
      const mockResponse = { data: { result: "success" } };
      const customTimeout = 60000;
      mockedAxios.get.mockResolvedValue(mockResponse);

      await client.call(mockUid, mockToken, mockEndpoint, "GET", undefined, customTimeout);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${IDENTUS_API_URL}${mockEndpoint}`,
        {
          headers: {
            "x-api-key": "test-api-key",
            Authorization: `Bearer ${mockToken}`,
            "Content-Type": "application/json",
          },
          timeout: customTimeout,
        }
      );
    });
  });

  describe("call method - error scenarios", () => {
    it("should return null and log warning on network error", async () => {
      const networkError = new Error("Network Error");
      mockedAxios.get.mockRejectedValue(networkError);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "GET");

      expect(result).toBeNull();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should return null and log warning on 400 error", async () => {
      const badRequestError = {
        response: { status: 400, data: { error: "Bad Request" } },
        message: "Request failed with status code 400",
      };
      mockedAxios.post.mockRejectedValue(badRequestError);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "POST", mockData);

      expect(result).toBeNull();
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it("should return null and log warning on 500 error", async () => {
      const serverError = {
        response: { status: 500, data: { error: "Internal Server Error" } },
        message: "Request failed with status code 500",
      };
      mockedAxios.put.mockRejectedValue(serverError);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "PUT", mockData);

      expect(result).toBeNull();
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });

    it("should return null and log warning on timeout error", async () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 30000ms exceeded",
      };
      mockedAxios.delete.mockRejectedValue(timeoutError);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "DELETE");

      expect(result).toBeNull();
      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });

    it("should return null for any axios error without throwing", async () => {
      const genericError = new Error("Something went wrong");
      mockedAxios.get.mockRejectedValue(genericError);

      const result = await client.call(mockUid, mockToken, mockEndpoint, "GET");

      expect(result).toBeNull();
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });
});
