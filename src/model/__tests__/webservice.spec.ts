import { describe, it, expect } from 'vitest';
import { WebServiceModel } from '../webservice';
import { urlError } from '../../enums/urlError';

describe('WebServiceModel class', () => {
  describe('verifyUrl function', () => {
    it('should return null when a valid URL is given', async () => {
      const goodUrl = 'https://www.google.com';
      const res = await WebServiceModel.verifyUrl(goodUrl);
      expect(res).toBeNull();
    });

    it('should return urlError.InvalidUrl when an invalid URL is given', async () => {
      const badUrl = 'someBadUrl';
      const res = await WebServiceModel.verifyUrl(badUrl);
      expect(res).toBe(urlError.InvalidUrl);
    });

    it('should return urlError.Unreachable when a URL is not reachable', async () => {
      const unreachableUrl = 'https://unbekannt.rz.uni-augsburg.de';
      const res = await WebServiceModel.verifyUrl(unreachableUrl);
      expect(res).toBe(urlError.Unreachable);
    });
  });
});
