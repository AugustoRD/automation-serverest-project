import test from "@playwright/test";
import { ProdutoController } from "../../../src/controllers/produto.controller";
import { Produto } from "../../../src/models/produtos.model";
import { ProdutoBuilder } from "../../../src/builders/produto.builder";
import { SetupHelper } from "../../../src/helpers/setup.helper";

test.describe("Produtos API Tests", () => {
  let produtoController: ProdutoController;
  let setupHelper: SetupHelper;
  let token: string;

  test.beforeEach(async ({ request }) => {
    produtoController = new ProdutoController(request);
    setupHelper = new SetupHelper(request);

    ({ token } = await setupHelper.criarUsuarioELogar("true"));
  });

  test("should create a new product successfully", async ({ request }) => {
    const newProduct = new ProdutoBuilder().build();

    const response = await produtoController.criarProduto(newProduct, token);
    test.expect(response.status()).toBe(201);
    test
      .expect(await response.json())
      .toHaveProperty("message", "Cadastro realizado com sucesso");
  });
});
