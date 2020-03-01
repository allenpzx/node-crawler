import Router from "koa-router";
import EblockController from "../controller/eblock";
import KijijiautoController from "../controller/kijijiauto";
import LinkedInController from "../controller/linkedin";

const router = new Router({
  prefix: "/crawler"
});

router.post("/eblock/", EblockController);
router.post("/kijijiauto/", KijijiautoController);
router.post("/linkedin/", LinkedInController);
export default router;
