/**
 * Server-side profanity filter for user-generated content.
 *
 * Matches whole words (with common l33t-speak substitutions) so legitimate
 * words like "class" or "assistant" aren't incorrectly flagged.
 */

// Banned words list — covers profanity, slurs, and hate speech commonly
// blocked on social media platforms. Kept as a Set for O(1) lookup.
const BANNED_WORDS = new Set([
  // Profanity
  "fuck", "fucking", "fucked", "fucker", "fuckers", "fucks",
  "shit", "shitty", "shitting", "bullshit",
  "ass", "asshole", "assholes",
  "bitch", "bitches", "bitchy",
  "damn", "damned", "damnit", "goddamn",
  "hell",
  "crap", "crappy",
  "dick", "dicks", "dickhead",
  "cock", "cocks", "cocksucker",
  "cunt", "cunts",
  "piss", "pissed", "pissing",
  "bastard", "bastards",
  "whore", "whores",
  "slut", "sluts", "slutty",
  "hoe", "hoes",
  // Racial / ethnic slurs
  "nigger", "niggers", "nigga", "niggas",
  "spic", "spics",
  "chink", "chinks",
  "kike", "kikes",
  "wetback", "wetbacks",
  "beaner", "beaners",
  "gook", "gooks",
  "cracker", "crackers",
  "honky", "honkey",
  "gringo", "gringos",
  "coon", "coons",
  "towelhead", "raghead",
  // Homophobic / transphobic slurs
  "fag", "fags", "faggot", "faggots",
  "dyke", "dykes",
  "tranny", "trannies",
  // Ableist slurs
  "retard", "retarded", "retards",
  // Sexual / explicit
  "porn", "porno", "pornography",
  "dildo", "dildos",
  "jerkoff", "jackoff",
  "wank", "wanker", "wankers",
  "tits", "titty", "titties",
  // Violent / threatening
  "stfu", "gtfo", "kys",
  // Misc vulgar
  "twat", "twats",
  "motherfucker", "motherfuckers", "motherfucking", "mofo",
  "douchebag", "douchebags", "douche",
  "scumbag", "scumbags",
]);

// Common l33t-speak substitutions: 0→o, 1→i/l, 3→e, 4→a, 5→s, 7→t, @→a, $→s
const LEET_MAP: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a",
  "5": "s", "7": "t", "@": "a", "$": "s",
};

/** Normalise a token by lowering + replacing common l33t substitutions. */
function normalise(word: string): string {
  return word
    .toLowerCase()
    .replace(/[013457@$]/g, (ch) => LEET_MAP[ch] ?? ch);
}

/**
 * Check if a piece of text contains banned / vulgar words.
 *
 * @returns The first matched banned word (normalised) or `null` if clean.
 */
export function containsProfanity(text: string): string | null {
  // Split on non-letter / non-number boundaries to get individual tokens
  const tokens = text.split(/[^a-zA-Z0-9@$]+/);

  for (const raw of tokens) {
    if (!raw) continue;
    const normalised = normalise(raw);
    if (BANNED_WORDS.has(normalised)) return normalised;
  }

  return null;
}
