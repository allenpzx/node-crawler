import LinkedInSearch from '../crawler/linkedin/search';
async function LinkedInSearchController(ctx) {
  try {
    await LinkedInSearch();
    ctx.body = {
      message: "success!"
    };
  } catch (e) {
    console.log("LinkedInSearchController: ", e);
    ctx.body = {
      message: "error"
    };
  }
}

LinkedInSearch()

export default LinkedInSearchController;
