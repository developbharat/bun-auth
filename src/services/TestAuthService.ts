import { DateTime } from '../common/DateTime';
import { AuthPasscodeMode, AuthUidMode } from '../common/enums';
import { IAuthService, ICreateAuthTokenResult } from '../contracts/IAuthService';
import { IUserAccount } from '../contracts/IUserAccount';

export interface ITestAuthServiceOptions {
  user_account: IUserAccount;
  auth_token: string;
}

export class TestAuthService implements IAuthService {
  private __user_account: IUserAccount;
  private __auth_token: string;
  constructor(options: ITestAuthServiceOptions) {
    this.__user_account = options.user_account;
    this.__auth_token = options.auth_token;
  }

  async checkUserAccount(_uid: string): Promise<IUserAccount | null> {
    return this.__user_account;
  }
  async checkCredentials(
    _uid: string,
    _passcode: string,
    _uidMode: AuthUidMode,
    _passcodeMode: AuthPasscodeMode,
  ): Promise<IUserAccount | null> {
    return this.__user_account;
  }
  async checkAuthToken(authToken: string): Promise<IUserAccount | null> {
    return this.__user_account;
  }
  async createAuthToken(_account: IUserAccount): Promise<ICreateAuthTokenResult> {
    return { authToken: this.__auth_token, expiresAt: new DateTime().addMinutes(5) };
  }

  async sendMobileCode(_uid: string, _passcode: string): Promise<void> {
    return;
  }

  async sendEmailCode(_uid: string, _passcode: string): Promise<void> {
    return;
  }
}
