import { test, expect } from "../../../src/fixtures/api.fixture";

test.describe("GET /carrinhos", () => {
  test.describe("List Carts", () => {
    test("should list all carts successfully", async ({
      cartController,
      setupHelper,
      admToken,
      clientContext: { token: clientToken },
    }) => {
      const product = await setupHelper.createProduct(admToken);
      await setupHelper.registerCartWithProducts(cartController, clientToken, [
        product,
      ]);

      const cartResponse = await cartController.getAllCarts(admToken);

      expect(cartResponse.status()).toBe(200);
      const responseBody = await cartResponse.json();

      expect(responseBody).toHaveProperty("carrinhos");
      expect(Array.isArray(responseBody.carrinhos)).toBe(true);

      expect(responseBody.carrinhos.length).toBeGreaterThan(0);

      expect(responseBody.quantidade).toBe(responseBody.carrinhos.length);
    });

    test("should list filtered carts by user ID successfully", async ({
      setupHelper,
      cartController,
      admToken,
      clientContext: { token: clientToken, id: clientUserId },
    }) => {
      const product = await setupHelper.createProduct(admToken);
      const cartId = await setupHelper.registerCartWithProducts(
        cartController,
        clientToken,
        [product],
      );

      const cartResponse = await cartController.getCartsByUserId(
        clientUserId,
        admToken,
      );

      expect(cartResponse.status()).toBe(200);
      const responseBody = await cartResponse.json();

      expect(responseBody).toHaveProperty("carrinhos");
      expect(Array.isArray(responseBody.carrinhos)).toBe(true);

      expect(responseBody.carrinhos.length).toBe(1);

      expect(responseBody.carrinhos[0].idUsuario).toBe(clientUserId);
    });

    test("should fail when a user tries to list all carts without admin privileges", async ({
      cartController,
      clientContext: { token: clientToken },
    }) => {
      test.fail(
        true,
        "This test is expected to fail due to access control restrictions.",
      );

      const cartResponse = await cartController.getAllCarts(clientToken);

      expect(cartResponse.status()).toBe(403);
      const responseBody = await cartResponse.json();

      expect(responseBody).toHaveProperty("message", "Acesso negado");
    });
  });

  test.describe("Get Cart by ID", () => {
    test("should get a cart by ID successfully", async ({
      setupHelper,
      cartController,
      admToken,
      clientContext: { token: clientToken },
    }) => {
      const product = await setupHelper.createProduct(admToken);
      const cartId = await setupHelper.registerCartWithProducts(
        cartController,
        clientToken,
        [product],
      );

      const cartResponse = await cartController.getCartById(
        cartId,
        clientToken,
      );

      expect(cartResponse.status()).toBe(200);
      const responseBody = await cartResponse.json();

      expect(responseBody).toHaveProperty("_id", cartId);
    });

    test("should block access to cart details for a user who is not the owner of the cart", async ({
      setupHelper,
      cartController,
      admToken,
      clientContext: { token: clientToken },
    }) => {
      test.fail(
        true,
        "This test is expected to fail due to access control restrictions.",
      );
      const product = await setupHelper.createProduct(admToken);
      const cartId = await setupHelper.registerCartWithProducts(
        cartController,
        clientToken,
        [product],
      );

      const { token: anotherUserToken } =
        await setupHelper.createAndLogin("false");

      const cartResponse = await cartController.getCartById(
        cartId,
        anotherUserToken,
      );
      expect(cartResponse.status()).toBe(401);

      const responseBody = await cartResponse.json();
      expect(responseBody).toHaveProperty("message", "Acesso negado");
    });
  });
});
