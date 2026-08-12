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
}
