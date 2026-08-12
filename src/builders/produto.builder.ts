import { faker } from "@faker-js/faker";
import { Produto } from "../models/produtos.model";

export class ProdutoBuilder {
  private produto: Produto;

  constructor() {
    this.produto = {
      nome: faker.commerce.productName(),
      preco: parseInt(faker.commerce.price()),
      descricao: faker.commerce.productDescription(),
      quantidade: faker.number.int({ min: 1, max: 100 }),
    };
  }

  withNome(nome: string) {
    this.produto.nome = nome;
    return this;
  }

  withPreco(preco: number) {
    this.produto.preco = preco;
    return this;
  }

  withDescricao(descricao: string) {
    this.produto.descricao = descricao;
    return this;
  }

  withQuantidade(quantidade: number) {
    this.produto.quantidade = quantidade;
    return this;
  }

  build(): Produto {
    return this.produto;
  }
}
