import { LoggerUtils as Logger } from './logger.utils';

describe('Logger', () => {
    let mockLog: jest.Mock;
    let mockInfo: jest.Mock;
    let mockWarn: jest.Mock;
    let mockDebug: jest.Mock;
    let mockError: jest.Mock;

    beforeEach(() => {
        mockLog = jest.fn();
        mockInfo = jest.fn();
        mockWarn = jest.fn();
        mockDebug = jest.fn();
        mockError = jest.fn();
    });

    test.each([
        ['info'],
        ['warn'],
        ['debug'],
        ['error'],
        ['log'],
    ])('should create a Logger with level %s and default functions', (level) => {
        const logger = new Logger(level, mockLog, mockInfo, mockWarn, mockDebug, mockError);

        expect(logger).toBeDefined();
        expect(logger.level).toBe(level.toLowerCase());
    });


    test('should convert the level to lowercase', () => {
        const mixedCaseLevel = 'InFo';
        const logger = new Logger(mixedCaseLevel, mockLog, mockInfo, mockWarn, mockDebug, mockError);
        expect(logger.level).toBe(mixedCaseLevel.toLowerCase());
    });

    test('should handle an empty string as level', () => {
        const logger = new Logger('', mockLog, mockInfo, mockWarn, mockDebug, mockError);
        expect(logger.level).toBe('');
    });
});
