import { NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  recaptchaToken: string;
}

export async function POST(request: Request) {
  try {
    const data: ContactFormData = await request.json();

    const { name, email, message, recaptchaToken } = data;

    const secretKey = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA secret key not configured.' },
        { status: 500 }
      );
    }

    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

    const verificationResponse = await fetch(verificationURL, {
      method: 'POST',
    });

    const verificationData = await verificationResponse.json();

    if (!verificationData.success) {
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA verification failed.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Form submitted successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error.' },
      { status: 500 }
    );
  }
}
