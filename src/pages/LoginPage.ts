import { Page, Locator } from "@playwright/test";

export const LoginMessages = {
  INVALID_CREDENTIALS: "Email e/ou senha inválidos",
};

export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  readonly alertErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId("email");
    this.passwordInput = page.getByTestId("senha");
    this.loginButton = page.getByTestId("entrar");
    this.alertErrorMessage = page.locator(".alert.alert-secondary > span");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
