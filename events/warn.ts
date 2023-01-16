export const name = 'warn';
export async function execute(info: string) {
  const date = new Date();
  console.log(
    `[${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}] [WARN]: ${info}`,
  );
}
