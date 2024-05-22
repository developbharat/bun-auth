import { customAlphabet } from 'nanoid';

export const Random = {
  oneTimePasscode(): string {
    return customAlphabet('0123456789', 6)();
  },
};
