import Koa from "koa";
import json from "koa-json";
import koaBody from "koa-body";
import routers from "./router";
const app = new Koa();
const port = 3000;

// middleware
app.use(json());
app.use(koaBody());

// router
routers.map(router => {
  app.use(router.routes())
  app.use(router.allowedMethods())
});

// response
app.use(ctx => {
  ctx.body = {
    message: "Hellow World!"
  };
});

app.listen(port, () => console.log(`App is listened on http://localhost:3000`));
