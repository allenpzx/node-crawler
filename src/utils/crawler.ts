
type TItem = any;
type TList = TItem[];

export const mapLimit = async (
  list: TList,
  limit: number,
  handle: (item: TItem, isLast: boolean) => any
) => {
  if (limit > list.length) limit = list.length;
  const loop = (tasks: TList) => {
    const isLast = tasks.length === 1;
    return handle(tasks.shift(), isLast).then(res => {
      if (tasks.length !== 0) return loop(tasks);
      return Promise.resolve();
    });
  };
  const pendings = [];
  const tasks = list.slice();
  while (limit--) {
    pendings.push(loop(tasks));
  }
  return Promise.all(pendings);
};

export const getText = async (page: any, handle: any) => await page.evaluate((el: any) => (el || {}).textContent || '', handle);
export const getHref = async (page: any, handle: any) => await page.evaluate((el: any) => (el || {}).href || '', handle);
export const getSrc = async (page: any, handle: any) => await page.evaluate((el: any) => (el || {}).src || '', handle);