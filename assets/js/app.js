function logAction(message) {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} : ${message}`);
}

export { logAction };
