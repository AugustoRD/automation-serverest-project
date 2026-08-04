import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Login API Tests", () => {
  let userIDs: string[] = [];

  //let userEmail: string;
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
    const randonName = faker.person.fullName();
    userEmail = faker.internet.email();
    userPassword = faker.internet.password();

    const newUser = {
      nome: randonName,
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

  test("should login with success", async ({ request }) => {
    const loginData = {
      email: userEmail,
      password: userPassword,
    };

    const response = await request.post("/login", {
      data: loginData,
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Login realizado com sucesso",
    );
    expect(responseBody).toHaveProperty("authorization");
  });

  test("should fail login with email not registered", async ({ request }) => {
    const emailNotRegistered = faker.internet.email();
    const loginData = {
      email: emailNotRegistered,
      password: userPassword,
    };

    const response = await request.post("/login", {
      data: loginData,
    });

    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty(
      "message",
      "Email e/ou senha inválidos",
    );
  });
});
