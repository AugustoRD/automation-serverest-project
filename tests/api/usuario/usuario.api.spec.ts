import { test, expect } from "@playwright/test";
import { UsuarioBuilder } from "../../../src/builders/usuario.builder";
import { UsuarioController } from "../../../src/controllers/usuario.controller";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { faker } from "@faker-js/faker";

test.describe("Usuários API Tests", () => {
  let usuarioController: UsuarioController;
  let setupHelper: SetupHelper;
  let userIDs: string[] = [];

  test.beforeEach(async ({ request }) => {
    usuarioController = new UsuarioController(request);
    setupHelper = new SetupHelper(request);
  });

  test.afterEach(async () => {
    await setupHelper.limparDadosGerados();
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

    test("should create a new user with client role successfully", async () => {
      const newUser = new UsuarioBuilder().withAdministrador("false").build();
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

    test("should not create a new user with the same email", async () => {
      const newUser = new UsuarioBuilder().build();
      const response = await usuarioController.criarUsuario(newUser);
      const responseBody = await response.json();
      expect(response.status()).toBe(201);
      userIDs.push(responseBody._id);

      const responseDuplicate = await usuarioController.criarUsuario(newUser);
      const responseBodyDuplicate = await responseDuplicate.json();
      expect(responseDuplicate.status()).toBe(400);
      expect(responseBodyDuplicate).toHaveProperty(
        "message",
        "Este email já está sendo usado",
      );
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

  test.describe("Cenários de Listagem", () => {
    test("should list all users successfully", async () => {
      const newUser = await setupHelper.criarUsuario("true");
      //expect(newUser.status()).toBe(201);
      const newUser2 = await setupHelper.criarUsuario("true");

      const response = await usuarioController.listarUsuarios();
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.usuarios).toBeInstanceOf(Array);
      //expect(body.length).toBe(2);
      //expect(body.usuarios).toHaveProperty("[0].nome", newUser.nome);
    });

    test("should list user with query parameter", async () => {
      const newUser = await setupHelper.criarUsuario("true");

      //const response = await usuarioController.listarUsuariosComQueryParams(
      //  `email=${newUser.email}`,
      // );

      const response = await usuarioController.listarUsuariosComQueryParams({
        email: newUser.email,
      });
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.usuarios).toBeInstanceOf(Array);
      expect(body.usuarios[0]).toHaveProperty("email", newUser.email);
    });

    test("should list user with path parameter", async () => {
      const newUser = await setupHelper.criarUsuario("true");

      const response = await usuarioController.buscarUsuarioPorId(newUser.id);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body).toHaveProperty("email", newUser.email);
    });

    test("shouldn't list user with invalid id", async () => {
      const invalidID = faker.string.alphanumeric(16);

      const response = await usuarioController.buscarUsuarioPorId(invalidID);
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("message", "Usuário não encontrado");
    });
  });

  test.describe("Cenários de Exclusão", () => {});
});
