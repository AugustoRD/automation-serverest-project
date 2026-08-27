import { test, expect } from "../../../src/fixtures/api.fixture";

test.describe("DELETE /carrinhos", () => {
  test.describe("Complete Purchase", () => {
    test("should complete the purchase successfully", async ({
      cartController,
      setupHelper,
      admToken,
      clientContext,
    }) => {
      const product = await setupHelper.createProduct(admToken);
      await setupHelper.registerCartWithProducts(
        cartController,
        clientContext.token,
        [product],
      );

      const cartResponse = await cartController.completePurchase(
        clientContext.token,
      );

      expect(cartResponse.status()).toBe(200);
      const responseBody = await cartResponse.json();
      expect(responseBody).toHaveProperty(
        "message",
        "Registro excluído com sucesso",
      );
    });
  });

  test.describe("Cancel Purchase", () => {
    test("should cancel the purchase successfully", async ({
      cartController,
      setupHelper,
      admToken,
      clientContext,
    }) => {
      const product = await setupHelper.createProduct(admToken);
      await setupHelper.registerCartWithProducts(
        cartController,
        clientContext.token,
        [product],
      );

      const cartResponse = await cartController.cancelPurchase(
        clientContext.token,
      );

      expect(cartResponse.status()).toBe(200);
      const responseBody = await cartResponse.json();
      expect(responseBody).toHaveProperty(
        "message",
        "Registro excluído com sucesso. Estoque dos produtos reabastecido",
      );
    });
  });
});
