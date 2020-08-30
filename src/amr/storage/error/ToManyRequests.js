export class ThrottleError extends Error {

  constructor(message, retryAfter) {
    super(message);
    this.name = "ThrottleError";
    this.retryAfter = new Date(retryAfter);
  }

  /**
   * @return {Date}
   */
  getRetryAfterDate() {
    return this.retryAfter;
  }
}
