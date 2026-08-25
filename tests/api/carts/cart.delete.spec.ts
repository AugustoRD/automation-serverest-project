import { test, expect } from "@playwright/test";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { CartController } from "../../../src/controllers/cart.controller";

test.describe("DELETE /carrinhos", () => {
  let cartController: CartController;
  let setupHelper: SetupHelper;
  let admToken: string;
  let clientToken: string;

  test.beforeEach(async ({ request }) => {
    cartController = new CartController(request);
    setupHelper = new SetupHelper(request);

    ({ token: admToken } = await setupHelper.createAndLogin("true"));
    ({ token: clientToken } = await setupHelper.createAndLogin("false"));
  });

  test.afterEach(async () => {
    await cartController.cancelPurchase(clientToken);

    await setupHelper.tearDown(admToken);
  });

  test.describe("Complete Purchase", () => {
    test("should complete the purchase successfully", async () => {
      const product = await setupHelper.createProduct(admToken);
      await setupHelper.registerCartWithProducts(cartController, clientToken, [
        product,
      ]);

      const cartResponse = await cartController.completePurchase(clientToken);

      expect(cartResponse.status()).toBe(200);
      const responseBody = await cartResponse.json();
      expect(responseBody).toHaveProperty(
        "message",
        "Registro excluído com sucesso",
      );
    });
  });

  test.describe("Cancel Purchase", () => {
    test("should cancel the purchase successfully", async () => {
      const product = await setupHelper.createProduct(admToken);
      await setupHelper.registerCartWithProducts(cartController, clientToken, [
        product,
      ]);

      const cartResponse = await cartController.cancelPurchase(clientToken);

      expect(cartResponse.status()).toBe(200);
      const responseBody = await cartResponse.json();
      expect(responseBody).toHaveProperty(
        "message",
        "Registro excluído com sucesso. Estoque dos produtos reabastecido",
      );
    });
  });
});
