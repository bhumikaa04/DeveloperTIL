import {useState} from 'react'; 
import axios from 'axios'; 

const API_URL = 'http://localhost:5000/user'

function Login({ onSwitchToRegister, onAuthSuccess }) {
    const [formData, setFormData] = useState({
      identifier: '', // Accepts either Email or Username
      password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async(e) => {
        e.preventDefault(); 
        setLoading(true); 
        setError(''); 

        try{
            const response = await axios.post(`${API_URL}/login`, formData); 

            //save token and info
            localStorage.setItem('token' , response.data.token); 
            localStorage.setItem('user', JSON.stringify(response.data.user)); 

            if (onAuthSuccess) onAuthSuccess(response.data.user);
        }catch(err){
            alert("Failed to login to your account"); 
            setError(err.response?.data?.message ||"Failed to login to your account"); 
            return ; 
        }finally{
            setLoading(false); 
        }
    }

    return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/80 shadow-xl p-8 space-y-6">
        
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Log in to manage your notes</p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              name="identifier"
              required
              placeholder="alex@example.com or alex_dev"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-semibold rounded-lg text-sm shadow-md transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* SWITCH PAGE */}
        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-600 font-bold hover:underline"
          >
            Create one
          </button>
        </div>

      </div>
    </div>
  );
}

export default Login; 