export type CommonKey = string | number
export type ValidKey = CommonKey | symbol

export type UntypedObject = Record<ValidKey, unknown>
export type AnyObject = UntypedObject | unknown[] | Iterable<unknown>
