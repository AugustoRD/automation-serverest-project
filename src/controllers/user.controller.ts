import { APIRequestContext, APIResponse } from "@playwright/test";
import { User } from "../models/user.model";

export class UserController {
  private request: APIRequestContext;
  private readonly BASE_URL = "/usuarios";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getAllUsers(): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL);
  }

  async getUserWithQueryParams(params: {
    [key: string]: string;
  }): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL, {
      params: params,
    });
  }

  //async listarUsuariosComQueryParams(
  //  queryParams: string,
  //): Promise<APIResponse> {
  //  return await this.request.get(`${this.BASE_URL}?${queryParams}`);
  //}

  async getUserById(id: string): Promise<APIResponse> {
    return await this.request.get(`${this.BASE_URL}/${id}`);
  }

  async createUser(payload: User): Promise<APIResponse> {
    return await this.request.post(this.BASE_URL, {
      data: payload,
    });
  }

  async updateUser(id: string, payload: User): Promise<APIResponse> {
    return await this.request.put(`${this.BASE_URL}/${id}`, {
      data: payload,
    });
  }

  async deleteUser(id: string): Promise<APIResponse> {
    return await this.request.delete(`${this.BASE_URL}/${id}`);
  }
}
