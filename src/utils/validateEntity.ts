import schema from '../../schema/entity.schema.json';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function validateValue(key: string, value: any, rule: any): string[] {
  const errs: string[] = [];
  if (rule.type) {
    if (rule.type === 'array') {
      if (!Array.isArray(value)) {
        errs.push(`${key} should be array`);
        return errs;
      }
      if (rule.minItems && value.length < rule.minItems) {
        errs.push(`${key} requires at least ${rule.minItems} items`);
      }
      if (rule.items) {
        value.forEach((v: any, i: number) => {
          if (typeof v !== rule.items.type) {
            errs.push(`${key}[${i}] should be ${rule.items.type}`);
          }
        });
      }
    } else if (rule.type === 'object') {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        errs.push(`${key} should be object`);
        return errs;
      }
      if (rule.required) {
        rule.required.forEach((r: string) => {
          if (value[r] === undefined) {
            errs.push(`${key}.${r} is required`);
          }
        });
      }
      if (rule.properties) {
        Object.entries(rule.properties).forEach(([prop, propRule]) => {
          if (value[prop] !== undefined) {
            errs.push(
              ...validateValue(`${key}.${prop}`, value[prop], propRule)
            );
          }
        });
      }
    } else {
      if (typeof value !== rule.type) {
        errs.push(`${key} should be ${rule.type}`);
        return errs;
      }
      if (rule.pattern && typeof value === 'string') {
        const re = new RegExp(rule.pattern);
        if (!re.test(value)) {
          errs.push(`${key} does not match pattern`);
        }
      }
      if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
        errs.push(`${key} length < ${rule.minLength}`);
      }
      if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
        errs.push(`${key} length > ${rule.maxLength}`);
      }
      if (rule.minimum !== undefined && typeof value === 'number' && value < rule.minimum) {
        errs.push(`${key} < ${rule.minimum}`);
      }
      if (rule.maximum !== undefined && typeof value === 'number' && value > rule.maximum) {
        errs.push(`${key} > ${rule.maximum}`);
      }
      if (rule.enum && !rule.enum.includes(value)) {
        errs.push(`${key} not in enum`);
      }
      if (rule.format === 'uri' && typeof value === 'string') {
        try {
          new URL(value);
        } catch {
          errs.push(`${key} is not a valid URI`);
        }
      }
      if (rule.format === 'date' && typeof value === 'string') {
        if (isNaN(Date.parse(value))) {
          errs.push(`${key} is not a valid date`);
        }
      }
    }
  }
  return errs;
}

export function validateEntities(entities: any[]): ValidationResult {
  const errors: string[] = [];
  entities.forEach((entity, idx) => {
    schema.required.forEach((r: string) => {
      if (entity[r] === undefined) {
        errors.push(`Entity ${entity.id || idx} missing required '${r}'`);
      }
    });
    Object.entries(schema.properties).forEach(([key, rule]: [string, any]) => {
      if (entity[key] !== undefined) {
        errors.push(...validateValue(key, entity[key], rule));
      }
    });
    if (!schema.additionalProperties) {
      Object.keys(entity).forEach((k) => {
        if (!schema.properties[k as keyof typeof schema.properties]) {
          errors.push(`Entity ${entity.id || idx} has unknown property '${k}'`);
        }
      });
    }
  });
  const valid = errors.length === 0;
  if (!valid && import.meta.env.DEV) {
    console.warn(
      '%cEntity validation failed',
      'border:1px solid red; padding:4px; color:red;',
      errors
    );
  }
  return { valid, errors };
}
