import { describe, expect, test } from 'bun:test';
import {
  MailRefusedError,
  mailerFromEnv,
  resendMailer,
  signInMail,
} from '../src/mail.ts';

const LINK = 'https://relik.link/api/auth/callback?token=abc123&next=%2Fx';

/** Captures one outbound request without a network. */
function recorder(response: Response): {
  readonly calls: { url: string; init: RequestInit }[];
  readonly fetch: typeof globalThis.fetch;
} {
  const calls: { url: string; init: RequestInit }[] = [];
  return {
    calls,
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({ url: String(input), init: init ?? {} });
      return response;
    }) as typeof globalThis.fetch,
  };
}

function accepted(): Response {
  return new Response(JSON.stringify({ id: 'e1' }), { status: 200 });
}

describe('the sign-in mail', () => {
  test('the link is the message, in both parts', () => {
    const mail = signInMail(LINK);
    expect(mail.subject).toBe('Your Relic sign-in link');
    expect(mail.text).toContain(LINK);
    // Single use and expiring is the part a recipient needs, and the part that
    // makes an unexpected message safe to ignore.
    expect(mail.text).toContain('single use');
    expect(mail.text).toContain('did not ask');
  });

  test('the link is escaped into the markup, not pasted into it', () => {
    // A token is service-generated, and it is still interpolated into markup
    // that a mail client renders.
    const mail = signInMail('https://relik.link/cb?a=1&b="><script>x</script>');
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&amp;');
    expect(mail.html).toContain('&quot;');
  });
});

describe('sending through Resend', () => {
  test('the request is the documented one', async () => {
    const wire = recorder(accepted());
    await resendMailer({
      apiKey: 're_test_key',
      from: 'Relic <no-reply@relik.link>',
      fetch: wire.fetch,
    }).send('ada@example.com', LINK);

    const call = wire.calls[0];
    if (call === undefined) throw new Error('nothing was sent');
    expect(call.url).toBe('https://api.resend.com/emails');
    expect(call.init.method).toBe('POST');

    const headers = call.init.headers as Record<string, string>;
    expect(headers['authorization']).toBe('Bearer re_test_key');
    // Resend answers 403 to a request with no user agent, which reads exactly
    // like a bad key. Omitting it costs an afternoon.
    expect(headers['user-agent']).toContain('relic/');
    expect(headers['content-type']).toBe('application/json');

    const body = JSON.parse(String(call.init.body)) as Record<string, unknown>;
    expect(body['from']).toBe('Relic <no-reply@relik.link>');
    expect(body['to']).toBe('ada@example.com');
    expect(body['subject']).toBe('Your Relic sign-in link');
    expect(String(body['text'])).toContain(LINK);
    expect(String(body['html'])).toContain('href=');
  });

  test('the key is never in the body it sends', async () => {
    const wire = recorder(accepted());
    await resendMailer({
      apiKey: 're_secret_value',
      from: 'no-reply@relik.link',
      fetch: wire.fetch,
    }).send('ada@example.com', LINK);
    expect(String(wire.calls[0]?.init.body)).not.toContain('re_secret_value');
  });

  test('an unverified domain is reported as itself', async () => {
    // The refusal that will actually happen first, before DNS propagates.
    const wire = recorder(
      new Response(
        JSON.stringify({
          statusCode: 403,
          name: 'validation_error',
          message: 'The relik.link domain is not verified.',
        }),
        { status: 403 }
      )
    );
    const send = resendMailer({
      apiKey: 're_test_key',
      from: 'no-reply@relik.link',
      fetch: wire.fetch,
    }).send('ada@example.com', LINK);

    await expect(send).rejects.toBeInstanceOf(MailRefusedError);
    await send.catch((error: MailRefusedError) => {
      expect(error.status).toBe(403);
      expect(error.code).toBe('validation_error');
      // The operator has to be able to tell this from a bad key without
      // guessing, so the provider's own sentence rides along.
      expect(error.message).toContain('not verified');
    });
  });

  test('a refusal with an unreadable body is still a refusal', async () => {
    const wire = recorder(
      new Response('<html>gateway</html>', { status: 502 })
    );
    const send = resendMailer({
      apiKey: 're_test_key',
      from: 'no-reply@relik.link',
      fetch: wire.fetch,
    }).send('ada@example.com', LINK);
    await expect(send).rejects.toBeInstanceOf(MailRefusedError);
    await send.catch((error: MailRefusedError) => {
      expect(error.status).toBe(502);
      expect(error.code).toBe('unknown');
    });
  });
});

describe('what the deployment gets', () => {
  test('both halves present builds a real mailer', () => {
    const said: string[] = [];
    const mailer = mailerFromEnv(
      {
        RELIC_RESEND_API_KEY: 're_test_key',
        RELIC_MAIL_FROM: 'no-reply@relik.link',
      },
      (message) => said.push(message)
    );
    expect(mailer).not.toBeUndefined();
    expect(said).toEqual([]);
  });

  test('a missing key is said out loud, and names what it costs', () => {
    // The defect this replaces: an unconfigured deployment was indistinguishable
    // from a working one, because the endpoint answers 202 either way.
    const said: string[] = [];
    const mailer = mailerFromEnv(
      { RELIC_MAIL_FROM: 'no-reply@relik.link' },
      (message) => said.push(message)
    );
    expect(mailer).toBeUndefined();
    expect(said[0]).toContain('RELIC_RESEND_API_KEY');
    expect(said[0]).toContain('202');
  });

  test('a missing from address is not papered over with a default', () => {
    // Guessing a from address means guessing a verified domain, and a wrong
    // guess is a 403 on every send.
    const said: string[] = [];
    expect(
      mailerFromEnv({ RELIC_RESEND_API_KEY: 're_test_key' }, (message) =>
        said.push(message)
      )
    ).toBeUndefined();
    expect(said[0]).toContain('RELIC_MAIL_FROM');
  });

  test('an empty string is unset, not configured', () => {
    // Terraform passes "" for an unset variable, which is the shape this will
    // actually arrive in before the flag is flipped.
    const said: string[] = [];
    expect(
      mailerFromEnv(
        { RELIC_RESEND_API_KEY: '', RELIC_MAIL_FROM: '' },
        (message) => said.push(message)
      )
    ).toBeUndefined();
    expect(said[0]).toContain('RELIC_RESEND_API_KEY');
    expect(said[0]).toContain('RELIC_MAIL_FROM');
  });
});
