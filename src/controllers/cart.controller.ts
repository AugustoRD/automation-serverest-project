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

  async completePurchase(token: string) {
    return await this.request.delete(`${this.BASE_URL}/concluir-compra`, {
      headers: this.getHeaders(token),
    });
  }

  async getCartById(cartId: string, token?: string) {
    return await this.request.get(`${this.BASE_URL}/${cartId}`, {
      headers: this.getHeaders(token),
    });
  }

  async getAllCarts(token?: string) {
    return await this.request.get(this.BASE_URL, {
      headers: this.getHeaders(token),
    });
  }

  async getCartsByUserId(userId: string, token?: string) {
    return await this.request.get(`${this.BASE_URL}?idUsuario=${userId}`, {
      headers: this.getHeaders(token),
    });
  }
}
