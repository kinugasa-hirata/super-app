import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export default async function EstimatesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin');
  }
  
  const estimates = await prisma.estimate.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      estimateNumber: true,
      clientName: true,
      projectName: true,
      total: true,
      issueDate: true,
      createdAt: true,
    },
  }).catch(() => []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">見積書一覧</h1>
        <Link
          href="/estimates/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          新規見積書作成
        </Link>
      </div>
      
      {estimates.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">見積番号</th>
                  <th className="px-4 py-2 text-left">顧客名</th>
                  <th className="px-4 py-2 text-left">プロジェクト</th>
                  <th className="px-4 py-2 text-center">発行日</th>
                  <th className="px-4 py-2 text-right">金額</th>
                  <th className="px-4 py-2 text-center">アクション</th>
                </tr>
              </thead>
              <tbody>
                {estimates.map((estimate) => (
                  <tr key={estimate.id} className="border-t">
                    <td className="px-4 py-3">{estimate.estimateNumber}</td>
                    <td className="px-4 py-3">{estimate.clientName}</td>
                    <td className="px-4 py-3">{estimate.projectName}</td>
                    <td className="px-4 py-3 text-center">{estimate.issueDate}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(estimate.total)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link
                          href={`/estimates/${estimate.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          詳細
                        </Link>
                        <Link
                          href={`/api/generate-pdf?id=${estimate.id}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          PDF
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">見積書がありません。新しい見積書を作成しましょう。</p>
          <Link
            href="/estimates/new"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            新規見積書作成
          </Link>
        </div>
      )}
    </div>
  );
}