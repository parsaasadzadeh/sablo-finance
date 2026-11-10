// event-bus کوچک برای ارتباط بین axios، context و UI بدون وابستگی مستقیم.
// - expired: سرور برای یک درخواست تغییردهنده SUBSCRIPTION_EXPIRED برگردانده
// - sessionCleared: کاربر خارج شده؛ وضعیت اشتراک او نباید برای کاربر بعدی بماند
function channel() {
  const ls = new Set();
  return {
    on(cb) { ls.add(cb); return () => ls.delete(cb); },
    emit() { ls.forEach((cb) => cb()); },
  };
}
const expired = channel();
const cleared = channel();

export const onSubscriptionExpired = expired.on;
export const emitSubscriptionExpired = expired.emit;
export const onSessionCleared = cleared.on;
export const emitSessionCleared = cleared.emit;
