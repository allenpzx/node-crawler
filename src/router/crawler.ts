import Router from "koa-router";
import EblockController from "../controller/eblock";
import KijijiautoController from "../controller/kijijiauto";
import LinkedInController from "../controller/linkedin";
import ManheimController from '../controller/manheim';

const router = new Router({
  prefix: "/crawler"
});

router.post("/eblock/", EblockController);
router.post("/kijijiauto/", KijijiautoController);
router.post("/linkedin/", LinkedInController);
router.post("/manheim/", ManheimController);
export default router;
