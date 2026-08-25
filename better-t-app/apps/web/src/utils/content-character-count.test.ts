import { expect, test } from "bun:test";

import { countContentCharacters } from "./content-character-count";

test("本文のUnicode文字数を数える", () => {
  expect(countContentCharacters("記事の本文😀")).toBe(6);
});