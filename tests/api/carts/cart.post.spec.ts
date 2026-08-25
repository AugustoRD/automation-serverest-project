import { test, expect } from "@playwright/test";
import { CartController } from "../../../src/controllers/cart.controller";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { CartBuilder } from "../../../src/builders/cart.builder";

test.describe("POST /carrinhos", () => {
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

  test("should create a new cart successfully with 1 product", async () => {
    const product = await setupHelper.createProduct(admToken);

    const cartPayload = new CartBuilder().addProduct(product.id, 1).build();

    const cartResponse = await cartController.createCart(
      cartPayload,
      clientToken,
    );

    expect(cartResponse.status()).toBe(201);
    const responseBody = await cartResponse.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Cadastro realizado com sucesso",
    );
    expect(responseBody).toHaveProperty("_id");
    expect(typeof responseBody._id).toBe("string");
  });

  test("should create a new cart successfully with multiple products", async () => {
    const product1 = await setupHelper.createProduct(admToken);
    const product2 = await setupHelper.createProduct(admToken);

    const cartPayload = new CartBuilder()
      .addProduct(product1.id, 1)
      .addProduct(product2.id, 2)
      .build();

    const cartResponse = await cartController.createCart(
      cartPayload,
      clientToken,
    );

    expect(cartResponse.status()).toBe(201);
    const responseBody = await cartResponse.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Cadastro realizado com sucesso",
    );
    expect(responseBody).toHaveProperty("_id");
    expect(typeof responseBody._id).toBe("string");

    const getCartResponse = await cartController.getCartById(responseBody._id);
    expect(getCartResponse.status()).toBe(200);
    const cartData = await getCartResponse.json();
    expect(cartData.quantidadeTotal).toBe(3);

    const expectedTotalPrice = product1.preco * 1 + product2.preco * 2;
    expect(cartData.precoTotal).toBe(expectedTotalPrice);
  });
});
