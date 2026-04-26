type DateValue = Date | string | number;

const toTimestamp = (value: DateValue) => new Date(value).getTime();

export const installMockSystemDate = (initialValue: DateValue) => {
  const RealDate = Date;
  let currentTimestamp = toTimestamp(initialValue);

  function MockDate(this: unknown, ...args: unknown[]) {
    if (!new.target) {
      return new RealDate(currentTimestamp).toString();
    }

    const values = args.length > 0 ? args : [currentTimestamp];

    return Reflect.construct(RealDate, values, new.target);
  }

  MockDate.now = () => currentTimestamp;
  MockDate.parse = RealDate.parse;
  MockDate.UTC = RealDate.UTC;
  MockDate.prototype = RealDate.prototype;
  Object.setPrototypeOf(MockDate, RealDate);

  global.Date = MockDate as unknown as DateConstructor;

  return {
    set(value: DateValue) {
      currentTimestamp = toTimestamp(value);
    },
    restore() {
      global.Date = RealDate;
    },
  };
};
