import * as O from "fp-ts/Option";
import * as t from "io-ts";

import { identity, pipe } from "fp-ts/function";

import { NonEmptyArray } from "fp-ts/NonEmptyArray";

const isDefined = <T>(t: T): t is NonNullable<T> =>
  pipe(O.fromNullable(t), O.isSome);

const getOrThrow = <T>(t: T) =>
  pipe(
    t,
    O.fromPredicate(isDefined),
    O.fold(() => {
      throw new Error("Expected Some but got None");
    }, identity)
  );

type LiteralValue = string | number | boolean;

export type TaggedUnionMember<
  A extends object,
  Tag extends keyof A,
  Value extends A[Tag]
> = Extract<
  A,
  {
    [K in Tag]: Value;
  }
>;

export type TagValue<A, Tag extends keyof A> = A[Tag] & (string | number);

export type Match<A extends object, Tag extends keyof A> = <R>(
  handlers: {
    [K in TagValue<A, Tag>]: (x: TaggedUnionMember<A, Tag, K>) => R;
  }
) => (a: A) => R;

export type Constructors<A extends object, Tag extends keyof A> = {
  [K in TagValue<A, Tag>]: (x: Omit<TaggedUnionMember<A, Tag, K>, Tag>) => A;
};

export type Guards<A extends object, Tag extends keyof A> = {
  [K in TagValue<A, Tag>]: (x: A) => x is TaggedUnionMember<A, Tag, K>;
};

export type RecordOf<C extends t.TaggedUnionType<any, any>> = {
  [K in t.OutputOf<C>["tag"]]: Extract<t.OutputOf<C>, { tag: K }>["value"];
};
/**
 * This function isn't part of io-ts public API.
 * @link https://github.com/gcanti/io-ts/blob/master/src/index.ts#L2400
 */
const getIndex = (
  codecs: NonEmptyArray<t.Any>
): [string, NonEmptyArray<NonEmptyArray<LiteralValue>>] | undefined =>
  (t as any).getIndex(codecs);
const getTaggedUnionConstructors = <T extends t.TaggedUnionType<any, any>>(
  type: T
): Constructors<t.TypeOf<T>, T["tag"]> => {
  const [, index] = pipe(getIndex(type.types), (value) =>
    typeof value !== "undefined" ? value : []
  );
  const r: any = {};

  if (typeof index === "undefined") return r;

  for (let i = 0; i < index.length; i++) {
    const value = getOrThrow(index[i])[0];
    r[String(value)] = (x: any) => ({ [type.tag]: value, ...x });
  }
  return r;
};
const getTaggedUnionMatch =
  <T extends t.TaggedUnionType<any, any>>(
    type: T
  ): Match<t.TypeOf<T>, T["tag"]> =>
  (handlers) =>
  (a) =>
    (handlers as any)[a[type.tag]](a);
const getTaggedUnionGuards = <T extends t.TaggedUnionType<any, any>>(
  type: T
): Guards<t.TypeOf<T>, T["tag"]> => {
  const [, index] = pipe(getIndex(type.types), (value) =>
    typeof value !== "undefined" ? value : []
  );
  const r: any = {};

  if (typeof index === "undefined") return r;

  for (let i = 0; i < index.length; i++) {
    const value = getOrThrow(index[i])[0];
    r[String(value)] = (x: any) => x[type.tag] === value;
  }
  return r;
};

export const stringEnum = <T>(enumObj: T, enumName: string) =>
  new t.Type<T[keyof T], string>(
    enumName,
    (u): u is T[keyof T] => Object.values(enumObj).includes(u),
    (u, c) =>
      Object.values(enumObj).includes(u)
        ? t.success(u as T[keyof T])
        : t.failure(u, c),
    (a) => a as unknown as string
  );

export function taggedUnionMember<T extends string>(
  tag: T
): t.TypeC<{ tag: t.LiteralC<T> }>;
export function taggedUnionMember<T extends string, C extends t.Mixed>(
  tag: T,
  codec: C
): t.TypeC<{ tag: t.LiteralC<T>; value: C }>;

// eslint-disable-next-line func-style
export function taggedUnionMember<T extends string, C extends t.Mixed>(
  tag: T,
  codec?: C
) {
  if (typeof codec !== "undefined")
    return t.type({ tag: t.literal(tag), value: codec });

  return t.type({ tag: t.literal(tag) });
}

export const createTaggedUnion = <
  CS extends [t.Mixed, t.Mixed, ...Array<t.Mixed>]
>(
  codecs: CS
) => t.taggedUnion("tag", codecs);
/**
 * Sugar to mimick the structure that `unionize` is returning.
 * We get type constructors and typeguards under `is` and the match under `match`.
 *
 * @example
 * const A = t.type({})
 * const B = t.type({})
 * const C = t.taggedUnion('tag', [A, B])
 *
 * const T = createTaggedUnion(C)
 *
 * T.A(); => A
 * T.B(); => B
 *
 * T.is.A()// => Boolean
 * T.match(value, {
 *   A: () => R
 * }) => R
 *
 */

export const createStructuredTaggedUnion = <
  C extends t.TaggedUnionType<any, any>
>(
  codec: C
) => ({
  ...getTaggedUnionConstructors(codec),
  is: getTaggedUnionGuards(codec),
  match: getTaggedUnionMatch(codec),
});

export const assertion = <T>() =>
  new t.Type<T>(
    "assertion",
    (_u): _u is T => true,
    (i) => t.success(i as T),
    identity
  );

export * from "io-ts";
