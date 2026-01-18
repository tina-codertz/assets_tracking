import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../pages/context/AuthContext';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const{token} = useParams();
    const [password, setPassword] = useState();
    const[confirmPassword, setConfirmPassword] = useState("");
    const[loading, setLoading]= useState(false);
    const {resetPassword} = useAuth();
    const navigate= useNavigate();

    const handleSubmit = async (e) =>{
        e.preventDefault();
        if (password !== confirmPassword){
            toast.error("Password do not match");
            return;
        }
        setLoading(true)

        const result = await resetPassword(token, password);

        if(result.success){
            toast.success("Password reset successfully");
            navigate("/auth")

        }else{
            toast.error(result.error)
        }
        setLoading(false)
    }
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
        <div className='w-full max-w-md bg-white rounded-2xl shadow-lg p-8'>
            <h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>Reset Password</h2>
            <form className='space-y-6' onSubmit={handleSubmit}>
                <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>New Password</label>
                    <input
                    type="password"
                    value={password}
                    onChange ={(e)=> setPassword(e.target.value)}
                    required
                    placeholder='Enter new password'
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  </div>
);
}

export default ResetPassword