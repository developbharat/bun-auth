import { describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { Auth, AuthPasscodeMode, AuthUidMode, TestAuthService } from '../../src';

describe('e2e.Auth', () => {
  it('it works with minimal application', async () => {
    const auth = new Auth().build();
    const app = new Elysia().use(auth).get('/', () => 'hi');
    const response = await app.handle(new Request('http://localhost/')).then((res) => res.text());
    expect(response).toBe('hi');
  });

  it('returns null user_account for by default', async () => {
    const auth = new Auth({
      uid_mode: AuthUidMode.MOBILE,
      passcode_mode: AuthPasscodeMode.OTP,
    }).build();

    const app = new Elysia().use(auth).get('/', ({ user_account }) => ({ account: user_account }));
    const response = await app.handle(new Request('http://localhost/')).then((res) => res.json());
    expect(response.account).toBeNull();
  });

  it('authorization header check fails with authenticate flag turned on', async () => {
    const auth = new Auth({
      auth_service: new TestAuthService({
        auth_token: 'abcd',
        user_account: { uid: 'care@mail.com', passcode: 'Password@133', role: 'admin' },
      }),
    }).build();

    const app = new Elysia()
      .use(auth)
      .get('/', ({ user_account }) => user_account, { authenticate: true });
    const statusCode = (await app.handle(new Request('http://localhost/'))).status;
    expect(statusCode).not.toBe(200);
  });

  it('authorization header check passes with authenticate flag turned on', async () => {
    const account = { uid: '919876543210', passcode: '123456', role: 'admin' };
    const auth = new Auth({
      auth_service: new TestAuthService({
        auth_token: 'abcd',
        user_account: account,
      }),
    }).build();

    const app = new Elysia()
      .use(auth)
      .get('/', ({ user_account }) => ({ account: user_account }), { authenticate: true });
    const response = await app
      .handle(
        new Request('http://localhost/accounts/common/whoami', {
          headers: { Authorization: 'abcd' },
        }),
      )
      .then((res) => res.json());
    expect(response).toEqual(account);
  });

  it('supports email + password mode', async () => {
    const account = { uid: 'test@mail.com', passcode: 'Password123', role: 'admin' };
    const auth = new Auth({
      uid_mode: AuthUidMode.EMAIL,
      passcode_mode: AuthPasscodeMode.PASSWORD,
      auth_service: new TestAuthService({
        auth_token: 'abcd',
        user_account: account,
      }),
    }).build();

    const app = new Elysia()
      .use(auth)
      .get('/', ({ user_account }) => ({ account: user_account }), { authenticate: true });
    const response = await app
      .handle(
        new Request('http://localhost/accounts/common/check-credentials', {
          body: JSON.stringify({
            uid: account.uid,
            passcode: account.passcode,
          }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        }),
      )
      .then((res) => res.json());
    expect(response.authToken).toBe('abcd');
    expect(response.expiresAt).toBeString();
  });

  it('supports mobile + password mode', async () => {
    const account = { uid: '919876543210', passcode: 'Password123', role: 'admin' };
    const auth = new Auth({
      uid_mode: AuthUidMode.MOBILE,
      passcode_mode: AuthPasscodeMode.PASSWORD,
      auth_service: new TestAuthService({
        auth_token: 'abcd',
        user_account: account,
      }),
    }).build();

    const app = new Elysia()
      .use(auth)
      .get('/', ({ user_account }) => ({ account: user_account }), { authenticate: true });
    const response = await app
      .handle(
        new Request('http://localhost/accounts/common/check-credentials', {
          body: JSON.stringify({
            uid: account.uid,
            passcode: account.passcode,
          }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        }),
      )
      .then((res) => res.json());
    expect(response.authToken).toBeString();
    expect(response.expiresAt).toBeString();
  });

  it('supports mobile + otp mode', async () => {
    const account = { uid: '919876543210', passcode: '126548', role: 'admin' };
    const auth = new Auth({
      uid_mode: AuthUidMode.MOBILE,
      passcode_mode: AuthPasscodeMode.OTP,
      auth_service: new TestAuthService({
        auth_token: 'abcd',
        user_account: account,
      }),
    }).build();

    const app = new Elysia()
      .use(auth)
      .get('/', ({ user_account }) => ({ account: user_account }), { authenticate: true });
    const response = await app
      .handle(
        new Request('http://localhost/accounts/common/check-credentials', {
          body: JSON.stringify({
            uid: account.uid,
            passcode: account.passcode,
          }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        }),
      )
      .then((res) => res.json());
    expect(response.authToken).toBeString();
    expect(response.expiresAt).toBeString();
  });

  it('supports email + otp mode', async () => {
    const account = { uid: 'test@mail.com', passcode: '126548', role: 'admin' };
    const auth = new Auth({
      uid_mode: AuthUidMode.EMAIL,
      passcode_mode: AuthPasscodeMode.OTP,
      auth_service: new TestAuthService({
        auth_token: 'abcd',
        user_account: account,
      }),
    }).build();

    const app = new Elysia()
      .use(auth)
      .get('/', ({ user_account }) => ({ account: user_account }), { authenticate: true });
    const response = await app
      .handle(
        new Request('http://localhost/accounts/common/check-credentials', {
          body: JSON.stringify({
            uid: account.uid,
            passcode: account.passcode,
          }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        }),
      )
      .then((res) => res.json());
    expect(response.authToken).toBeString();
    expect(response.expiresAt).toBeString();
  });

  it('supports sending otp to email', async () => {
    const account = { uid: 'test@mail.com', passcode: '', role: 'admin' };
    const auth = new Auth({
      uid_mode: AuthUidMode.EMAIL,
      passcode_mode: AuthPasscodeMode.OTP,
      auth_service: new TestAuthService({
        auth_token: 'abcd',
        user_account: account,
      }),
    }).build();

    const app = new Elysia()
      .use(auth)
      .get('/', ({ user_account }) => ({ account: user_account }), { authenticate: true });
    const statusCode = (
      await app.handle(
        new Request('http://localhost/accounts/codes/send', {
          body: JSON.stringify({ uid: account.uid }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        }),
      )
    ).status;

    expect(statusCode).toBe(200);
  });

  it('supports sending otp to mobile', async () => {
    const account = { uid: '919876543210', passcode: '', role: 'admin' };
    const auth = new Auth({
      uid_mode: AuthUidMode.MOBILE,
      passcode_mode: AuthPasscodeMode.OTP,
      auth_service: new TestAuthService({
        auth_token: 'abcd',
        user_account: account,
      }),
    }).build();

    const app = new Elysia()
      .use(auth)
      .get('/', ({ user_account }) => ({ account: user_account }), { authenticate: true });
    const statusCode = (
      await app.handle(
        new Request('http://localhost/accounts/codes/send', {
          body: JSON.stringify({ uid: account.uid }),
          headers: { 'content-type': 'application/json' },
          method: 'POST',
        }),
      )
    ).status;

    expect(statusCode).toBe(200);
  });
});
