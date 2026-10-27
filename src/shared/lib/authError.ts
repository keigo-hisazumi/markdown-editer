/**
 * Firebase Authentication のエラーを、利用者向けの日本語メッセージへ変換する（共通実装）。
 */
export function authErrorMessage(e: unknown): string {
  const code = typeof e === 'object' && e !== null && 'code' in e
    ? String((e as { code: unknown }).code)
    : ''
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'メールアドレスまたはパスワードが正しくありません'
    case 'auth/email-already-in-use':
      return 'このメールアドレスはすでに使用されています'
    case 'auth/weak-password':
      return 'パスワードは6文字以上で入力してください'
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません'
    case 'auth/too-many-requests':
      return 'しばらくしてから再度お試しください'
    case 'auth/network-request-failed':
      return 'ネットワークに接続できません。通信環境をご確認ください'
    default:
      return 'エラーが発生しました。もう一度お試しください'
  }
}
