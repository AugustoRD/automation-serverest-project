import { APIRequestContext, APIResponse } from "@playwright/test";
import { Product } from "../models/product.model";

export class ProductController {
  private request: APIRequestContext;
  private readonly BASE_URL = "/produtos";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async createProduct(payload: Product, token: string): Promise<APIResponse> {
    return await this.request.post(this.BASE_URL, {
      headers: {
        authorization: token,
      },
      data: payload,
    });
  }

  async listProducts(): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL);
  }

  async listProductsWithQueryParams(params: {
    [key: string]: string;
  }): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL, {
      params: params,
    });
  }

  async getProductById(id: string): Promise<APIResponse> {
    return await this.request.get(`${this.BASE_URL}/${id}`);
  }

  async deleteProduct(id: string, token: string): Promise<APIResponse> {
    return await this.request.delete(`${this.BASE_URL}/${id}`, {
      headers: {
        authorization: token,
      },
    });
  }

  async updateProduct(
    id: string,
    payload: Product,
    token: string,
  ): Promise<APIResponse> {
    return await this.request.put(`${this.BASE_URL}/${id}`, {
      headers: {
        authorization: token,
      },
      data: payload,
    });
  }
}
