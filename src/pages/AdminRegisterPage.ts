import { Locator, Page } from "@playwright/test";

export class AdminRegisterPage {
  readonly page: Page;

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly adminCheckbox: Locator;
  readonly registerButton: Locator;
  readonly alertSuccessMessage: Locator;
  readonly alertErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId("nome");
    this.emailInput = page.getByTestId("email");
    this.passwordInput = page.getByTestId("password");
    this.adminCheckbox = page.getByTestId("checkbox");
    this.registerButton = page.getByTestId("cadastrarUsuario");
    this.alertSuccessMessage = page.getByText(
      "Cadastro realizado com sucesso",
      { exact: true },
    );
    this.alertErrorMessage = page.getByText("Este email já está sendo usado", {
      exact: true,
    });
  }

  async registerAsAdmin(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.adminCheckbox.check();
    await this.registerButton.click();
  }

  async registerAsClient(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.adminCheckbox.uncheck();
    await this.registerButton.click();
  }
}
