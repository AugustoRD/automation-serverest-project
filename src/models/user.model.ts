export interface User {
  nome: string;
  email: string;
  password: string;
  administrador: "true" | "false";
  _id?: string;
}
