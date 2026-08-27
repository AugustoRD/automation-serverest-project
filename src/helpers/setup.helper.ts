import { APIRequestContext, expect } from "@playwright/test";
import { UserBuilder } from "../builders/user.builder";
import { UserController } from "../controllers/user.controller";
import { LoginController } from "../controllers/login.controller";
import { Product } from "../models/product.model";
import { ProductController } from "../controllers/product.controller";
import { ProductBuilder } from "../builders/product.builder";
import { CartBuilder } from "../builders/cart.builder";
import { CartController } from "../controllers/cart.controller";

export class SetupHelper {
  private userController: UserController;
  private loginController: LoginController;
  private productController: ProductController;

  private userIDs: string[] = [];
  private productIDs: string[] = [];

  constructor(request: APIRequestContext) {
    this.userController = new UserController(request);
    this.loginController = new LoginController(request);
    this.productController = new ProductController(request);
  }

  async createAndLogin(isAdmin: "true" | "false") {
    const usuario = await this.registerUser(isAdmin);
    const token = await this.loginController.getAuthenticationToken({
      email: usuario.email,
      password: usuario.password,
    });
    return { ...usuario, token };
  }

  async registerUser(isAdmin: "true" | "false") {
    const user = new UserBuilder().withAdministrador(isAdmin).build();
    const response = await this.userController.createUser(user);
    const body = await response.json();

    this.userIDs.push(body._id);

    return {
      id: body._id,
      nome: user.nome,
      email: user.email,
      password: user.password,
      administrador: user.administrador,
    };
  }

  public addUserId(id: string) {
    this.userIDs.push(id);
  }

  public addProductId(id: string) {
    this.productIDs.push(id);
  }

  async tearDown(admToken?: string) {
    if (admToken) {
      for (const id of this.productIDs) {
        await this.productController.deleteProduct(id, admToken);
      }
    }
    this.productIDs = [];

    for (const id of this.userIDs) {
      const response = await this.userController.deleteUser(id, admToken);
      expect(response.ok()).toBeTruthy();
    }
    this.userIDs = [];
  }

  async createProduct(admToken: string) {
    const productData = new ProductBuilder().build();
    const productResponse = await this.productController.createProduct(
      productData,
      admToken,
    );

    expect(productResponse.status()).toBe(201);
    const productId = (await productResponse.json())._id;
    this.addProductId(productId);

    return { ...productData, id: productId };
  }

  async registerCartWithProducts(
    cartController: CartController,
    clientToken: string,
    products: (Product & { id: string })[],
  ) {
    const cartBuilder = new CartBuilder();

    for (const product of products) {
      cartBuilder.addProduct(product.id, 1);
    }

    const cartPayload = cartBuilder.build();
    const cartResponse = await cartController.createCart(
      cartPayload,
      clientToken,
    );

    expect(cartResponse.status()).toBe(201);
    const cartId = (await cartResponse.json())._id;
    return cartId;
  }
}
