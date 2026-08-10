import { defineConfig } from "@playwright/test";

export default defineConfig({
  // 1. Aponta exclusivamente para a pasta de API que criamos
  testDir: "./tests/api",

  // 2. Roda os testes em paralelo para ganhar velocidade
  fullyParallel: true,

  // 3. Gera o relatório visual
  reporter: "html",

  use: {
    // 4. Base URL: Facilita muito! Você não precisará digitar localhost em todo teste
    baseURL: process.env.BASE_URL || "http://localhost:3000",

    // 5. Garante que as requisições sempre peçam JSON como resposta
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  },
});
