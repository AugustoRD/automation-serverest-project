import { APIRequestContext } from "@playwright/test";
import { UsuarioBuilder } from "../builders/usuario.builder";
import { UsuarioController } from "../controllers/usuario.controller";
import { LoginController } from "../controllers/login.controller";

export class SetupHelper {
  private usuarioController: UsuarioController;
  private loginController: LoginController;

  private userIDs: string[] = [];

  constructor(request: APIRequestContext) {
    this.usuarioController = new UsuarioController(request);
    this.loginController = new LoginController(request);
  }

  async criarUsuarioELogar(isAdmin: "true" | "false") {
    const usuario = await this.criarUsuario(isAdmin);
    const token = await this.loginController.obterTokenAutenticacao({
      email: usuario.email,
      password: usuario.password,
    });
    return { ...usuario, token };
  }

  async criarUsuario(isAdmin: "true" | "false") {
    const usuario = new UsuarioBuilder().withAdministrador(isAdmin).build();
    const response = await this.usuarioController.criarUsuario(usuario);
    const body = await response.json();

    this.userIDs.push(body._id);

    return {
      id: body._id,
      nome: usuario.nome,
      email: usuario.email,
      password: usuario.password,
      administrador: usuario.administrador,
    };
  }

  async limparDadosGerados() {
    for (const id of this.userIDs) {
      await this.usuarioController.deletarUsuario(id);
    }
    this.userIDs = [];
  }
}
