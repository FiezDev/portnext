import { createContact } from '@/services/contact';
import { apiClient } from '@/services/baseApi';

jest.mock('@/services/baseApi', () => ({
  apiClient: { post: jest.fn() },
}));

const mockedPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;

describe('createContact (T10 — plain fetch replaces the react-query mutation)', () => {
  const payload = {
    name: 'Ittipol',
    email: 'test@example.com',
    message: 'hello',
    recaptchaToken: 'tok',
  };

  beforeEach(() => mockedPost.mockReset());

  it('AC-T10-1 resolves with the API response on success', async () => {
    mockedPost.mockResolvedValue({ data: { success: true, message: 'ok' } });
    await expect(createContact(payload)).resolves.toEqual({
      success: true,
      message: 'ok',
    });
    expect(mockedPost).toHaveBeenCalledWith('v1/contact/', payload);
  });

  it('AC-T10-1 rejects on error so the caller owns the catch UX', async () => {
    mockedPost.mockRejectedValue(new Error('network down'));
    await expect(createContact(payload)).rejects.toThrow('network down');
  });
});
