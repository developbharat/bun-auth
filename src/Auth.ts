import { Elysia, t } from 'elysia';
import { AuthException } from './common/AuthException';
import { Random } from './common/Random';
import { AuthPasscodeMode, AuthUidMode } from './common/enums';
import { IAuthService } from './contracts/IAuthService';
import BlankAuthService from './services/BlankAuthService';
import { IUserAccountRole } from './contracts/IUserAccount';

export interface IAuthInitOptions {
  /**
   * @default {AuthUidMode.EMAIL} email
   * Sets the authentication mode. Could be one of Email, Mobile as provided with enum.
   * @example
   * ```js
   * import { Auth, AuthUidMode } from '@developbharat/bun-auth';
   *
   * // create authentication instance
   * const auth = new Auth({ uid_mode: AuthUidMode.EMAIL }).build();
   *
   * // create elysia app
   * const app = new Elysia()
   *            .use(auth);
   *            .get("/public", ({ user_account }) => `This is public route. user_account is null: ${user_account}`)
   *            .get("/protected", ({ user_account }) => `This is protected route. user_account is: ${user_account}`, {authenticate: true})
   *            .listen(3000)
   * ```
   */
  uid_mode?: AuthUidMode;
  /**
   * @default {AuthPasscodeMode.PASSWORD} password
   * Sets the authentication mode. Could be one of Password, otp as provided with enum.
   * @example
   * ```js
   * import { Auth, AuthUidMode, AuthPasscodeMode } from '@developbharat/bun-auth';
   *
   * // create authentication instance
   * const auth = new Auth({
   *                        uid_mode: AuthUidMode.MOBILE,
   *                        passcode_mode: AuthPasscodeMode.OTP
   *                    }).build();
   *
   * // create elysia app
   * const app = new Elysia()
   *            .use(auth);
   *            .get("/public", ({ user_account }) => `This is public route. user_account is null: ${user_account}`)
   *            .get("/protected", ({ user_account }) => `This is protected route. user_account is: ${user_account}`, {authenticate: true})
   *            .listen(3000)
   * ```
   */
  passcode_mode?: AuthPasscodeMode;
  /**
   * @default {string} /accounts
   * Prefix all endpoints related to authentication with provided prefix.
   * @example
   * ```js
   * import { Auth, AuthUidMode, AuthPasscodeMode } from '@developbharat/bun-auth';
   *
   * // create authentication instance
   * const auth = new Auth({ endpoints_prefix: "/accounts" }).build();
   *
   * // create elysia app
   * const app = new Elysia()
   *            .use(auth);
   *            .get("/public", ({ user_account }) => `This is public route. user_account is null: ${user_account}`)
   *            .listen(3000)
   * ```
   */
  endpoints_prefix?: string;

  /**
   * @default {BlankAuthService} BlankAuthService
   * Authentication service to provide common operations such as credentials checking, sending otp etc.
   *
   * @example
   * ```js
   * import { Auth, AuthUidMode, AuthPasscodeMode, BlankAuthService } from '@developbharat/bun-auth';
   *
   * // create authentication instance
   * const auth = new Auth({ auth_service: new BlankAuthService() }).build();
   *
   * // create elysia app
   * const app = new Elysia()
   *            .use(auth);
   *            .get("/public", ({ user_account }) => `This is public route. user_account is null: ${user_account}`)
   *            .listen(3000)
   * ```
   */
  auth_service?: IAuthService;
}

export class Auth {
  private __uid_mode: AuthUidMode = AuthUidMode.EMAIL;
  private __passcode_mode: AuthPasscodeMode = AuthPasscodeMode.PASSWORD;
  private __endpoints_prefix: string = '/accounts';
  private __authService: IAuthService = new BlankAuthService();

  constructor(options: IAuthInitOptions = {}) {
    if (options.uid_mode) this.__uid_mode = options.uid_mode;
    if (options.passcode_mode) this.__passcode_mode = options.passcode_mode;
    if (options.endpoints_prefix) this.__endpoints_prefix = options.endpoints_prefix;
    if (options.auth_service) this.__authService = options.auth_service;
  }

