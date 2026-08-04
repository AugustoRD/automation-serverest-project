import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Edit usuario API Tests", () => {
  let userIDs: string[] = [];

  let userName = "";
  let userEmail = "";
  let userPassword = "";

  test.afterEach(async ({ request }) => {
    for (const userId of userIDs) {
      const response = await request.delete(`/usuarios/${userId}`);
      expect(response.status()).toBe(200);
    }
    userIDs = [];
  });

  test.beforeEach(async ({ request }) => {
    // Setup new user
    userName = faker.person.fullName();
    userEmail = faker.internet.email();
    userPassword = faker.internet.password();

    const newUser = {
      nome: userName,
      email: userEmail,
      password: userPassword,
      administrador: "true",
    };

    const response = await request.post("/usuarios", {
      data: newUser,
    });

    expect(response.status()).toBe(201);

    const createdUser = await response.json();
    userIDs.push(createdUser._id);
  });

  test("should edit user with success", async ({ request }) => {
    const response = await request.put(`/usuarios/${userIDs[0]}`, {
      data: {
        nome: "Updated Name",
        email: userEmail,
        password: userPassword,
        administrador: "true",
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Registro alterado com sucesso",
    );

    const responseGet = await request.get(`/usuarios/${userIDs[0]}`);
    expect(responseGet.status()).toBe(200);

    const responseBodyGet = await responseGet.json();

    expect(responseBodyGet).toHaveProperty("nome", "Updated Name");
  });

  test("should create user when send invalid id for put", async ({
    request,
  }) => {
    const invalidId = faker.string.alphanumeric(16);

    const response = await request.put(`/usuarios/${invalidId}`, {
      data: {
        nome: "Updated Name",
        email: faker.internet.email(),
        password: userPassword,
        administrador: "true",
      },
    });

    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Cadastro realizado com sucesso",
    );

    expect(responseBody).toHaveProperty("_id");
    userIDs.push(responseBody._id);
  });

  test("should not edit user when email already exists", async ({
    request,
  }) => {
    const invalidId = faker.string.alphanumeric(16);

    const response = await request.put(`/usuarios/${invalidId}`, {
      data: {
        nome: userName,
        email: userEmail,
        password: userPassword,
        administrador: "true",
      },
    });

    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Este email já está sendo usado",
    );
  });
});
