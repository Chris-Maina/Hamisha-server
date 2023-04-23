import schedule from "node-schedule";
import type { RecurrenceRule } from "node-schedule";
import MailingService from "../mailer";
import { getCustomerIntroMailTemplate, getMailTemplate } from "../helpers/mail_template";
import { User } from "../models";

/**
 * @description sends mail
 * @param rule - time/date to send mail
 */

export const sendMailDaemon = (rule: string | RecurrenceRule) => {
  schedule.scheduleJob(rule, async () => {
    try {
      // https://nodemailer.com/smtp/
      const mailService = new MailingService({
        user: process.env.MAIL_USER!,
        pass: process.env.MAIL_PASSWORD!,
        host: "smtp.gmail.com",
        port: 587
      });

      const isConnVerified = await mailService.verifyConnection();
      if (!isConnVerified) {
        return;
      }

      const text = `It that time to think about your trash! Help keep the environment clean by getting a garbage collector to sort you out. We have collectors.<br>
      Use the link below to schedule, find a collector and clear your garbage!`;
      const receivers = await User.query().where('role', 'customer').select('id', 'first_name', 'email');
      receivers.forEach(async (receiver) => 
        await mailService.sendMail({
          from: `"Bebataka" <${process.env.MAIL_USER}>`,
          to: receiver.email,
          text,
          html: getMailTemplate({
            title: "Get rid of takataka 🗑",
            firstName: receiver.first_name,
            text,
          }),
          subject: "Take out your trash"
        }));
    } catch (error) {
      throw error;
    }
  });
}

export const sendCustomerIntroMail = async (firstName: string, toEmail: string) => {
  const mailService = new MailingService({
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASSWORD!,
    host: "smtp.gmail.com",
    port: 587
  });

  try {
    const isConnVerified = await mailService.verifyConnection();
    if (!isConnVerified) {
      return;
    }

    await mailService.sendMail({
      from: `"Bebataka" <${process.env.MAIL_USER}>`,
      to: toEmail,
      html: getCustomerIntroMailTemplate({
        firstName,
      }),
      subject: "Welcome"
    });
  } catch (error) {
    throw error;
  }
}
