import {useState} from 'react'; 
import axios from 'axios'; 

const API_URL = 'http://localhost:5000/user'; 

function Register({onSwitchToLogin, onAuthSuccess}){
    //get all the constants
    const [formData ,setFormData] = useState({
        name : '', 
        username : '', 
        email : '' , 
        password :'', 
        role : 'user', 
    }); 
    const [loading , setLoading] = useState(false); 
    const [error , setError] = useState(''); 

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name] : e.target.value}); 
    }

    const handleSubmit = async(e) => {
        e.preventDefault(); 
        setError(''); 
        setLoading(true); 

        try{
            const response = await axios.post(`${API_URL}/register` , formData); 

            //store auth context 
            localStorage.setItem('token' , response.data.token); 
            localStorage.setItem('user', JSON.stringify(response.data.user)); 

            if (onAuthSuccess) onAuthSuccess(response.data.user);

        }catch(err){
            alert("Failed to register your account"); 
            setError(err.response?.data?.message ||"Failed to register your account"); 
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
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 text-sm">Join Developers TIL to save your learning path</p>
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
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Alex Johnson"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Username</label>
            <input
              type="text"
              name="username"
              required
              placeholder="alex_dev"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              placeholder="alex@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg text-sm shadow-md shadow-indigo-100 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        {/* SWITCH PAGE */}
        <div className="text-center pt-2 text-xs text-slate-500">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-600 font-bold hover:underline"
          >
            Log In
          </button>
        </div>

      </div>
    </div>
  );
}

export default Register ; 