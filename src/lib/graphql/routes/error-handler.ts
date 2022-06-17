export interface ErrorWCode {
  code: number;
  msg: string;
}

export const handleError = (ctx: any, err: ErrorWCode) => {
  ctx.status = err.code;
  ctx.body = { msg: err.msg };
};
