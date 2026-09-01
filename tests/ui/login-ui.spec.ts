import { faker } from "@faker-js/faker";
import { test, expect } from "../../src/fixtures/e2e.fixture";
import { LoginMessages } from "../../src/pages/LoginPage";

test.describe("Login UI Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should login with admin valid credentials", async ({
    page,
    loginPage,
    adminUser,
  }) => {
    await loginPage.login(adminUser.email, adminUser.password);

    await expect(page).toHaveURL(/\/admin\/home/);
    await expect(page.getByText("Bem Vindo")).toBeVisible();
  });

  test("should login with client valid credentials", async ({
    page,
    loginPage,
    clientUser,
  }) => {
    await loginPage.login(clientUser.email, clientUser.password);

    await expect(page).toHaveURL(/\/home/);
    await expect(page.getByText("Serverest Store")).toBeVisible();
  });

  test("should not do login with nonexistent email", async ({ loginPage }) => {
    await loginPage.login(faker.internet.email(), faker.internet.password());

    await expect(loginPage.alertErrorMessage).toHaveText(
      LoginMessages.INVALID_CREDENTIALS,
    );
  });

  test("should not do login with invalid password", async ({
    loginPage,
    clientUser,
  }) => {
    await loginPage.login(clientUser.email, faker.internet.password());

    await expect(loginPage.alertErrorMessage).toHaveText(
      LoginMessages.INVALID_CREDENTIALS,
    );
  });
});
