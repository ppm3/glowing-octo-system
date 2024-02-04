import { GeneralError } from './general.error';

describe('GeneralError', () => {
    test('should create an instance of GeneralError with the correct name and message', () => {
        const errorMessage = 'This is a general error';
        const error = new GeneralError(errorMessage);

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('ApiGeneralError');
        expect(error.message).toBe(errorMessage);
    });
});