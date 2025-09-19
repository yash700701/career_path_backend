import { Resend } from "resend";

const api = process.env.RESEND_API_KEY;
const resend = new Resend(api);

export async function sendEmail({ to, subject, html }) {
    try {
        const data = await resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject,
            html,
        });

        return data;
    } catch (error) {
        console.error("❌ Email send error:", error);
        throw new Error("Failed to send email");
    }
}
