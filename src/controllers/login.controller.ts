import { APIRequestContext, APIResponse } from "@playwright/test";
import { Login } from "../models/login.model";

export class LoginController {
  private request: APIRequestContext;
  private readonly BASE_URL = "/login";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async realizarLogin(payload: Login): Promise<APIResponse> {
    return await this.request.post(this.BASE_URL, {
      data: payload,
    });
  }

  async obterTokenAutenticacao(payload: Login): Promise<string> {
    const response = await this.request.post(this.BASE_URL, {
      data: payload,
    });

    const body = await response.json();
    return body.authorization;
  }
}
