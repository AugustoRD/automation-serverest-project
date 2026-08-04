import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Listar Usuario API Tests", () => {
  let userIDs: string[] = [];

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
    const randomName = faker.person.fullName();
    userEmail = faker.internet.email();
    userPassword = faker.internet.password();

    const newUser = {
      nome: randomName,
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

  test("should list all users", async ({ request }) => {
    const response = await request.get("/usuarios");

    expect(response.status()).toBe(200);

    const users = await response.json();
    expect(users.usuarios).toBeInstanceOf(Array);
    expect(users.usuarios[0]).toHaveProperty("nome");
  });

  test("should list user with query parameters", async ({ request }) => {
    const response = await request.get("/usuarios?email=" + userEmail);

    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    expect(responseBody.usuarios).toBeInstanceOf(Array);
    expect(responseBody.usuarios[0]).toHaveProperty("email", userEmail);
  });

  test("should list user with path parameter", async ({ request }) => {
    const idUser = userIDs[0];

    //const response = await request.get("/usuarios/" + idUser);
    const response = await request.get(`/usuarios/${idUser}`);

    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty("email", userEmail);
    expect(responseBody).toHaveProperty("_id", idUser);
  });

  test("should list user with inexistent ID", async ({ request }) => {
    const inexistentId = faker.string.alphanumeric(16);

    const response = await request.get(`/usuarios/${inexistentId}`);

    expect(response.status()).toBe(400);

    const responseBody = await response.json();

    expect(responseBody).toHaveProperty("message", "Usuário não encontrado");
  });
});
