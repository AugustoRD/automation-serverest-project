import { faker } from "@faker-js/faker";
import { test, expect } from "../../src/fixtures/e2e.fixture";

test.describe("Client Register UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cadastrarusuarios");
  });

  test.afterEach(async ({ setupHelper, admToken }) => {
    await setupHelper.tearDown(admToken);
  });

  test("should register a new client", async ({
    page,
    clientRegisterPage,
    setupHelper,
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

    setupHelper.addUserId(responseBody._id);

    await expect(clientRegisterPage.alertSuccessMessage).toBeVisible();
    await expect(page).toHaveURL("/home");
  });
});
