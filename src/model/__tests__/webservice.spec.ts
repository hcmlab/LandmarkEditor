import { describe, expect, it } from 'vitest';
import { WebServiceFaceModel } from '../webserviceFace';
import { urlError } from '../../enums/urlError';

describe('WebServiceModel class', () => {
  describe('verifyUrl function', () => {
    it('should return null when a valid URL is given', async () => {
      const goodUrl = 'https://www.google.com';
      const res = await WebServiceFaceModel.verifyUrl(goodUrl);
      expect(res).toBeNull();
    });

    it('should return urlError.InvalidUrl when an invalid URL is given', async () => {
      const badUrl = 'someBadUrl';
      const res = await WebServiceFaceModel.verifyUrl(badUrl);
      expect(res).toBe(urlError.InvalidUrl);
    });

    it('should return urlError.Unreachable when a URL is not reachable', async () => {
      const unreachableUrl = 'https://unbekannt.rz.uni-augsburg.de';
      const res = await WebServiceFaceModel.verifyUrl(unreachableUrl);
      expect(res).toBe(urlError.Unreachable);
    });
  });
});
