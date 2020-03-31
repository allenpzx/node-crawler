import Koa from "koa";
import json from "koa-json";
import koaBody from "koa-body";
import routers from "./router";
import ErrorHandle from "./controller/error";
import Mongo from "./db";
const app = new Koa();
const port = 3000;
require('dotenv').config();

// middleware
app.use(ErrorHandle);
app.use(json());
app.use(koaBody());

// router
routers.map(router => {
  app.use(router.routes());
  app.use(router.allowedMethods());
});

// response
app.use(ctx => {
  ctx.body = {
    message: "Hellow World!"
  };
});

new Mongo()

app.listen(port, () => console.log(`App is listened on http://localhost:${port}`));