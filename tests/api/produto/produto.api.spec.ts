import test from "@playwright/test";
import { ProdutoController } from "../../../src/controllers/produto.controller";
import { Produto } from "../../../src/models/produtos.model";
import { ProdutoBuilder } from "../../../src/builders/produto.builder";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { faker } from "@faker-js/faker";

test.describe("Produtos API Tests", () => {
  let produtoController: ProdutoController;
  let setupHelper: SetupHelper;
  let admToken: string;

  test.beforeEach(async ({ request }) => {
    produtoController = new ProdutoController(request);
    setupHelper = new SetupHelper(request);

    ({ token: admToken } = await setupHelper.criarUsuarioELogar("true"));
  });

  test.afterEach(async () => {
    await setupHelper.limparDadosGerados(admToken);
  });

  test.describe("Cadastro de produtos", () => {
    test("should create a new product successfully", async () => {
      const newProduct = new ProdutoBuilder().build();

      const response = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      test.expect(response.status()).toBe(201);
      const responseBody = await response.json();
      test
        .expect(responseBody)
        .toHaveProperty("message", "Cadastro realizado com sucesso");

      setupHelper.adicionarProdutoId(responseBody._id);
    });

    test("should not create a new product with the same name", async () => {
      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      const createResponseBody = await createResponse.json();
      setupHelper.adicionarProdutoId(createResponseBody._id);

      const response = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      test.expect(response.status()).toBe(400);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Já existe produto com esse nome");
    });

    test("should not create a new product with a client token", async () => {
      const { token: clientToken } =
        await setupHelper.criarUsuarioELogar("false");

      const newProduct = new ProdutoBuilder().build();

      const response = await produtoController.criarProduto(
        newProduct,
        clientToken,
      );
      test.expect(response.status()).toBe(403);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Rota exclusiva para administradores");
    });

    test("should not create a new product without a token", async () => {
      const newProduct = new ProdutoBuilder().build();
      const response = await produtoController.criarProduto(newProduct, "");

      test.expect(response.status()).toBe(401);
      test
        .expect(await response.json())
        .toHaveProperty(
          "message",
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
        );
    });
  });

  test.describe("Listagem de produtos", () => {
    test("should list all products successfully", async () => {
      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      setupHelper.adicionarProdutoId((await createResponse.json())._id);

      const response = await produtoController.listarProdutos();
      const responseBody = await response.json();

      test.expect(response.status()).toBe(200);
      test.expect(responseBody.produtos).toBeInstanceOf(Array);
      test.expect(responseBody.quantidade).toBeGreaterThan(0);
    });

    test("should list products with query parameters", async () => {
      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      setupHelper.adicionarProdutoId((await createResponse.json())._id);

      const response = await produtoController.listarProdutosComQueryParams({
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
      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.adicionarProdutoId(productId);

      const response = await produtoController.buscarProdutoPorId(productId);
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

      const response = await produtoController.buscarProdutoPorId(invalidID);
      const responseBody = await response.json();

      test.expect(response.status()).toBe(400);
      test
        .expect(responseBody)
        .toHaveProperty("message", "Produto não encontrado");
    });
  });

  test.describe("Exclusão de produtos", () => {
    test("should delete product successfully", async () => {
      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      const response = await produtoController.deletarProduto(
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

      const response = await produtoController.deletarProduto(
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
      const { token: clientToken } =
        await setupHelper.criarUsuarioELogar("false");

      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.adicionarProdutoId(productId);

      const response = await produtoController.deletarProduto(
        productId,
        clientToken,
      );

      test.expect(response.status()).toBe(403);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Rota exclusiva para administradores");
    });

    test("should not delete product without a token", async () => {
      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.adicionarProdutoId(productId);

      const response = await produtoController.deletarProduto(productId, "");
      test.expect(response.status()).toBe(401);
      test
        .expect(await response.json())
        .toHaveProperty(
          "message",
          "Token de acesso ausente, inválido, expirado ou usuário do token não existe mais",
        );
    });
  });

  test.describe("Cenários de Edição", () => {
    test("should edit product successfully", async () => {
      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.adicionarProdutoId(productId);

      //const updatedProduct: Produto = {
      //  nome: "Produto Atualizado",
      // preco: 99,
      //descricao: "Descrição atualizada do produto",
      // quantidade: 50,
      // };
      const updatedProduct: Produto = {
        ...newProduct,
        nome: faker.commerce.productName(),
        descricao: faker.commerce.productDescription(),
        preco: 150,
      };

      const response = await produtoController.editarProduto(
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

      const updatedProduct = new ProdutoBuilder().build();

      const response = await produtoController.editarProduto(
        invalidId,
        updatedProduct,
        admToken,
      );
      test.expect(response.status()).toBe(201);
      const responseBody = await response.json();
      test
        .expect(responseBody)
        .toHaveProperty("message", "Cadastro realizado com sucesso");

      setupHelper.adicionarProdutoId(responseBody._id);
    });

    test("should not edit product when name already exists", async () => {
      const newProduct1 = new ProdutoBuilder().build();
      const createResponse1 = await produtoController.criarProduto(
        newProduct1,
        admToken,
      );
      const productId1 = (await createResponse1.json())._id;
      setupHelper.adicionarProdutoId(productId1);

      const newProduct2 = new ProdutoBuilder().build();
      const createResponse2 = await produtoController.criarProduto(
        newProduct2,
        admToken,
      );
      const productId2 = (await createResponse2.json())._id;
      setupHelper.adicionarProdutoId(productId2);

      const updatedProduct: Produto = {
        ...newProduct2,
        nome: newProduct1.nome,
      };

      const response = await produtoController.editarProduto(
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
      const { token: clientToken } =
        await setupHelper.criarUsuarioELogar("false");

      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.adicionarProdutoId(productId);

      const updatedProduct: Produto = {
        ...newProduct,
        nome: faker.commerce.productName(),
      };

      const response = await produtoController.editarProduto(
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
      const newProduct = new ProdutoBuilder().build();
      const createResponse = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      const productId = (await createResponse.json())._id;

      setupHelper.adicionarProdutoId(productId);

      const updatedProduct: Produto = {
        ...newProduct,
        nome: faker.commerce.productName(),
      };

      const response = await produtoController.editarProduto(
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
