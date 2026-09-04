import { faker } from "@faker-js/faker";
import { test, expect } from "../../src/fixtures/e2e.fixture";

test.describe("Client Register UI Tests", () => {
  test("should register a new client", async ({
    page,
    clientRegisterPage,
    autoCleanHelper,
  }) => {
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes("/usuarios") && response.status() === 201,
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
    await expect(page).toHaveURL("/home");
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

    await expect(page).toHaveURL("/cadastrarusuarios");
    await expect(clientRegisterPage.alertErrorMessage).toBeVisible();
  });
});
