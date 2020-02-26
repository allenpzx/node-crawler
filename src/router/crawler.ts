import Router from "koa-router";
import EblockController from "../controller/eblock";
import KijijiautoController from "../controller/kijijiauto";

const router = new Router({
  prefix: "/crawler"
});

router.post("/eblock/", EblockController);
router.post("/kijijiauto/", KijijiautoController);
export default router;
