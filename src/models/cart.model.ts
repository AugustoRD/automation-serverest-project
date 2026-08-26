export interface ProductCart {
  idProduto: string;
  quantidade: number;
}

export interface CartPayload {
  produtos: ProductCart[];
}

export interface CartResponse {
  produtos: ProductCart[];
  precoTotal: number;
  quantidadeTotal: number;
  idUsuario: string;
  _id: string;
}
