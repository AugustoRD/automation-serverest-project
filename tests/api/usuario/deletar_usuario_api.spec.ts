import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";

test.describe("Usuario API Tests", () => {
  test("should delete user with success", async ({ request }) => {
    const randonName = faker.person.fullName();
    const randomEmail = faker.internet.email();

    //setup new user
    const newUser = {
      nome: randonName,
      email: randomEmail,
      password: "123456",
      administrador: "true",
    };

    const responseCreate = await request.post("/usuarios", {
      data: newUser,
    });

    expect(responseCreate.status()).toBe(201);

    //const userId = (await responseCreate.json())._id;

    const responseBody = await responseCreate.json();

    const userId = responseBody._id;

    const response = await request.delete(`/usuarios/${userId}`);

    expect(response.status()).toBe(200);

    expect(await response.json()).toHaveProperty(
      "message",
      "Registro excluído com sucesso",
    );
  });
});
