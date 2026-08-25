import { test, expect } from "@playwright/test";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { CartController } from "../../../src/controllers/cart.controller";

test.describe("GET /carrinhos", () => {
  let cartController: CartController;
  let setupHelper: SetupHelper;
  let admToken: string;
  let clientToken: string;
  let clientUserId: string;

  test.beforeEach(async ({ request }) => {
    cartController = new CartController(request);
    setupHelper = new SetupHelper(request);

    ({ token: admToken } = await setupHelper.createAndLogin("true"));
    ({ token: clientToken, id: clientUserId } =
      await setupHelper.createAndLogin("false"));
  });

  test.afterEach(async () => {
    await cartController.cancelPurchase(clientToken);

    await setupHelper.tearDown(admToken);
  });

  test("should list all carts successfully", async () => {
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

  test("should list filtered carts by user ID successfully", async () => {
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
});
