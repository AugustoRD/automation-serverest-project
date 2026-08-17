import { test, expect } from "@playwright/test";
import { UserBuilder } from "../../../src/builders/user.builder";
import { UserController } from "../../../src/controllers/user.controller";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { faker } from "@faker-js/faker";

test.describe("User API Tests", () => {
  let userController: UserController;
  let setupHelper: SetupHelper;

  test.beforeEach(async ({ request }) => {
    userController = new UserController(request);
    setupHelper = new SetupHelper(request);
  });

  test.afterEach(async () => {
    await setupHelper.tearDown();
  });

  test.describe("Register Scenarios", () => {
    test("should create a new user with admin role successfully", async () => {
      const newUser = new UserBuilder().build();
      const response = await userController.createUser(newUser);

      expect(response.status()).toBe(201);
      const responseBody = await response.json();

      expect(responseBody).toHaveProperty(
        "message",
        "Cadastro realizado com sucesso",
      );
      expect(responseBody).toHaveProperty("_id");

      setupHelper.addUserId(responseBody._id);
    });

    test("should create a new user with client role successfully", async () => {
      const newUser = new UserBuilder().withAdministrador("false").build();
      const response = await userController.createUser(newUser);

      expect(response.status()).toBe(201);
      const responseBody = await response.json();

      expect(responseBody).toHaveProperty(
        "message",
        "Cadastro realizado com sucesso",
      );
      expect(responseBody).toHaveProperty("_id");

      setupHelper.addUserId(responseBody._id);
    });

    test("should not create a new user with the same email", async () => {
      const newUser = new UserBuilder().build();
      const response = await userController.createUser(newUser);
      const responseBody = await response.json();
      expect(response.status()).toBe(201);
      setupHelper.addUserId(responseBody._id);

      const responseDuplicate = await userController.createUser(newUser);
      const responseBodyDuplicate = await responseDuplicate.json();
      expect(responseDuplicate.status()).toBe(400);
      expect(responseBodyDuplicate).toHaveProperty(
        "message",
        "Este email já está sendo usado",
      );
    });
  });

  test.describe("Edit Scenarios", () => {
    test("should edit a user successfully", async () => {
      const newUser = await setupHelper.registerUser("true");

      const editadedUser = new UserBuilder()
        .withEmail(newUser.email)
        .withNome("Augusto Editado")
        .build();

      const putResponse = await userController.updateUser(
        newUser.id,
        editadedUser,
      );
      expect(putResponse.status()).toBe(200);
      expect(await putResponse.json()).toHaveProperty(
        "message",
        "Registro alterado com sucesso",
      );
      const getResponse = await userController.getUserById(newUser.id);
      const bodyGet = await getResponse.json();

      expect(bodyGet).toHaveProperty("nome", "Augusto Editado");
    });

    test("should create a new user when sending invalid id for put", async () => {
      const invalidId = faker.string.alphanumeric(16);

      const editadedUser = new UserBuilder()
        // .withEmail(newUser.email)
        .withNome("faker.name.fullName()")
        .build();

      const putResponse = await userController.updateUser(
        invalidId,
        editadedUser,
      );
      expect(putResponse.status()).toBe(201);
      const putBody = await putResponse.json();
      expect(putBody).toHaveProperty(
        "message",
        "Cadastro realizado com sucesso",
      );

      setupHelper.addUserId(putBody._id);
    });

    test("should not edit user when email already exists", async ({
      request,
    }) => {
      const newUser = await setupHelper.registerUser("true");
      const invalidId = faker.string.alphanumeric(16);

      const editadedUser = new UserBuilder()
        .withEmail(newUser.email)
        .withNome("Augusto Editado")
        .build();

      const response = await userController.updateUser(invalidId, editadedUser);

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body).toHaveProperty("message", "Este email já está sendo usado");
    });
  });

  test.describe("List Scenarios", () => {
    test("should list all users successfully", async () => {
      const newUser = await setupHelper.registerUser("true");
      //expect(newUser.status()).toBe(201);
      const newUser2 = await setupHelper.registerUser("true");

      const response = await userController.getAllUsers();
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.usuarios).toBeInstanceOf(Array);
      //expect(body.length).toBe(2);
      //expect(body.usuarios).toHaveProperty("[0].nome", newUser.nome);
    });

    test("should list user with query parameter", async () => {
      const newUser = await setupHelper.registerUser("true");

      //const response = await usuarioController.listarUsuariosComQueryParams(
      //  `email=${newUser.email}`,
      // );

      const response = await userController.getUserWithQueryParams({
        email: newUser.email,
      });
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.usuarios).toBeInstanceOf(Array);
      expect(body.usuarios[0]).toHaveProperty("email", newUser.email);
    });

    test("should list user with path parameter", async () => {
      const newUser = await setupHelper.registerUser("true");

      const response = await userController.getUserById(newUser.id);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body).toHaveProperty("email", newUser.email);
    });

    test("shouldn't list user with invalid id", async () => {
      const invalidID = faker.string.alphanumeric(16);

      const response = await userController.getUserById(invalidID);
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("message", "Usuário não encontrado");
    });
  });

  test.describe("Delete Scenarios", () => {
    test("should delete user with success", async ({}) => {
      const newUser = await setupHelper.registerUser("true");

      const response = await userController.deleteUser(newUser.id);

      expect(response.status()).toBe(200);

      expect(await response.json()).toHaveProperty(
        "message",
        "Registro excluído com sucesso",
      );
    });

    test("should not delete user with invalid id", async ({}) => {
      //const newUser = await setupHelper.criarUsuario("true");

      const invalidID = faker.string.alphanumeric(16);

      const response = await userController.deleteUser(invalidID);

      expect(response.status()).toBe(200);

      expect(await response.json()).toHaveProperty(
        "message",
        "Nenhum registro excluído",
      );
    });
  });
});
