import { CartPayload, ProductCart } from "../models/cart.model";

export class CartBuilder {
  private cart: CartPayload;

  constructor() {
    this.cart = {
      produtos: [],
    };
  }

  addProduct(idProduto: string, quantidade: number = 1): this {
    this.cart.produtos.push({
      idProduto,
      quantidade,
    });
    return this;
  }

  withProdutos(produtos: ProductCart[]): this {
    this.cart.produtos = produtos;
    return this;
  }

  build(): CartPayload {
    return this.cart;
  }
}
