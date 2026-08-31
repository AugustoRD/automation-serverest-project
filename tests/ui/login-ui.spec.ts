import {
  test,
  expect,
  request as playwrightRequest,
  APIRequestContext,
} from "@playwright/test";
import { LoginPage } from "../../src/pages/LoginPage";
import { SetupHelper } from "../../src/helpers/setup.helper";
import { UserBuilder } from "../../src/builders/user.builder";

test.describe("Login UI Tests", () => {
  let loginPage: LoginPage;
  let setupHelper: SetupHelper;
  let dynamicAdmin: any;
  let admToken: string;
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await playwrightRequest.newContext({
      baseURL: "http://localhost:3000",
    });
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);

    setupHelper = new SetupHelper(apiContext);

    dynamicAdmin = new UserBuilder().withAdministrador("true").build();

    const response = await apiContext.post("/usuarios", { data: dynamicAdmin });
    const responseBody = await response.json();

    setupHelper.addUserId(responseBody._id);

    const loginResponse = await apiContext.post("/login", {
      data: { email: dynamicAdmin.email, password: dynamicAdmin.password },
    });
    admToken = (await loginResponse.json()).authorization;

    await page.goto("/login");
  });

  test.afterEach(async () => {
    await setupHelper.tearDown(admToken);
  });

  test("should login with admin valid credentials", async ({ page }) => {
    await loginPage.login(dynamicAdmin.email, dynamicAdmin.password);

    await expect(page).toHaveURL(/\/admin\/home/);
    await expect(page.getByText("Bem Vindo")).toBeVisible();
  });
});
