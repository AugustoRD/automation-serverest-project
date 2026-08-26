import { test, expect } from "@playwright/test";
import { UserBuilder } from "../../../src/builders/user.builder";
import { UserController } from "../../../src/controllers/user.controller";
import { SetupHelper } from "../../../src/helpers/setup.helper";
import { faker } from "@faker-js/faker";

test.describe("User API Tests", () => {
  let userController: UserController;
  let setupHelper: SetupHelper;
  let admToken: string;

  test.beforeEach(async ({ request }) => {
    userController = new UserController(request);
    setupHelper = new SetupHelper(request);
    ({ token: admToken } = await setupHelper.createAndLogin("true"));
  });

  test.afterEach(async () => {
    await setupHelper.tearDown();
  });

  test.describe("Register Scenarios", () => {
    test("should create a new user with admin role successfully", async () => {
      const newUser = new UserBuilder().build();
      const response = await userController.createUser(newUser, admToken);

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
      const response = await userController.createUser(newUser, admToken);
      const responseBody = await response.json();
      expect(response.status()).toBe(201);
      setupHelper.addUserId(responseBody._id);

      const responseDuplicate = await userController.createUser(
        newUser,
        admToken,
      );
      const responseBodyDuplicate = await responseDuplicate.json();
      expect(responseDuplicate.status()).toBe(400);
      expect(responseBodyDuplicate).toHaveProperty(
        "message",
        "Este email já está sendo usado",
      );
    });

    test("should block admin creation without token", async () => {
      test.fail(
        true,
        "BUG: Privilege Escalation. API allows creating admins without token. Expecting 403.",
      );

      const newUser = new UserBuilder().build();
      const response = await userController.createUser(newUser, "");
      const responseBody = await response.json();
      setupHelper.addUserId(responseBody._id);

      expect(response.status()).toBe(403);
    });

    test("should block client token from creating an admin", async () => {
      test.fail(
        true,
        "BUG: Privilege Escalation. Client token can create admin. Expecting 403.",
      );

      const { token: clientToken } = await setupHelper.createAndLogin("false");

      const userAdmin = new UserBuilder().build();

      const response = await userController.createUser(userAdmin, clientToken);
      const responseBody = await response.json();
      setupHelper.addUserId(responseBody._id);

      expect(response.status()).toBe(403);
    });
  });

  test.describe("Edit Scenarios", () => {
    test("should edit a user successfully", async () => {
      const newUser = await setupHelper.registerUser("true");

      const editadedUser = new UserBuilder()
        .withEmail(newUser.email)
        .withNome(faker.person.fullName())
        .build();

      const putResponse = await userController.updateUser(
        newUser.id,
        editadedUser,
        admToken,
      );
      expect(putResponse.status()).toBe(200);
      expect(await putResponse.json()).toHaveProperty(
        "message",
        "Registro alterado com sucesso",
      );
      const getResponse = await userController.getUserById(newUser.id);
      const bodyGet = await getResponse.json();

      expect(bodyGet).toHaveProperty("nome", editadedUser.nome);
    });

    test("should create a new user when sending invalid id for put", async () => {
      const invalidId = faker.string.alphanumeric(16);

      const editadedUser = new UserBuilder()
        .withNome(faker.person.fullName())
        .build();

      const putResponse = await userController.updateUser(
        invalidId,
        editadedUser,
        admToken,
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
        .withNome(faker.person.fullName())
        .build();

      const response = await userController.updateUser(
        invalidId,
        editadedUser,
        admToken,
      );

      expect(response.status()).toBe(400);

      const body = await response.json();
      expect(body).toHaveProperty("message", "Este email já está sendo usado");
    });

    test("should block user edition without token", async () => {
      test.fixme(
        true,
        "BUG: Privilege Escalation. API allows edition without token. Study Pattern: fixme applied.",
      );

      const newUser = await setupHelper.registerUser("true");
      const editadedUser = new UserBuilder()
        .withNome(faker.person.fullName())
        .build();

      const putResponse = await userController.updateUser(
        newUser.id,
        editadedUser,
        "",
      );

      expect(putResponse.status()).toBe(401);
    });

    test("should block client from editing another user's profile", async () => {
      test.fixme(
        true,
        "BUG: IDOR. Client can edit other users' profiles. Study Pattern: fixme applied.",
      );

      const userAdmin = await setupHelper.registerUser("true");

      const { token: clientToken } = await setupHelper.createAndLogin("false");

      const maliciousPayload = new UserBuilder()
        .withNome(faker.person.fullName())
        .build();

      const putResponse = await userController.updateUser(
        userAdmin.id,
        maliciousPayload,
        clientToken,
      );

      expect(putResponse.status()).toBe(403);
    });
  });

  test.describe("List Scenarios", () => {
    test("Admin should list all users successfully", async () => {
      await setupHelper.registerUser("true");
      await setupHelper.registerUser("true");

      const response = await userController.getAllUsers(admToken);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.usuarios).toBeInstanceOf(Array);
      expect(body.quantidade).toBeGreaterThanOrEqual(2);
    });

    test("Admin should list user with query parameter", async () => {
      const newUser = await setupHelper.registerUser("true");

      const response = await userController.getUserWithQueryParams(
        {
          email: newUser.email,
        },
        admToken,
      );
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body.usuarios).toBeInstanceOf(Array);
      expect(body.usuarios[0]).toHaveProperty("email", newUser.email);
    });

    test("Admin should list user with path parameter", async () => {
      const newUser = await setupHelper.registerUser("true");

      const response = await userController.getUserById(newUser.id);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body).toHaveProperty("email", newUser.email);
    });

    test("shouldn't list user with invalid id", async () => {
      const invalidID = faker.string.alphanumeric(16);

      const response = await userController.getUserById(invalidID, admToken);
      const body = await response.json();

      expect(response.status()).toBe(400);
      expect(body).toHaveProperty("message", "Usuário não encontrado");
    });

    test("Client should list their own profile successfully", async () => {
      const { token: clientToken, id: clientId } =
        await setupHelper.createAndLogin("false");

      const response = await userController.getUserById(clientId, clientToken);
      const body = await response.json();

      expect(response.status()).toBe(200);
      expect(body).toHaveProperty("_id", clientId);
    });

    test("should block unauthenticated users from listing all users", async () => {
      test.fail(
        true,
        "BUG: Data Leak. API allows unauthenticated users to list all data. Expecting 401.",
      );

      const response = await userController.getAllUsers("");

      expect(response.status()).toBe(401);
    });

    test("should block client role from listing all users", async () => {
      test.fail(
        true,
        "BUG: Privilege Escalation. Clients can list all users. Expecting 403.",
      );

      const { token: clientToken } = await setupHelper.createAndLogin("false");

      const response = await userController.getAllUsers(clientToken);

      expect(response.status()).toBe(403);
    });
  });

  test.describe("Delete Scenarios", () => {
    test("Admin should delete user with success", async ({}) => {
      const newUser = await setupHelper.registerUser("true");

      const response = await userController.deleteUser(newUser.id, admToken);

      expect(response.status()).toBe(200);

      expect(await response.json()).toHaveProperty(
        "message",
        "Registro excluído com sucesso",
      );
    });

    test("Admin should not delete user with invalid id", async ({}) => {
      const invalidID = faker.string.alphanumeric(16);

      const response = await userController.deleteUser(invalidID, admToken);

      expect(response.status()).toBe(200);

      expect(await response.json()).toHaveProperty(
        "message",
        "Nenhum registro excluído",
      );
    });

    test("should block user deletion without auth token", async () => {
      test.fail(
        true,
        "BUG: API allows DELETE without token. Expecting 401 Unauthorized.",
      );

      const newUser = await setupHelper.registerUser("true");

      const response = await userController.deleteUser(newUser.id, "");

      expect(response.status()).toBe(401);
    });

    test("should block client from deleting another user (IDOR)", async () => {
      test.fail(
        true,
        "BUG: IDOR. Client can delete other users' profiles. Expecting 403 Forbidden.",
      );

      const userAdmin = await setupHelper.registerUser("true");

      const { token: clientToken } = await setupHelper.createAndLogin("false");

      const response = await userController.deleteUser(
        userAdmin.id,
        clientToken,
      );

      expect(response.status()).toBe(403);
    });
  });
});
