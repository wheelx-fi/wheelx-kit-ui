export const toRegex = /^\/[a-zA-Z0-9]+$/
export const toAndTokenRegex = /^\/(?!from)[a-zA-Z0-9-+]+&[a-zA-Z0-9-+.₮Ï]+$/
export const fromRegex = /^\/from&[a-zA-Z0-9-+]+$/
export const fromAndTokenRegex = /^\/from&[a-zA-Z0-9-+]+&[a-zA-Z0-9-+.₮Ï]+$/
export const fromAndToRegex = /^\/[a-zA-Z0-9-+]+\/[a-zA-Z0-9-+]+$/
export const fromAndTokenAndToAndTokenRegex =
  /^\/[a-zA-Z0-9-+]+&[a-zA-Z0-9-+.₮Ï]+\/[a-zA-Z0-9-+]+&[a-zA-Z0-9-+.₮Ï]+$/

const allRegexPatterns = [
  toRegex,
  toAndTokenRegex,
  fromRegex,
  fromAndTokenRegex,
  fromAndToRegex,
  fromAndTokenAndToAndTokenRegex
]
export function matchesAnyPatternUsingArray(inputString: string): boolean {
  return allRegexPatterns.some((regex) => regex.test(inputString))
}
