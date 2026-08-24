import { test, expect } from "@playwright/test";
import { CartController } from "../../../src/controllers/cart.controller";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { ProductBuilder } from "../../../src/builders/product.builder";
import { ProductController } from "../../../src/controllers/product.controller";
import { CartBuilder } from "../../../src/builders/cart.builder";

test.describe("POST /carrinhos", () => {
  let cartController: CartController;
  let productController: ProductController;
  let setupHelper: SetupHelper;
  let admToken: string;
  let clientToken: string;

  test.beforeEach(async ({ request }) => {
    productController = new ProductController(request);
    cartController = new CartController(request);
    setupHelper = new SetupHelper(request);

    ({ token: admToken } = await setupHelper.createAndLogin("true"));
    ({ token: clientToken } = await setupHelper.createAndLogin("false"));
  });

  test.afterEach(async () => {
    await cartController.cancelPurchase(clientToken);

    await setupHelper.tearDown(admToken);
  });

  test("should create a new cart successfully", async () => {
    const newProduct = new ProductBuilder().build();
    const productResponse = await productController.createProduct(
      newProduct,
      admToken,
    );

    expect(productResponse.status()).toBe(201);
    const productId = (await productResponse.json())._id;

    setupHelper.addProductId(productId);

    const cartPayload = new CartBuilder().addProduct(productId, 1).build();

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
});
