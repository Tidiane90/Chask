/* eslint-disable import/prefer-default-export */
/* eslint-disable linebreak-style */
import nodemailer from 'nodemailer';

const from = '"Chask" <info@chask.com>' 
function setup() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
}

export function sendConfirmationEmail(user) {
    const transport = setup();
    const email = {
        from,
        to: user.email,
        subject: "Welcome to Chask",
        text: `
        Welcome to Survey. Please confirm your email.

        ${user.generateConfirmationUrl()}
        `
    }
    transport.sendMail(email);
}

export function sendResetPasswordEmail(user) {
    const transport = setup();
    const email = {
        from,
        to: user.email,
        subject: "Reset password",
        text: `
        To reset password follow this link.

        ${user.generateResetPasswordLink()}
        `
    }
    transport.sendMail(email);
}

export function sendConfirmationrResetPasswordEmail(user) {
    const transport = setup();
    const email = {
        from,
        to: user.email,
        subject: "Confirmation reset password",
        text: `
        Hey, you changed your password. If ypu haven't done it, contact us please.
        `
    }
    transport.sendMail(email);
}