import { APIRequestContext, APIResponse } from "@playwright/test";
import { Produto } from "../models/produtos.model";

export class ProdutoController {
  private request: APIRequestContext;
  private readonly BASE_URL = "/produtos";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async criarProduto(payload: Produto, token: string): Promise<APIResponse> {
    return await this.request.post(this.BASE_URL, {
      headers: {
        authorization: token,
      },
      data: payload,
    });
  }

  async listarProdutos(): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL);
  }

  async listarProdutosComQueryParams(params: {
    [key: string]: string;
  }): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL, {
      params: params,
    });
  }

  async buscarProdutoPorId(id: string): Promise<APIResponse> {
    return await this.request.get(`${this.BASE_URL}/${id}`);
  }
}
