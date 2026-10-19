// Mock OTP verification service for demo & simulated onboarding

export const DEMO_OTP_CODE = "123456";

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  demoOtp: string;
  expiresInSeconds: number;
}

export interface OtpVerificationResponse {
  verified: boolean;
  message: string;
}

export async function requestEmailOtp(email: string): Promise<OtpRequestResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!email || !email.includes("@")) {
    throw new Error("Invalid email address provided for OTP generation");
  }

  return {
    success: true,
    message: `Mock 6-digit OTP code dispatched to ${email}.`,
    demoOtp: DEMO_OTP_CODE,
    expiresInSeconds: 300,
  };
}

export async function verifyEmailOtp(
  email: string,
  otp: string
): Promise<OtpVerificationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (otp.trim() === DEMO_OTP_CODE || otp.trim() === "000000") {
    return {
      verified: true,
      message: `Email address ${email} successfully verified (simulated).`,
    };
  }

  return {
    verified: false,
    message: `Invalid OTP code. Please enter the demo code: ${DEMO_OTP_CODE}.`,
  };
}

export async function requestPhoneOtp(phone: string): Promise<OtpRequestResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!phone || phone.length < 10) {
    throw new Error("Invalid mobile number provided for OTP generation");
  }

  return {
    success: true,
    message: `Mock SMS OTP code sent to +91 ${phone}.`,
    demoOtp: DEMO_OTP_CODE,
    expiresInSeconds: 300,
  };
}

export async function verifyPhoneOtp(
  phone: string,
  otp: string
): Promise<OtpVerificationResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (otp.trim() === DEMO_OTP_CODE || otp.trim() === "000000") {
    return {
      verified: true,
      message: `Mobile number +91 ${phone} successfully verified (simulated).`,
    };
  }

  return {
    verified: false,
    message: `Invalid SMS OTP. Please enter the demo code: ${DEMO_OTP_CODE}.`,
  };
}
