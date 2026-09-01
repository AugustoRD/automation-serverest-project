import { request as playwrightRequest } from "@playwright/test";
import { test as apiTest } from "./api.fixture";
import { LoginPage } from "../pages/LoginPage";

type UiFixtures = {
  loginPage: LoginPage;
  adminUser: { email: string; password: string };
  clientUser: { email: string; password: string };
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
});

export { expect } from "@playwright/test";
