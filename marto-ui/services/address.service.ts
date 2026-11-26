import { ENDPOINTS } from '@/lib/api/endpoints';
import { ApiNotAvailableError } from '@/lib/api/errors';
import { Address, ApiResponse } from '@/types';

export const addressService = {
  async getUserAddresses(): Promise<ApiResponse<Address[]>> {
    throw new ApiNotAvailableError(
      'CUSTOMER_ADDRESSES',
      ENDPOINTS.CUSTOMER_ADDRESSES.method,
      ENDPOINTS.CUSTOMER_ADDRESSES.path,
      'Saved customer delivery addresses endpoint is not yet exposed by the backend.'
    );
  },
};
