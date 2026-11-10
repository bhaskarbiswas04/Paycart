
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-slate-900">PayCart</h1>

        <p className="mt-3 text-slate-500">
          Your shopping experience starts here.
        </p>

        <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Start Shopping
        </button>
      </div>
    </div>
  );
}

export default App;
