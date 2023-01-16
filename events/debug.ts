export const name = 'debug';
export async function execute(info: string) {
  const date = new Date();
  if (info.toLowerCase().includes('heartbeat')) return;
  console.log(
    `[${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}] [DEBUG]: ${info}`,
  );
}
