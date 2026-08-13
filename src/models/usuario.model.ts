export interface Usuario {
  nome: string;
  email: string;
  password: string;
  administrador: "true" | "false";
  _id?: string; // Opcional (?) porque na hora de criar (POST) não enviamos ID, a API que gera
}
