import {
  extractUidFromIdToken,
} from '../../../presentation/middleware/rate-limit';

function makeJwt(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${body}.fakesignature`;
}

describe('extractUidFromIdToken', () => {
  it('正常な JWT から sub を返す', () => {
    const token = makeJwt({ sub: 'user-abc', iat: 1700000000 });
    expect(extractUidFromIdToken(token)).toBe('user-abc');
  });

  it('sub が存在しない場合は null を返す', () => {
    const token = makeJwt({ iat: 1700000000 });
    expect(extractUidFromIdToken(token)).toBeNull();
  });

  it('sub が文字列でない場合は null を返す', () => {
    const token = makeJwt({ sub: 12345 });
    expect(extractUidFromIdToken(token)).toBeNull();
  });

  it('セグメントが 2 つしかない（署名なし）場合は null を返す', () => {
    const header = Buffer.from('{}').toString('base64url');
    const body = Buffer.from(JSON.stringify({ sub: 'user-abc' })).toString('base64url');
    expect(extractUidFromIdToken(`${header}.${body}`)).toBeNull();
  });

  it('ペイロードが不正な Base64 の場合は null を返す', () => {
    expect(extractUidFromIdToken('header.!!!invalid!!!.sig')).toBeNull();
  });

  it('ペイロードが JSON でない場合は null を返す', () => {
    const notJson = Buffer.from('not-json').toString('base64url');
    expect(extractUidFromIdToken(`header.${notJson}.sig`)).toBeNull();
  });

  it('空文字列の場合は null を返す', () => {
    expect(extractUidFromIdToken('')).toBeNull();
  });
});

describe('sessionLoginRateLimit keyGenerator ロジック', () => {
  it('有効な idToken がある場合は IP:UID 複合キーを生成する', () => {
    const uid = 'firebase-user-xyz';
    const token = makeJwt({ sub: uid });
    // keyGenerator と同じロジックをインラインで検証
    const ip = '10.0.0.1';
    const extracted = extractUidFromIdToken(token);
    expect(extracted).toBe(uid);
    expect(`${ip}:${extracted}`).toBe(`10.0.0.1:${uid}`);
  });

  it('idToken がない場合は IP のみをキーとして使用する', () => {
    const extracted = extractUidFromIdToken('');
    expect(extracted).toBeNull();
    // null の場合は IP フォールバック
  });

  it('sub のない idToken の場合は IP のみをキーとして使用する', () => {
    const token = makeJwt({ email: 'user@example.com' });
    const extracted = extractUidFromIdToken(token);
    expect(extracted).toBeNull();
  });

  it('Cloud Run 共有 IP + 異なるユーザーは別のキーになる', () => {
    const sharedIp = '34.84.100.1';
    const tokenA = makeJwt({ sub: 'uid-A' });
    const tokenB = makeJwt({ sub: 'uid-B' });
    const keyA = `${sharedIp}:${extractUidFromIdToken(tokenA)}`;
    const keyB = `${sharedIp}:${extractUidFromIdToken(tokenB)}`;
    expect(keyA).not.toBe(keyB);
  });
});

