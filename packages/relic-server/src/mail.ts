/**
 * Outbound mail, over Resend's HTTP API.
 *
 * One call, no SDK. The service had exactly one dependency before this and
 * still does: a `fetch` against a documented endpoint is smaller than a
 * package, and the whole surface here is a single POST.
 *
 * What this file will not do is decide that a failure is unimportant. The
 * mailer it returns throws, loudly and with the provider's own reason
 * attached, and the caller decides what a failed send costs the response.
 */
import type { Mailer } from './app.ts';

const ENDPOINT = 'https://api.resend.com/emails';

/**
 * Resend refuses a request with no `User-Agent` outright, with a 403 rather
 * than a validation error, which reads exactly like a bad key. Stated in their
 * API reference, and cheap to satisfy.
 */
const USER_AGENT = 'relic/1.0 (+https://relik.link)';

/** What Resend said when it refused, so a log line names the actual cause. */
export class MailRefusedError extends Error {
  constructor(
    readonly status: number,
    /** Resend's own error name, when the body carried one. */
    readonly code: string,
    detail: string
  ) {
    super(`resend refused with ${status} ${code}: ${detail}`);
  }
}

export interface ResendMailerOptions {
  readonly apiKey: string;
  /** `Name <address@domain>` or a bare address, on the verified domain. */
  readonly from: string;
  /** Injected so a test asserts the request without a network. */
  readonly fetch?: typeof globalThis.fetch;
}

/**
 * The body of the sign-in mail.
 *
 * Plain text as well as HTML, deliberately. Resend will synthesize a text part
 * from the HTML if one is missing, and a synthesized part is a worse version of
 * the one sentence this message actually contains.
 *
 * The link is the whole message. No branding, no marketing, nothing that reads
 * like a newsletter, because a message that looks like an announcement is a
 * message a spam filter treats like one.
 */
export function signInMail(link: string): {
  readonly subject: string;
  readonly text: string;
  readonly html: string;
} {
  const subject = 'Your Relic sign-in link';
  const text = [
    'Open this link to comment on the relic you were reading:',
    '',
    link,
    '',
    'The link is single use and expires shortly. If you did not ask to sign',
    'in, nothing has happened and you can ignore this message.',
  ].join('\n');
  // Escaping matters even here: the link carries a token this service
  // generated, but it is still interpolated into markup, and a mail client is
  // a renderer like any other.
  const href = escapeHtml(link);
  const html = [
    '<p>Open this link to comment on the relic you were reading:</p>',
    `<p><a href="${href}">${href}</a></p>`,
    '<p>The link is single use and expires shortly. If you did not ask to ',
    'sign in, nothing has happened and you can ignore this message.</p>',
  ].join('');
  return { subject, text, html };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * A mailer that actually sends.
 *
 * Resend answering 200 means Resend accepted the message, not that it arrived.
 * That distinction is real and this code cannot close it: what it can do is
 * refuse to report an acceptance it did not get.
 */
export function resendMailer(options: ResendMailerOptions): Mailer {
  const call = options.fetch ?? globalThis.fetch;

  return {
    async send(email: string, link: string): Promise<void> {
      const mail = signInMail(link);
      const response = await call(ENDPOINT, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${options.apiKey}`,
          'user-agent': USER_AGENT,
        },
        body: JSON.stringify({
          from: options.from,
          to: email,
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
        }),
      });

      if (response.ok) return;

      // The body is the only place the reason lives. A status alone cannot
      // tell an unverified domain from a suspended key, and those are
      // different jobs for whoever reads the log.
      let code = 'unknown';
      let detail = '';
      try {
        const body = (await response.json()) as Record<string, unknown>;
        if (typeof body['name'] === 'string') code = body['name'];
        else if (typeof body['code'] === 'string') code = body['code'];
        if (typeof body['message'] === 'string') detail = body['message'];
      } catch {
        // A refusal with an unreadable body is still a refusal, and the status
        // is worth more than nothing.
      }
      throw new MailRefusedError(response.status, code, detail);
    },
  };
}

/**
 * The mailer the deployment gets, or nothing, said out loud.
 *
 * `NULL_MAILER` exists so a deployment without mail cannot leak addresses to a
 * half-built integration. Its comment claimed the resulting failure was loud.
 * It was not: the sign-in endpoint answers 202 whether or not anything was
 * sent, on purpose, so an unconfigured deployment looks exactly like a working
 * one from the outside. This is the line that makes it loud, on the inside.
 */
export function mailerFromEnv(
  env: Record<string, string | undefined>,
  log: (message: string) => void = console.error
): Mailer | undefined {
  const apiKey = env['RELIC_RESEND_API_KEY'];
  const from = env['RELIC_MAIL_FROM'];
  if (
    apiKey !== undefined &&
    apiKey.length > 0 &&
    from !== undefined &&
    from.length > 0
  ) {
    return resendMailer({ apiKey, from });
  }

  const missing = [
    ...(apiKey === undefined || apiKey.length === 0
      ? ['RELIC_RESEND_API_KEY']
      : []),
    ...(from === undefined || from.length === 0 ? ['RELIC_MAIL_FROM'] : []),
  ];
  log(
    `relic: mail is not configured (${missing.join(', ')} unset). ` +
      'Sign-in links will not be sent, and the request endpoint will still ' +
      'answer 202, so nobody can complete a comment.'
  );
  return undefined;
}
