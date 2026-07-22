type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendReportEmail({ to, subject, text, html }: SendEmailArgs) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.REPORT_FROM_EMAIL?.trim() || "Riple Reports <onboarding@resend.dev>";

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }
  if (!to) {
    throw new Error("REPORT_EMAIL is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html
    })
  });

  const body = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(
      body.error?.message || body.message || `Resend error (${response.status})`
    );
  }

  return { id: body.id ?? null };
}
