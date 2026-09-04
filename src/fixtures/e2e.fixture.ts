import { request as playwrightRequest } from "@playwright/test";
import { test as apiTest } from "./api.fixture";
import { LoginPage } from "../pages/LoginPage";
import { ClientRegisterPage } from "../pages/ClientRegisterPage";
import { SetupHelper } from "../helpers/setup.helper";
import { AdminRegisterPage } from "../pages/AdminRegisterPage";

type UiFixtures = {
  loginPage: LoginPage;
  clientRegisterPage: ClientRegisterPage;
  adminRegisterPage: AdminRegisterPage;
  adminUser: { email: string; password: string };
  clientUser: { email: string; password: string };
  autoCleanHelper: SetupHelper;
};

export const test = apiTest.extend<UiFixtures>({
  request: async ({}, use) => {
    const apiContext = await playwrightRequest.newContext({
      baseURL: process.env.API_URL,
    });
    await use(apiContext);
    await apiContext.dispose();
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  adminUser: async ({ setupHelper }, use) => {
    const adminUser = await setupHelper.createAndLogin("true");

    await use({ email: adminUser.email, password: adminUser.password });

    await setupHelper.tearDown(adminUser.token);
  },

  clientUser: async ({ setupHelper }, use) => {
    const clientUser = await setupHelper.createAndLogin("false");

    await use({ email: clientUser.email, password: clientUser.password });

    await setupHelper.tearDown(clientUser.token);
  },

  clientRegisterPage: async ({ page }, use) => {
    const clientRegisterPage = new ClientRegisterPage(page);
    await page.goto("/cadastrarusuarios");
    await use(clientRegisterPage);
  },

  adminRegisterPage: async ({ page, admToken }, use) => {
    await page.goto("/login");
    await page.evaluate((token) => {
      localStorage.setItem("serverest/userToken", token);
    }, admToken);

    const adminRegisterPage = new AdminRegisterPage(page);
    await page.goto("/admin/cadastrarusuarios");
    await use(adminRegisterPage);
  },

  autoCleanHelper: async ({ request, admToken }, use) => {
    const helper = new SetupHelper(request);
    await use(helper);
    await helper.tearDown(admToken);
  },
});

export { expect } from "@playwright/test";
