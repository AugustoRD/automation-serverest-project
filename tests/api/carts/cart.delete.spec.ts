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

    test("should return an error when trying to complete a purchase without authentication", async ({
      cartController,
    }) => {
      const cartResponse = await cartController.completePurchase("");

      expect(cartResponse.status()).toBe(401);
      const responseBody = await cartResponse.json();
      expect(responseBody).toHaveProperty(
        "message",
        "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
      );
    });

    test("should block the purchase completion whith admin privileges", async ({
      cartController,
      admToken,
    }) => {
      test.fail(
        true,
        "This test is expected to fail because the API allows admins to complete purchases, which is not the intended behavior.",
      );
      const cartResponse = await cartController.completePurchase(admToken);

      expect(cartResponse.status()).toBe(403);
      const responseBody = await cartResponse.json();
      expect(responseBody).toHaveProperty("message", "Acesso negado");
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
