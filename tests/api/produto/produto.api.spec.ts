import test from "@playwright/test";
import { ProdutoController } from "../../../src/controllers/produto.controller";
import { Produto } from "../../../src/models/produtos.model";
import { ProdutoBuilder } from "../../../src/builders/produto.builder";
import { SetupHelper } from "../../../src/helpers/setup.helper";

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
});