  build() {
    const app = new Elysia({
      name: 'auth',
      prefix: this.__endpoints_prefix,
      tags: ['accounts'],
    })
      .state('authService', this.__authService)
      .macro(({ onBeforeHandle }) => ({
        authenticate(isEnabled: boolean = false) {
          onBeforeHandle(async ({ headers, store: { authService } }) => {
            // Skip incase authenticate is disabled.
            if (!isEnabled) return;

            // check authorization token
            const authToken = headers['authorization'];
            if (!authToken)
              throw new AuthException('Authorization header not found in received request.', 401);

            // fetch user account with provided credentials
            const user_account = await (authService as IAuthService).checkAuthToken(authToken);
            if (!user_account) throw new AuthException('Your auth session has been expired.', 401);
          });
        },
        authorise(roles: IUserAccountRole[]) {
          onBeforeHandle(async ({ headers, store: { authService } }) => {
            // check authorization token
            const authToken = headers['authorization'];
            if (!authToken)
              throw new AuthException('Authorization header not found in received request.', 401);

            // fetch user account with provided credentials
            const user_account = await (authService as IAuthService).checkAuthToken(authToken);
            if (!user_account) throw new AuthException('Your auth session has been expired.', 401);

            // check for whitelisted roles
            if (!roles.includes(user_account.role as unknown as IUserAccountRole)) {
              throw new AuthException(
                'Permission denied. You are not allowed to access this resource.',
                403,
              );
            }
          });
        },
      }))
      .derive(async ({ headers, store: { authService } }) => {
        const authToken = headers['authorization'];
        if (!authToken) return { user_account: null };

        // fetch user account,
        // and return null for requests which doesn't specify auth key during route declaration.
        // or user_account for requests specified auth key during route declaration
        const user_account = await authService.checkAuthToken(authToken);
        return { user_account: user_account };
      })
      .propagate();

    // Declare types for requests and responses.
    const tEmailUid = t.String({ minLength: 5, maxLength: 50, format: 'email' });
    const tMobileUid = t.String({
      minLength: 12,
      maxLength: 20,
      pattern:
        '^(011|999|998|997|996|995|994|993|992|991|990|979|978|977|976|975|974|973|972|971|970|969|968|967|966|965|964|963|962|961|960|899|898|897|896|895|894|893|892|891|890|889|888|887|886|885|884|883|882|881|880|879|878|877|876|875|874|873|872|871|870|859|858|857|856|855|854|853|852|851|850|839|838|837|836|835|834|833|832|831|830|809|808|807|806|805|804|803|802|801|800|699|698|697|696|695|694|693|692|691|690|689|688|687|686|685|684|683|682|681|680|679|678|677|676|675|674|673|672|671|670|599|598|597|596|595|594|593|592|591|590|509|508|507|506|505|504|503|502|501|500|429|428|427|426|425|424|423|422|421|420|389|388|387|386|385|384|383|382|381|380|379|378|377|376|375|374|373|372|371|370|359|358|357|356|355|354|353|352|351|350|299|298|297|296|295|294|293|292|291|290|289|288|287|286|285|284|283|282|281|280|269|268|267|266|265|264|263|262|261|260|259|258|257|256|255|254|253|252|251|250|249|248|247|246|245|244|243|242|241|240|239|238|237|236|235|234|233|232|231|230|229|228|227|226|225|224|223|222|221|220|219|218|217|216|215|214|213|212|211|210|98|95|94|93|92|91|90|86|84|82|81|66|65|64|63|62|61|60|58|57|56|55|54|53|52|51|49|48|47|46|45|44|43|41|40|39|36|34|33|32|31|30|27|20|7|1)[0-9]{0,14}$',
      error: 'Invalid mobile provided.',
      examples: ['919876543210', '18008256521'],
    });

    const tPasscodeOTP = t.String({ minLength: 6, maxLength: 6, pattern: '^[0-9]{6}' });
    const tPasscodePassword = t.String({ minLength: 8, maxLength: 30 });

    // Add common endpoints
    app.group('/common', (app) => {
      app
        .get('/whoami', ({ user_account }) => JSON.stringify(user_account), { authenticate: true })
        .post(
          '/check-credentials',
          async ({ body }) => {
            // check provided credentials
            const user_account = await this.__authService.checkCredentials(
              body.uid,
              body.passcode,
              this.__uid_mode,
              this.__passcode_mode,
            );
            if (!user_account) throw new AuthException('Invalid credentials provided.', 401);

            // Generate auth token based on provided credentials
            const { authToken, expiresAt } = await this.__authService.createAuthToken(user_account);
            return { authToken, expiresAt };
          },
          {
            authenticate: false,
            body: t.Object({
              uid: this.__uid_mode == AuthUidMode.EMAIL ? tEmailUid : tMobileUid,
              passcode:
                this.__passcode_mode == AuthPasscodeMode.OTP ? tPasscodeOTP : tPasscodePassword,
            }),
          },
        );

      return app;
    });

    // Add OTP Specific routes.
    app.group('/codes', (app) =>
      app.post(
        '/send',
        async ({ body }) => {
          // Generate authentication code.
          const otp = Random.oneTimePasscode();

          if (this.__uid_mode === AuthUidMode.MOBILE) {
            await this.__authService.sendMobileCode(body.uid, otp);
          } else if (this.__uid_mode === AuthUidMode.EMAIL) {
            await this.__authService.sendEmailCode(body.uid, otp);
          }

          return 'OTP Sent successfully.';
        },
        {
          authenticate: false,
          body: t.Object({
            uid: this.__uid_mode == AuthUidMode.EMAIL ? tEmailUid : tMobileUid,
          }),
        },
      ),
    );

    // Return plugin
    return app;
  }
}
