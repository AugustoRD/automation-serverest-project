import { test, expect } from "@playwright/test";
import { UsuarioBuilder } from "../../../src/builders/usuario.builder";
import { UsuarioController } from "../../../src/controllers/usuario.controller";

test.describe("Usuários API Tests", () => {
  let usuarioController: UsuarioController;
  let userIDs: string[] = [];

  test.beforeEach(async ({ request }) => {
    usuarioController = new UsuarioController(request);
  });

  test.afterEach(async () => {
    for (const id of userIDs) {
      await usuarioController.deletarUsuario(id);
    }
    userIDs = [];
  });

  test.describe("Cadastro API tests", () => {
    test("should create a new user with admin role successfully", async () => {
      const newUser = new UsuarioBuilder().build();
      const response = await usuarioController.criarUsuario(newUser);

      expect(response.status()).toBe(201);
      const responseBody = await response.json();

      expect(responseBody).toHaveProperty(
        "message",
        "Cadastro realizado com sucesso",
      );
      expect(responseBody).toHaveProperty("_id");

      userIDs.push(responseBody._id);
    });
  });

  test.describe("Cenários de Edição", () => {
    test("should edit a user successfully", async () => {
      const newUser = new UsuarioBuilder().build();
      const postResponse = await usuarioController.criarUsuario(newUser);
      const { _id } = await postResponse.json();
      userIDs.push(_id);

      const dadosEditados = new UsuarioBuilder()
        .withEmail(newUser.email)
        .withNome("Augusto Editado")
        .build();

      const putResponse = await usuarioController.editarUsuario(
        _id,
        dadosEditados,
      );
      expect(putResponse.status()).toBe(200);
      expect(await putResponse.json()).toHaveProperty(
        "message",
        "Registro alterado com sucesso",
      );

      const getResponse = await usuarioController.buscarUsuarioPorId(_id);
      const bodyGet = await getResponse.json();

      expect(bodyGet).toHaveProperty("nome", "Augusto Editado");
    });
  });

  test.describe("Cenários de Listagem", () => {});

  test.describe("Cenários de Exclusão", () => {});
});
