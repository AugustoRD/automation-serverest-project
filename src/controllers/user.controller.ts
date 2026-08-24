import { APIRequestContext, APIResponse } from "@playwright/test";
import { User } from "../models/user.model";

export class UserController {
  private request: APIRequestContext;
  private readonly BASE_URL = "/usuarios";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAllUsers(token?: string): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL, {
      headers: token
        ? {
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          }
        : {},
    });
  }

  async getUserWithQueryParams(
    params: {
      [key: string]: string;
    },
    token?: string,
  ): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL, {
      params: params,
      headers: token
        ? {
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          }
        : {},
    });
  }

  async getUserById(id: string, token?: string): Promise<APIResponse> {
    return await this.request.get(`${this.BASE_URL}/${id}`, {
      headers: token
        ? {
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          }
        : {},
    });
  }

  async createUser(payload: User, token?: string): Promise<APIResponse> {
    return await this.request.post(this.BASE_URL, {
      data: payload,
      headers: token
        ? {
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          }
        : {},
    });
  }

  async updateUser(
    id: string,
    payload: User,
    token?: string,
  ): Promise<APIResponse> {
    return await this.request.put(`${this.BASE_URL}/${id}`, {
      data: payload,
      headers: token
        ? {
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          }
        : {},
    });
  }

  async deleteUser(id: string, token?: string): Promise<APIResponse> {
    return await this.request.delete(`${this.BASE_URL}/${id}`, {
      headers: token
        ? {
            Authorization: token.startsWith("Bearer")
              ? token
              : `Bearer ${token}`,
          }
        : {},
    });
  }
}
