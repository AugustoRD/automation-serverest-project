import { Locator, Page } from "@playwright/test";

export class ClientRegisterPage {
  readonly page: Page;

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  // readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly alertSuccessMessage: Locator;
  readonly alertErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId("nome");
    this.emailInput = page.getByTestId("email");
    this.passwordInput = page.getByTestId("password");
    this.registerButton = page.getByTestId("cadastrar");
    this.alertSuccessMessage = page.getByText(
      "Cadastro realizado com sucesso",
      { exact: true },
    );
    this.alertErrorMessage = page.getByText("Este email já está sendo usado", {
      exact: true,
    });
  }

  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.registerButton.click();
  }
}
