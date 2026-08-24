import { APIRequestContext } from "@playwright/test";
import { CartPayload } from "../models/cart.model";

export class CartController {
  private request: APIRequestContext;
  private readonly BASE_URL = "/carrinhos";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  private getHeaders(token?: string): Record<string, string> {
    if (!token) return {};
    return {
      Authorization: token.startsWith("Bearer") ? token : `Bearer ${token}`,
    };
  }

  async createCart(payload: CartPayload, token?: string) {
    return await this.request.post(this.BASE_URL, {
      data: payload,
      headers: this.getHeaders(token),
    });
  }

  async cancelPurchase(token: string) {
    return await this.request.delete(`${this.BASE_URL}/cancelar-compra`, {
      headers: this.getHeaders(token),
    });
  }
}
