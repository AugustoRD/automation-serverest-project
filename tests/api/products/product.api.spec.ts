import test from "@playwright/test";
import { ProductController } from "../../../src/controllers/product.controller";
import { Product } from "../../../src/models/product.model";
import { ProductBuilder } from "../../../src/builders/product.builder";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { faker } from "@faker-js/faker";

test.describe("Product API Tests", () => {
  let productController: ProductController;
  let setupHelper: SetupHelper;
  let admToken: string;

  test.beforeEach(async ({ request }) => {
    productController = new ProductController(request);
    setupHelper = new SetupHelper(request);

    ({ token: admToken } = await setupHelper.createAndLogin("true"));
  });

  test.afterEach(async () => {
    await setupHelper.tearDown(admToken);
  });

  test.describe("Create Products", () => {
    test("should create a new product successfully", async () => {
      const newProduct = new ProductBuilder().build();

      const response = await productController.createProduct(
        newProduct,
        admToken,
      );
      test.expect(response.status()).toBe(201);
      const responseBody = await response.json();
      test
        .expect(responseBody)
        .toHaveProperty("message", "Cadastro realizado com sucesso");

      setupHelper.addProductId(responseBody._id);
    });

    test("should not create a new product with the same name", async () => {
      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      const createResponseBody = await createResponse.json();
      setupHelper.addProductId(createResponseBody._id);

      const response = await productController.createProduct(
        newProduct,
        admToken,
      );
      test.expect(response.status()).toBe(400);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Já existe produto com esse nome");
    });

    test("should not create a new product with a client token", async () => {
      const { token: clientToken } = await setupHelper.createAndLogin("false");

      const newProduct = new ProductBuilder().build();

      const response = await productController.createProduct(
        newProduct,
        clientToken,
      );
      test.expect(response.status()).toBe(403);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Rota exclusiva para administradores");
    });

    test("should not create a new product without a token", async () => {
      const newProduct = new ProductBuilder().build();
      const response = await productController.createProduct(newProduct, "");

      test.expect(response.status()).toBe(401);
      test
        .expect(await response.json())
        .toHaveProperty(
          "message",
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
        );
    });
  });

  test.describe("List Products", () => {
    test("should list all products successfully", async () => {
      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      setupHelper.addProductId((await createResponse.json())._id);

      const response = await productController.listProducts();
      const responseBody = await response.json();

      test.expect(response.status()).toBe(200);
      test.expect(responseBody.produtos).toBeInstanceOf(Array);
      test.expect(responseBody.quantidade).toBeGreaterThan(0);
    });

    test("should list products with query parameters", async () => {
      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      setupHelper.addProductId((await createResponse.json())._id);

      const response = await productController.listProductsWithQueryParams({
        nome: newProduct.nome,
      });
      const responseBody = await response.json();

      test.expect(response.status()).toBe(200);
      test.expect(responseBody.produtos).toBeInstanceOf(Array);
      test
        .expect(responseBody.produtos[0])
        .toHaveProperty("nome", newProduct.nome);
    });

    test("should list product by id", async () => {
      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.addProductId(productId);

      const response = await productController.getProductById(productId);
      const responseBody = await response.json();

      test.expect(response.status()).toBe(200);
      test.expect(responseBody).toHaveProperty("nome", newProduct.nome);
      test.expect(responseBody).toHaveProperty("preco", newProduct.preco);
      test
        .expect(responseBody)
        .toHaveProperty("descricao", newProduct.descricao);
      test
        .expect(responseBody)
        .toHaveProperty("quantidade", newProduct.quantidade);
    });

    test("should not list product with invalid id", async () => {
      const invalidID = faker.string.alphanumeric(16);

      const response = await productController.getProductById(invalidID);
      const responseBody = await response.json();

      test.expect(response.status()).toBe(400);
      test
        .expect(responseBody)
        .toHaveProperty("message", "Produto não encontrado");
    });
  });

  test.describe("Delete Products", () => {
    test("should delete product successfully", async () => {
      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      const response = await productController.deleteProduct(
        productId,
        admToken,
      );

      test.expect(response.status()).toBe(200);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Registro excluído com sucesso");
    });

    test("should not delete product with invalid id", async () => {
      const invalidID = faker.string.alphanumeric(16);

      const response = await productController.deleteProduct(
        invalidID,
        admToken,
      );
      const responseBody = await response.json();

      test.expect(response.status()).toBe(200);
      test
        .expect(responseBody)
        .toHaveProperty("message", "Nenhum registro excluído");
    });

    test("should not delete product with a client token", async () => {
      const { token: clientToken } = await setupHelper.createAndLogin("false");

      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.addProductId(productId);

      const response = await productController.deleteProduct(
        productId,
        clientToken,
      );

      test.expect(response.status()).toBe(403);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Rota exclusiva para administradores");
    });

    test("should not delete product without a token", async () => {
      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.addProductId(productId);

      const response = await productController.deleteProduct(productId, "");
      test.expect(response.status()).toBe(401);
      test
        .expect(await response.json())
        .toHaveProperty(
          "message",
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
        );
    });
  });

  test.describe("Edit Products", () => {
    test("should edit product successfully", async () => {
      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.addProductId(productId);

      const updatedProduct: Product = {
        ...newProduct,
        nome: faker.commerce.productName(),
        descricao: faker.commerce.productDescription(),
        preco: 150,
      };

      const response = await productController.updateProduct(
        productId,
        updatedProduct,
        admToken,
      );
      test.expect(response.status()).toBe(200);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Registro alterado com sucesso");
    });

    test("should create a new product when sending invalid id for put", async () => {
      const invalidId = faker.string.alphanumeric(16);

      const updatedProduct = new ProductBuilder().build();

      const response = await productController.updateProduct(
        invalidId,
        updatedProduct,
        admToken,
      );
      test.expect(response.status()).toBe(201);
      const responseBody = await response.json();
      test
        .expect(responseBody)
        .toHaveProperty("message", "Cadastro realizado com sucesso");

      setupHelper.addProductId(responseBody._id);
    });

    test("should not edit product when name already exists", async () => {
      const newProduct1 = new ProductBuilder().build();
      const createResponse1 = await productController.createProduct(
        newProduct1,
        admToken,
      );
      const productId1 = (await createResponse1.json())._id;
      setupHelper.addProductId(productId1);

      const newProduct2 = new ProductBuilder().build();
      const createResponse2 = await productController.createProduct(
        newProduct2,
        admToken,
      );
      const productId2 = (await createResponse2.json())._id;
      setupHelper.addProductId(productId2);

      const updatedProduct: Product = {
        ...newProduct2,
        nome: newProduct1.nome,
      };

      const response = await productController.updateProduct(
        productId2,
        updatedProduct,
        admToken,
      );
      test.expect(response.status()).toBe(400);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Já existe produto com esse nome");
    });

    test("should not edit product with a client token", async () => {
      const { token: clientToken } = await setupHelper.createAndLogin("false");

      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.addProductId(productId);

      const updatedProduct: Product = {
        ...newProduct,
        nome: faker.commerce.productName(),
      };

      const response = await productController.updateProduct(
        productId,
        updatedProduct,
        clientToken,
      );
      test.expect(response.status()).toBe(403);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Rota exclusiva para administradores");
    });

    test("should not edit product without a token", async () => {
      const newProduct = new ProductBuilder().build();
      const createResponse = await productController.createProduct(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.addProductId(productId);

      const updatedProduct: Product = {
        ...newProduct,
        nome: faker.commerce.productName(),
      };

      const response = await productController.updateProduct(
        productId,
        updatedProduct,
        "",
      );
      test.expect(response.status()).toBe(401);
      test
        .expect(await response.json())
        .toHaveProperty(
          "message",
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
        );
    });
  });
});
