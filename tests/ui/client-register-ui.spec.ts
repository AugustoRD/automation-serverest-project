import { faker } from "@faker-js/faker";
import { test, expect } from "../../src/fixtures/e2e.fixture";

test.describe("Client Register UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cadastrarusuarios");
  });

  test("should register a new client", async ({ page, clientRegisterPage }) => {
    await clientRegisterPage.register(
      faker.person.fullName(),
      faker.internet.email(),
      faker.internet.password(),
    );
    await expect(clientRegisterPage.alertSuccessMessage).toBeVisible();
    await expect(page).toHaveURL("/home");
  });
});
