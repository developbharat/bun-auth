import { describe, expect, test } from 'bun:test';
import { Elysia } from 'elysia';
import { Auth } from '../../src';

describe('units.Auth', () => {
  test('.build() returns Elysia application instance', () => {
    const auth = new Auth().build();
    expect(auth).toBeInstanceOf(Elysia);
  });
});
