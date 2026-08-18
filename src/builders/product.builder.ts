import { faker } from "@faker-js/faker";
import { Product } from "../models/product.model";

export class ProductBuilder {
  private product: Product;

  constructor() {
    this.product = {
      nome: `${faker.commerce.productName()} ${faker.string.uuid()}`,
      preco: parseInt(faker.commerce.price()),
      descricao: faker.commerce.productDescription(),
      quantidade: faker.number.int({ min: 1, max: 100 }),
    };
  }

  withNome(nome: string) {
    this.product.nome = nome;
    return this;
  }

  withPreco(preco: number) {
    this.product.preco = preco;
    return this;
  }

  withDescricao(descricao: string) {
    this.product.descricao = descricao;
    return this;
  }

  withQuantidade(quantidade: number) {
    this.product.quantidade = quantidade;
    return this;
  }

  build(): Product {
    return this.product;
  }
}
