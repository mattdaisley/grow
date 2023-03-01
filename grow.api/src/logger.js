const logger = {
  log: function () {
    const isSSR = () => typeof window === 'undefined';
    !isSSR && console.log(...arguments);
  }
}

export default logger;