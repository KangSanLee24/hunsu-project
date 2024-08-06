import 'reflect-metadata';

const COLUMN_KEY = Symbol('VIRTUAL_COLUMN');

export function VirtualColumn(name?: string): PropertyDecorator {
  return (target, propertyKey) => {
    const metaInfo = Reflect.getMetadata(COLUMN_KEY, target) || {};
    metaInfo[propertyKey] = name ?? propertyKey;
    Reflect.defineMetadata(COLUMN_KEY, metaInfo, target);
  };
}
