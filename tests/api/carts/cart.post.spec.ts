import { test, expect } from "../../../src/fixtures/api.fixture";
import { CartBuilder } from "../../../src/builders/cart.builder";

test.describe("POST /carrinhos", () => {
  test("should create a new cart successfully with 1 product", async ({
    cartController,
    setupHelper,
    admToken,
    clientContext,
  }) => {
    const product = await setupHelper.createProduct(admToken);

    const cartPayload = new CartBuilder().addProduct(product.id).build();

    const cartResponse = await cartController.createCart(
      cartPayload,
      clientContext.token,
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

  test("should create a new cart successfully with multiple products", async ({
    cartController,
    setupHelper,
    admToken,
    clientContext,
  }) => {
    const product1 = await setupHelper.createProduct(admToken);
    const product2 = await setupHelper.createProduct(admToken);

    const cartPayload = new CartBuilder()
      .addProduct(product1.id, 1)
      .addProduct(product2.id, 2)
      .build();

    const cartResponse = await cartController.createCart(
      cartPayload,
      clientContext.token,
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

  test("should return an error when trying to create a cart with quantity greater than stock", async ({
    cartController,
    setupHelper,
    admToken,
    clientContext,
  }) => {
    const product = await setupHelper.createProduct(admToken);

    const cartPayload = new CartBuilder()
      .addProduct(product.id, product.quantidade + 1)
      .build();

    const cartResponse = await cartController.createCart(
      cartPayload,
      clientContext.token,
    );

    expect(cartResponse.status()).toBe(400);
    const responseBody = await cartResponse.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Produto não possui quantidade suficiente",
    );
  });
  test("should return an error when trying to create a cart with duplicate products", async ({
    cartController,
    setupHelper,
    admToken,
    clientContext,
  }) => {
    const product = await setupHelper.createProduct(admToken);

    const cartPayload = new CartBuilder()
      .addProduct(product.id, 1)
      .addProduct(product.id, 2)
      .build();

    const cartResponse = await cartController.createCart(
      cartPayload,
      clientContext.token,
    );

    expect(cartResponse.status()).toBe(400);
    const responseBody = await cartResponse.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Não é permitido possuir produto duplicado",
    );
  });

  test("should return an error when trying to create two carts simultaneously", async ({
    cartController,
    setupHelper,
    admToken,
    clientContext,
  }) => {
    const product = await setupHelper.createProduct(admToken);

    const cartPayload = new CartBuilder().addProduct(product.id).build();

    const firstCartResponse = await cartController.createCart(
      cartPayload,
      clientContext.token,
    );

    expect(firstCartResponse.status()).toBe(201);

    const firstCartResponseBody = await firstCartResponse.json();
    expect(firstCartResponseBody).toHaveProperty(
      "message",
      "Cadastro realizado com sucesso",
    );

    const secondCartResponse = await cartController.createCart(
      cartPayload,
      clientContext.token,
    );

    expect(secondCartResponse.status()).toBe(400);
    const secondCartResponseBody = await secondCartResponse.json();
    expect(secondCartResponseBody).toHaveProperty(
      "message",
      "Não é permitido ter mais de 1 carrinho",
    );
  });

  test("should return an error when trying to create a cart without authentication", async ({
    cartController,
    setupHelper,
    admToken,
  }) => {
    const product = await setupHelper.createProduct(admToken);

    const cartPayload = new CartBuilder().addProduct(product.id).build();

    const cartResponse = await cartController.createCart(cartPayload, "");

    expect(cartResponse.status()).toBe(401);

    const responseBody = await cartResponse.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
    );
  });
});
