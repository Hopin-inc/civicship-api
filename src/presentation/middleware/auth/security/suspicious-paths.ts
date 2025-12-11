export const SUSPICIOUS_PATH_PATTERNS: RegExp[] = [
  // Archive scanning
  /\.zip$/i,
  /\.tar$/i,
  /\.tar\.gz$/i,
  /\.gz$/i,
  /\.rar$/i,
  /\.7z$/i,

  // Source code / environment discovery
  /^\/\.?env/i,
  /^\/\.git/i,
  /^\/\.svn/i,
  /^\/\.hg/i,

  // Path traversal
  /\.\.\//,
  /\.\.%2f/i,

  // OS-level sensitive files
  /^\/etc\/passwd/i,
  /^\/proc\/self/i,
];

export function isSuspiciousPath(url: string | undefined): boolean {
  if (!url) return false;
  return SUSPICIOUS_PATH_PATTERNS.some((pattern) => pattern.test(url));
}
