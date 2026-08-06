import { APIRequestContext, APIResponse } from "@playwright/test";
import { Usuario } from "../models/usuario.model";

export class UsuarioController {
  private request: APIRequestContext;
  private readonly BASE_URL = "/usuarios";

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async listarUsuarios(): Promise<APIResponse> {
    return await this.request.get(this.BASE_URL);
  }

  async buscarUsuarioPorId(id: string): Promise<APIResponse> {
    return await this.request.get(`${this.BASE_URL}/${id}`);
  }

  async criarUsuario(payload: Usuario): Promise<APIResponse> {
    return await this.request.post(this.BASE_URL, {
      data: payload,
    });
  }

  async editarUsuario(id: string, payload: Usuario): Promise<APIResponse> {
    return await this.request.put(`${this.BASE_URL}/${id}`, {
      data: payload,
    });
  }

  async deletarUsuario(id: string): Promise<APIResponse> {
    return await this.request.delete(`${this.BASE_URL}/${id}`);
  }
}
