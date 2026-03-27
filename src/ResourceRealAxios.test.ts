import "mock-local-storage";

import { Resource } from "./Resource.js";

/**
 * Needed this test file to have access to Axios rather than the Jest mocks.
 */
describe("Resources last modification", () => {
  it("should log failure and return 'now' if HTTP request fails", async () => {
    const resource = "http://nonsense endpoint";
    const modified =
      await Resource.getHttpResourceLastModificationTime(resource);

    // We expect modified time to be effectively 'now', so to leave a bit of
    // leeway for the function to return(!), we just assert on our version of
    // 'now' minus 100 milliseconds.
    expect(modified).toBeGreaterThan(Date.now() - 100);
  }, 10000);
});
