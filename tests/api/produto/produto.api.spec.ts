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

  test.describe("Cadastro de produtos", () => {
    test("should create a new product successfully", async () => {
      const newProduct = new ProdutoBuilder().build();

      const response = await produtoController.criarProduto(
        newProduct,
        admToken,
      );
      test.expect(response.status()).toBe(201);
      test
        .expect(await response.json())
        .toHaveProperty("message", "Cadastro realizado com sucesso");
    });

    test("should not create a new product with the same name", async () => {
      const newProduct = new ProdutoBuilder().build();

      await produtoController.criarProduto(newProduct, admToken);

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
      await produtoController.criarProduto(newProduct, admToken);

      const response = await produtoController.listarProdutos();
      const responseBody = await response.json();

      test.expect(response.status()).toBe(200);
      test.expect(responseBody.produtos).toBeInstanceOf(Array);
      test.expect(responseBody.quantidade).toBeGreaterThan(0);
    });

    test("should list products with query parameters", async () => {
      const newProduct = new ProdutoBuilder().build();
      await produtoController.criarProduto(newProduct, admToken);

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
});
