import { test, expect } from "../../src/fixtures/e2e.fixture";
import { UserBuilder } from "../../src/builders/user.builder";
import { API_ENDPOINTS, E2E_ENDPOINTS } from "../../src/constants/endpoints";

test.describe("Admin Register UI Tests", () => {
  test("should register a new admin", async ({
    page,
    adminRegisterPage,
    autoCleanHelper,
  }) => {
    test.fail(
      true,
      "The test is failing because the success message is not being displayed after registering a new admin.",
    );
    const userData = new UserBuilder().withAdministrador("true").build();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(API_ENDPOINTS.USERS) &&
        response.status() === 201,
    );

    await adminRegisterPage.registerAsAdmin(
      userData.nome,
      userData.email,
      userData.password,
    );

    const response = await responsePromise;
    const responseBody = await response.json();

    autoCleanHelper.addUserId(responseBody._id);

    await expect(adminRegisterPage.alertSuccessMessage).toBeVisible();
    await expect(page).toHaveURL(E2E_ENDPOINTS.LIST_USERS);
    const userRow = page.getByRole("row").filter({ hasText: userData.email });
    await expect(userRow).toBeVisible();

    await expect(userRow.getByText(userData.administrador)).toBeVisible();
    await expect(page.getByText(userData.email)).toBeVisible();
  });

  test("should register a new client", async ({
    page,
    adminRegisterPage,
    autoCleanHelper,
  }) => {
    test.fail(
      true,
      "The test is failing because the success message is not being displayed after registering a new client.",
    );
    const userData = new UserBuilder().withAdministrador("false").build();

    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes(API_ENDPOINTS.USERS) &&
        response.status() === 201,
    );

    await adminRegisterPage.registerAsClient(
      userData.nome,
      userData.email,
      userData.password,
    );

    const response = await responsePromise;
    const responseBody = await response.json();

    autoCleanHelper.addUserId(responseBody._id);

    await expect(adminRegisterPage.alertSuccessMessage).toBeVisible();
    await expect(page).toHaveURL(E2E_ENDPOINTS.LIST_USERS);

    const userRow = page.getByRole("row").filter({ hasText: userData.email });
    await expect(userRow).toBeVisible();

    await expect(userRow.getByText(userData.administrador)).toBeVisible();
    await expect(page.getByText(userData.email)).toBeVisible();
  });
});
