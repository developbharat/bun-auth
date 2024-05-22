import { AuthPasscodeMode, AuthUidMode } from '../common/enums';
import { IUserAccount } from './IUserAccount';

export interface ICreateAuthTokenResult {
  authToken: string;
  expiresAt: Date;
}

export interface IAuthService {
  checkUserAccount(uid: string): Promise<IUserAccount | null>;
  checkCredentials(
    uid: string,
    passcode: string,
    uidMode: AuthUidMode,
    passcodeMode: AuthPasscodeMode,
  ): Promise<IUserAccount | null>;
  checkAuthToken(authToken: string): Promise<IUserAccount | null>;
  createAuthToken(account: IUserAccount): Promise<ICreateAuthTokenResult>;

  sendMobileCode(uid: string, passcode: string): Promise<void>;
  sendEmailCode(uid: string, passcode: string): Promise<void>;
}
