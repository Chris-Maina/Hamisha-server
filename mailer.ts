import nodemailer from "nodemailer";
import type { TestAccount, Transporter, SendMailOptions } from "nodemailer";

type MailAccount = Pick<TestAccount, "user" | "pass"> & {
  host?: string | undefined;
  port?: number | undefined;
}

class MailingService {
  private _account: MailAccount;
  private _transporter: Transporter;

  constructor (account: MailAccount) {
    this._account = account;
    this._transporter = nodemailer.createTransport({
        host: account.host,
        port: account.port,
        secure: false,
        requireTLS: true,
        debug: true,
        logger: true,
        auth: {
          user: account.user,
          pass: account.pass
        }
    });
  }

  /**
   * 
   * @description _account getter method
   */
  public get account(): MailAccount {
    return this._account;
  }

  /**
   *
   * @description _account setter method
   */
  public set account(value: MailAccount) {
    this._account = value;
  }

  /**
   * 
   * @description _transporter getter method
   */
  public get transporter(): Transporter {
    return this._transporter;
  }

  /**
   * @name sendMail
   */
  public async sendMail(options: SendMailOptions): Promise<void> {
    try {
      return await this._transporter.sendMail({
        from: options.from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * @name verifyConnection
   */
  public async verifyConnection() {
    try {
      return await this._transporter.verify();
    } catch (error) {
      throw error;
    }
  }

}

export default MailingService;