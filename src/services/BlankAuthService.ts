import { AuthUidMode, AuthPasscodeMode } from '../common/enums';
import { IAuthService, ICreateAuthTokenResult } from '../contracts/IAuthService';
import { IUserAccount } from '../contracts/IUserAccount';

export class BlankAuthService implements IAuthService {
  checkUserAccount(_uid: string): Promise<IUserAccount | null> {
    throw new Error('Method not implemented.');
  }
  checkCredentials(
    _uid: string,
    _passcode: string,
    _uidMode: AuthUidMode,
    _passcodeMode: AuthPasscodeMode,
  ): Promise<IUserAccount | null> {
    throw new Error('Method not implemented.');
  }
  checkAuthToken(_authToken: string): Promise<IUserAccount | null> {
    throw new Error('Method not implemented.');
  }
  createAuthToken(_account: IUserAccount): Promise<ICreateAuthTokenResult> {
    throw new Error('Method not implemented.');
  }
  sendMobileCode(_uid: string, _passcode: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  sendEmailCode(_uid: string, _passcode: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
