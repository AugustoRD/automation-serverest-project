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

  test("should create a new cart successfully", async () => {
    const newProduct = new ProductBuilder().build();
    const productResponse = await productController.createProduct(
      newProduct,
      admToken,
    );

    expect(productResponse.status()).toBe(201);
    const productId = (await productResponse.json())._id;

    const cartPayload = new CartBuilder().addProduct(productId, 1).build();

    const cartResponse = await cartController.createCart(
      cartPayload,
      clientToken,
    );

    expect(cartResponse.status()).toBe(201);
    expect(await cartResponse.json()).toHaveProperty(
      "message",
      "Cadastro realizado com sucesso",
    );
  });
});
