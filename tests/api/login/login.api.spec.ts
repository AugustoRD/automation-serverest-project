import { test, expect } from "@playwright/test";
import { LoginController } from "../../../src/controllers/login.controller";
import { faker } from "@faker-js/faker";
import { SetupHelper } from "../../../src/helpers/setup.helper";

test.describe("Login API Tests", () => {
  let loginController: LoginController;
  let setupHelper: SetupHelper;

  test.beforeEach(async ({ request }) => {
    loginController = new LoginController(request);
    setupHelper = new SetupHelper(request);
  });

  test.afterEach(async () => {
    await setupHelper.tearDown();
  });

  test("should login with success", async () => {
    const newUser = await setupHelper.registerUser("true");

    const loginData = {
      email: newUser.email,
      password: newUser.password,
    };

    const response = await loginController.doLogin(loginData);
    const responseBody = await response.json();
    expect(response.status()).toBe(200);
    expect(responseBody).toHaveProperty(
      "message",
      "Login realizado com sucesso",
    );
    expect(responseBody).toHaveProperty("authorization");
  });

  test("should fail login with email not registered", async () => {
    const loginData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    const response = await loginController.doLogin(loginData);
    const responseBody = await response.json();
    expect(response.status()).toBe(401);
    expect(responseBody).toHaveProperty(
      "message",
      "Email e/ou senha inválidos",
    );
  });

  test("should fail login with wrong password", async () => {
    const newUser = await setupHelper.registerUser("true");

    const loginData = {
      email: newUser.email,
      password: faker.internet.password(),
    };

    const response = await loginController.doLogin(loginData);
    const responseBody = await response.json();
    expect(response.status()).toBe(401);
    expect(responseBody).toHaveProperty(
      "message",
      "Email e/ou senha inválidos",
    );
  });
});
