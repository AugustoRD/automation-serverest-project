import { faker } from "@faker-js/faker";
import { User } from "../models/user.model";

export class UserBuilder {
  private user: User;

  constructor() {
    //sempre gera um usuário válido
    this.user = {
      nome: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      administrador: "true",
    };
  }

  // Métodos para customizar os dados no teste
  withNome(nome: string) {
    this.user.nome = nome;
    return this;
  }

  withEmail(email: string) {
    this.user.email = email;
    return this;
  }

  withPassword(password: string) {
    this.user.password = password;
    return this;
  }

  withAdministrador(isAdmin: "true" | "false") {
    this.user.administrador = isAdmin;
    return this;
  }

  // Método final que devolve o objeto pronto
  build(): User {
    return this.user;
  }
}
