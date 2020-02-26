const KijijiautoController = async (ctx) => {
    try {
        const { ids } = ctx.request.body;
    }catch(e) {
        console.log('KijijiautoController: ', e);
    }
}

export default KijijiautoController