import { UserBuilder } from "../../src/builders/user.builder";
import { test, expect } from "../../src/fixtures/e2e.fixture";

test.describe("Admin Delete UI Tests", () => {
  test("should delete an existing user", async ({
    page,
    adminListPage,
    autoCleanHelper,
  }) => {
    test.fail(
      true,
      "This test is failing because the success message is not being displayed after deleting a user.",
    );
    const userToDelete = await autoCleanHelper.registerUser("false");

    await page.reload();

    await adminListPage.deleteUser(userToDelete.email);

    await expect(adminListPage.alertSuccessMessage).toBeVisible();

    const userRow = page
      .getByRole("row")
      .filter({ hasText: userToDelete.email });
    await expect(userRow).not.toBeVisible();
  });
});
