import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))  # Fallback to 587 if not set
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "DDumba.AI Editorial")

def send_smtp_email(to_email: str, subject: str, html_content: str):
    """Establishes resilient mail handling across cPanel infrastructure blocks."""
    if not all([SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD]):
        print("⚠️ Mailer skipped: SMTP credentials are not fully configured.")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_content, "html"))

    try:
        # If port is 465, run legacy strict implicit SSL
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())
        else:
            # Standard production port (587) with explicit STARTTLS upgrading
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.ehlo()
                server.starttls()  # Secure the channel natively
                server.ehlo()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())
                
        print(f"✅ Dispatched email delivery update cleanly to: {to_email}")
    except Exception as e:
        print(f"❌ Failed email delivery loop to {to_email}: {str(e)}")
# ============================================
# TEMPLATE WORKERS
# ============================================

def send_welcome_email(to_email: str):
    subject = "Welcome to DDumba.AI · Production AI Infrastructure Newsletter"
    html = f"""
    <html>
        <body style="font-family: sans-serif; color: #1f2937; line-height: 1.6; padding: 24px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981; font-weight: 800;">Welcome to DDumba.AI!</h2>
            <p>Thank you for subscribing. You'll receive deep-dive engineering essays covering production infrastructure strategies:</p>
            <ul style="padding-left: 20px;">
                <li>High-efficiency LLM serving using <strong>vLLM</strong></li>
                <li>Production-grade <strong>RAG Pipelines</strong> & Agent designs</li>
                <li>Kubernetes clustering, cost-scaling, and telemetry observability</li>
            </ul>
            <p style="margin-top: 24px;">Essays deliver right into your inbox with no spam or fluff.</p>
            <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="font-size: 11px; color: #6b7280;">You received this because you signed up at DDumba.AI.</p>
        </body>
    </html>
    """
    send_smtp_email(to_email, subject, html)

def broadcast_new_post_email(subscribers: list, post_title: str, post_excerpt: str, post_slug: str):
    frontend_domain = "https://ddumba.ai" 
    article_url = f"{frontend_domain}/blog/{post_slug}"
    
    subject = f"New Essay: {post_title}"
    
    for email in subscribers:
        html = f"""
        <html>
            <body style="font-family: sans-serif; color: #1f2937; line-height: 1.6; padding: 24px; max-width: 600px; margin: 0 auto;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #10b981; font-weight: bold;">New Editorial Release</div>
                <h1 style="font-size: 24px; margin-top: 4px; color: #111827;">{post_title}</h1>
                <p style="font-size: 15px; color: #4b5563; font-style: italic;">"{post_excerpt}"</p>
                <div style="margin: 28px 0;">
                    <a href="{article_url}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Read Full Technical Essay</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
                <p style="font-size: 11px; color: #6b7280;">Sent by DDumba.AI · Production AI Infrastructure Editorial.<br/>You are subscribed as {email}.</p>
            </body>
        </html>
        """
        send_smtp_email(email, subject, html)