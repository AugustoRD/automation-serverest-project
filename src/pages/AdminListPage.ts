import { Locator, Page } from "@playwright/test";

export class AdminListPage {
  readonly page: Page;
  readonly alertSuccessMessage: Locator;
  readonly alertErrorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alertSuccessMessage = page.getByText("Usuário deletado com sucesso", {
      exact: true,
    });
    this.alertErrorMessage = page.getByText("Usuário não encontrado", {
      exact: true,
    });
  }

  async deleteUser(email: string) {
    const userRow = this.page.getByRole("row").filter({ hasText: email });
    await userRow.getByRole("button", { name: "Excluir" }).click();
  }
}
