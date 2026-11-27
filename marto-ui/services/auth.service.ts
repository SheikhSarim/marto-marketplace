import { apiClient } from "@/lib/api-client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ApiNotAvailableError } from "@/lib/api/errors";
import {
  RegisterCustomerDto,
  LoginCustomerDto,
  EmailDto,
  ResetPasswordDto,
  RequestEmailChangeDto,
  VerifyEmailChangeDto,
  ChangePasswordDto,
} from "@/types";

export const authService = {
  async checkSession() {
    if (!ENDPOINTS.AUTH_SESSION.available) {
      throw new ApiNotAvailableError(
        "AUTH_SESSION",
        "GET",
        ENDPOINTS.AUTH_SESSION.path,
      );
    }
    return apiClient.get(ENDPOINTS.AUTH_SESSION.path);
  },

  async loginAdmin(credentials: LoginCustomerDto) {
    if (!ENDPOINTS.AUTH_ADMIN_LOGIN.available) {
      throw new ApiNotAvailableError(
        "AUTH_ADMIN_LOGIN",
        "POST",
        ENDPOINTS.AUTH_ADMIN_LOGIN.path,
      );
    }
    return apiClient.post(
      ENDPOINTS.AUTH_ADMIN_LOGIN.path,
      { email: credentials.email.trim(), password: credentials.password },
      { skipRefreshRetry: true },
    );
  },

  async loginSeller(credentials: LoginCustomerDto) {
    if (!ENDPOINTS.AUTH_SELLER_LOGIN.available) {
      throw new ApiNotAvailableError(
        "AUTH_SELLER_LOGIN",
        "POST",
        ENDPOINTS.AUTH_SELLER_LOGIN.path,
      );
    }
    return apiClient.post(
      ENDPOINTS.AUTH_SELLER_LOGIN.path,
      { email: credentials.email.trim(), password: credentials.password },
      { skipRefreshRetry: true },
    );
  },

  async loginCustomer(credentials: LoginCustomerDto) {
    if (!ENDPOINTS.AUTH_CUSTOMER_LOGIN.available) {
      throw new ApiNotAvailableError(
        "AUTH_CUSTOMER_LOGIN",
        "POST",
        ENDPOINTS.AUTH_CUSTOMER_LOGIN.path,
      );
    }
    return apiClient.post(
      ENDPOINTS.AUTH_CUSTOMER_LOGIN.path,
      { email: credentials.email.trim(), password: credentials.password },
      { skipRefreshRetry: true },
    );
  },

  async registerCustomer(dto: RegisterCustomerDto) {
    if (!ENDPOINTS.AUTH_REGISTER_CUSTOMER.available) {
      throw new ApiNotAvailableError(
        "AUTH_REGISTER_CUSTOMER",
        "POST",
        ENDPOINTS.AUTH_REGISTER_CUSTOMER.path,
      );
    }
    return apiClient.post(
      ENDPOINTS.AUTH_REGISTER_CUSTOMER.path,
      {
        full_name: dto.full_name.trim(),
        email: dto.email.trim(),
        password: dto.password,
        ...(dto.phone?.trim() ? { phone: dto.phone.trim() } : {}),
      },
      { skipRefreshRetry: true },
    );
  },

  async registerSeller(formData: FormData) {
    if (!ENDPOINTS.AUTH_REGISTER_SELLER.available) {
      throw new ApiNotAvailableError(
        "AUTH_REGISTER_SELLER",
        "POST",
        ENDPOINTS.AUTH_REGISTER_SELLER.path,
      );
    }
    return apiClient.post(ENDPOINTS.AUTH_REGISTER_SELLER.path, formData, {
      skipRefreshRetry: true,
    });
  },

  async verifyEmail(token: string) {
    if (!ENDPOINTS.AUTH_VERIFY_EMAIL.available) {
      throw new ApiNotAvailableError(
        "AUTH_VERIFY_EMAIL",
        "GET",
        ENDPOINTS.AUTH_VERIFY_EMAIL.path,
      );
    }
    return apiClient.get(
      `${ENDPOINTS.AUTH_VERIFY_EMAIL.path}?token=${encodeURIComponent(token.trim())}`,
      { skipAuth: true, skipRefreshRetry: true },
    );
  },

  async resendCustomerVerification(dto: EmailDto) {
    return apiClient.post(
      ENDPOINTS.AUTH_CUSTOMER_RESEND_VERIFICATION.path,
      { email: dto.email.trim() },
      { skipRefreshRetry: true },
    );
  },

  async forgotCustomerPassword(dto: EmailDto) {
    return apiClient.post(
      ENDPOINTS.AUTH_CUSTOMER_FORGOT_PASSWORD.path,
      { email: dto.email.trim() },
      { skipRefreshRetry: true },
    );
  },

  async resetCustomerPassword(dto: ResetPasswordDto) {
    return apiClient.post(
      ENDPOINTS.AUTH_CUSTOMER_RESET_PASSWORD.path,
      { token: dto.token, password: dto.password },
      { skipRefreshRetry: true },
    );
  },

  async requestEmailChange(dto: RequestEmailChangeDto) {
    if (!ENDPOINTS.AUTH_EMAIL_CHANGE_REQUEST.available) {
      throw new ApiNotAvailableError(
        "AUTH_EMAIL_CHANGE_REQUEST",
        "POST",
        ENDPOINTS.AUTH_EMAIL_CHANGE_REQUEST.path,
      );
    }
    return apiClient.post(
      ENDPOINTS.AUTH_EMAIL_CHANGE_REQUEST.path,
      {
        current_password: dto.current_password,
        new_email: dto.new_email.trim(),
      },
      { skipRefreshRetry: true },
    );
  },

  async verifyEmailChange(dto: VerifyEmailChangeDto) {
    if (!ENDPOINTS.AUTH_EMAIL_VERIFY.available) {
      throw new ApiNotAvailableError(
        "AUTH_EMAIL_VERIFY",
        "POST",
        ENDPOINTS.AUTH_EMAIL_VERIFY.path,
      );
    }
    return apiClient.post(
      ENDPOINTS.AUTH_EMAIL_VERIFY.path,
      { token: dto.token.trim() },
      { skipAuth: true, skipRefreshRetry: true },
    );
  },
  async changePassword(dto: ChangePasswordDto) {
    if (!ENDPOINTS.AUTH_CHANGE_PASSWORD.available) {
      throw new ApiNotAvailableError(
        "AUTH_CHANGE_PASSWORD",
        "PATCH",
        ENDPOINTS.AUTH_CHANGE_PASSWORD.path,
      );
    }
    return apiClient.patch(
      ENDPOINTS.AUTH_CHANGE_PASSWORD.path,
      {
        current_password: dto.current_password,
        new_password: dto.new_password,
      },
      { skipRefreshRetry: true },
    );
  },

  async logout() {
    return apiClient.post(
      ENDPOINTS.AUTH_LOGOUT.path,
      {},
      { skipRefreshRetry: true },
    );
  },
};
