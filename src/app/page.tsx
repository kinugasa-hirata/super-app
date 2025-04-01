import { getServerSession } from 'next-auth/next';
import { authOptions } from './api/auth/[...nextauth]/route';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
      <h1 className="text-4xl font-bold mb-6">Super-App</h1>
      <p className="text-xl text-gray-600 mb-8">ビジネスを加速するアプリケーション</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-3">見積書管理</h2>
          <p className="text-gray-600 mb-4">
            プロフェッショナルな見積書を簡単に作成、管理、PDFで出力できます。
          </p>
          {session ? (
            <Link
              href="/estimates"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              見積書を作成する
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              ログインして開始
            </Link>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-3">今後の機能</h2>
          <p className="text-gray-600 mb-4">
            請求書管理、顧客管理、在庫管理など、さらに便利な機能が追加予定です。
          </p>
          <p className="text-blue-600">近日公開予定</p>
        </div>
      </div>
    </div>
  );
}