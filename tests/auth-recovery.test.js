import test from 'node:test';
import assert from 'node:assert/strict';
import { createRecoveryTracker } from '../src/utils/authRecovery.js';

function setup(initialUrl = 'https://example.com/admin/login', values = new Map()) {
    let callback;
    const tracker = createRecoveryTracker({ initialUrl,
        storage: { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) },
        auth: { onAuthStateChange(listener) { callback = listener; return {data:{subscription:{unsubscribe(){}}}}; } },
    });
    return { tracker, values, emit: (event, session) => callback(event, session) };
}
const session = { user: { id: 'test-user' } };

test('recovery is captured before a route subscribes; ordinary sign-in never activates it', () => {
    const { tracker, emit } = setup();
    emit('SIGNED_IN', session);
    assert.equal(tracker.getSnapshot().status, 'idle');
    emit('PASSWORD_RECOVERY', session);
    assert.equal(tracker.getSnapshot().status, 'active');
    let notifications = 0;
    tracker.subscribe(() => notifications++);
    tracker.clear();
    assert.equal(notifications, 1);
    assert.equal(tracker.getSnapshot().status, 'idle');
});

test('refresh restores recovery only for the same authenticated user; signout removes intent', () => {
    const first = setup();
    first.emit('PASSWORD_RECOVERY', session);
    const refreshed = setup(undefined, first.values);
    refreshed.emit('INITIAL_SESSION', session);
    assert.equal(refreshed.tracker.getSnapshot().status, 'active');
    const otherUser = setup(undefined, new Map(first.values));
    otherUser.emit('INITIAL_SESSION', {user:{id:'another-user'}});
    assert.equal(otherUser.tracker.getSnapshot().status, 'idle');
    refreshed.emit('SIGNED_OUT', null);
    assert.equal(first.values.size, 0);
    assert.equal(refreshed.tracker.getSnapshot().status, 'invalid');
});

test('a URL alone cannot authorize password updates, and expired links fail safely', () => {
    const pending = setup('https://example.com/#type=recovery&access_token=fake-test-token');
    assert.equal(pending.tracker.getSnapshot().status, 'pending');
    pending.emit('INITIAL_SESSION', session);
    assert.equal(pending.tracker.getSnapshot().status, 'pending');
    pending.tracker.expirePending();
    assert.equal(pending.tracker.getSnapshot().status, 'invalid');
    pending.emit('PASSWORD_RECOVERY', session);
    assert.equal(pending.tracker.getSnapshot().status, 'active');
    const expired = setup('https://example.com/#error=access_denied&error_code=otp_expired');
    expired.emit('INITIAL_SESSION', session);
    assert.equal(expired.tracker.getSnapshot().status, 'invalid');
    assert.deepEqual(Object.keys(expired.tracker.getSnapshot()), ['status']);
    const noSession = setup('https://example.com/#type=recovery');
    noSession.emit('INITIAL_SESSION', null);
    assert.equal(noSession.tracker.getSnapshot().status, 'invalid');
});

test('storage failures do not break a verified recovery session', () => {
    let emit;
    const tracker = createRecoveryTracker({ storage: {getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}},
        auth:{onAuthStateChange(callback){emit=callback;return {data:{subscription:{unsubscribe(){}}}};}},
    });
    emit('INITIAL_SESSION', session);
    emit('PASSWORD_RECOVERY', session);
    assert.equal(tracker.getSnapshot().status, 'active');
    tracker.clear();
    assert.equal(tracker.getSnapshot().status, 'idle');
});
