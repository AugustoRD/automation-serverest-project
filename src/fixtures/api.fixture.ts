import { test as base, expect } from "@playwright/test";
import { CartController } from "../controllers/cart.controller";
import { SetupHelper } from "../helpers/setup.helper";

type ApiFixtures = {
  cartController: CartController;
  setupHelper: SetupHelper;
  admToken: string;
  clientContext: { token: string; id: string };
};

export const test = base.extend<ApiFixtures>({
  cartController: async ({ request }, use) => {
    const controller = new CartController(request);
    await use(controller);
  },

  setupHelper: async ({ request }, use) => {
    const helper = new SetupHelper(request);
    await use(helper);
  },

  admToken: async ({ setupHelper }, use) => {
    const { token } = await setupHelper.createAndLogin("true");
    await use(token);
    await setupHelper.tearDown(token);
  },

  clientContext: async ({ setupHelper, cartController }, use) => {
    const clientUser = await setupHelper.createAndLogin("false");

    await use({ token: clientUser.token, id: clientUser.id });

    await cartController.cancelPurchase(clientUser.token);
  },
});

export { expect };
