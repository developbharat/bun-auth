export type IUserAccountRole = Record<string, string>;

export interface IUserAccount {
  uid: string;
  passcode: string;
  role: IUserAccountRole[keyof IUserAccountRole];
}
