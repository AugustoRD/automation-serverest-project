import { faker } from "@faker-js/faker";
import { Usuario } from "../models/usuario.model";

export class UsuarioBuilder {
  private usuario: Usuario;

  constructor() {
    //sempre gera um usuário válido
    this.usuario = {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      administrador: "true",
    };
  }

  // Métodos para customizar os dados no teste
  withNome(nome: string) {
    this.usuario.nome = nome;
    return this;
  }

  withEmail(email: string) {
    this.usuario.email = email;
    return this;
  }

  withPassword(password: string) {
    this.usuario.password = password;
    return this;
  }

  withAdministrador(isAdmin: "true" | "false") {
    this.usuario.administrador = isAdmin;
    return this;
  }

  // Método final que devolve o objeto pronto
  build(): Usuario {
    return this.usuario;
  }
}
