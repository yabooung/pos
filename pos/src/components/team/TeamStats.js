export default function TeamStats({ teamId }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">승</h4>
        <p className="text-3xl font-bold text-indigo-600">12</p>
        <p className="text-sm text-gray-500 mt-1">이번 시즌</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">무</h4>
        <p className="text-3xl font-bold text-indigo-600">3</p>
        <p className="text-sm text-gray-500 mt-1">이번 시즌</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">패</h4>
        <p className="text-3xl font-bold text-indigo-600">5</p>
        <p className="text-sm text-gray-500 mt-1">이번 시즌</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">득점</h4>
        <p className="text-3xl font-bold text-indigo-600">35</p>
        <p className="text-sm text-gray-500 mt-1">이번 시즌</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">실점</h4>
        <p className="text-3xl font-bold text-indigo-600">20</p>
        <p className="text-sm text-gray-500 mt-1">이번 시즌</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-lg font-medium text-gray-900 mb-2">순위</h4>
        <p className="text-3xl font-bold text-indigo-600">3</p>
        <p className="text-sm text-gray-500 mt-1">현재</p>
      </div>
    </div>
  );
} 