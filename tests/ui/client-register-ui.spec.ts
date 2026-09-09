import { faker } from "@faker-js/faker";
import { test, expect } from "../../src/fixtures/e2e.fixture";
import { API_ENDPOINTS, E2E_ENDPOINTS } from "../../src/constants/endpoints";

test.describe("Client Register UI Tests", () => {
  test("should register a new client", async ({
    page,
    clientRegisterPage,
    autoCleanHelper,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(API_ENDPOINTS.USERS) &&
        response.status() === 201,
    );

    await clientRegisterPage.register(
      faker.person.fullName(),
      faker.internet.email(),
      faker.internet.password(),
    );

    const response = await responsePromise;
    const responseBody = await response.json();

    autoCleanHelper.addUserId(responseBody._id);

    await expect(clientRegisterPage.alertSuccessMessage).toBeVisible();
    await expect(page).toHaveURL(E2E_ENDPOINTS.HOME);
  });

  test("should not register a new client with existing email", async ({
    page,
    clientRegisterPage,
    autoCleanHelper,
  }) => {
    const existingUser = await autoCleanHelper.registerUser("false");

    await clientRegisterPage.register(
      faker.person.fullName(),
      existingUser.email,
      faker.internet.password(),
    );

    await expect(page).toHaveURL(E2E_ENDPOINTS.CLIENT_REGISTER);
    await expect(clientRegisterPage.alertErrorMessage).toBeVisible();
  });
});
