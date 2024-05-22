import { AuthUidMode, AuthPasscodeMode } from '../common/enums';
import { IAuthService, ICreateAuthTokenResult } from '../contracts/IAuthService';
import { IUserAccount } from '../contracts/IUserAccount';

export default class BlankAuthService implements IAuthService {
  checkUserAccount(uid: string): Promise<IUserAccount | null> {
    throw new Error('Method not implemented.');
  }
  checkCredentials(
    uid: string,
    passcode: string,
    uidMode: AuthUidMode,
    passcodeMode: AuthPasscodeMode,
  ): Promise<IUserAccount | null> {
    throw new Error('Method not implemented.');
  }
  checkAuthToken(authToken: string): Promise<IUserAccount | null> {
    throw new Error('Method not implemented.');
  }
  createAuthToken(account: IUserAccount): Promise<ICreateAuthTokenResult> {
    throw new Error('Method not implemented.');
  }
  sendMobileCode(uid: string, passcode: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  sendEmailCode(uid: string, passcode: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
