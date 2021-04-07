enum Env {
  dev = 1,
  test = 2,
  prod = 3,
}

export interface JwtStructure {
  instance: string;
  product: number;
  env: Env;
}
