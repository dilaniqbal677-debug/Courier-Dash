import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { auth, getTopScores } from '../firebase';
import { Trophy, User, X, LogIn } from 'lucide-react';

export const LeaderboardModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [scores, setScores] = useState<any[]>([]);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOpen) {
      getTopScores(10).then(setScores);
    }
  }, [isOpen]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      getTopScores(10).then(setScores);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#0c1322] border-2 border-sky-900 rounded-3xl p-5 sm:p-6 w-full max-w-sm text-white shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-5">
          <Trophy className="text-amber-400" size={28} />
          <h2 className="text-2xl font-black tracking-wider uppercase">Leaderboard</h2>
        </div>

        {!user ? (
          <div className="mb-4 bg-sky-950/40 border border-sky-800/60 rounded-2xl p-3 flex items-center justify-between gap-3">
            <span className="text-xs text-sky-200">Login untuk mencatatkan skor Anda ke Global Leaderboard.</span>
            <button 
              onClick={handleLogin} 
              className="py-2 px-3 bg-gradient-to-r from-sky-600 to-blue-700 rounded-xl font-black text-xs whitespace-nowrap flex items-center gap-1.5 hover:from-sky-500 hover:to-blue-600 transition cursor-pointer"
            >
              <LogIn size={14} /> Login
            </button>
          </div>
        ) : (
          <div className="mb-4 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl p-3 flex items-center gap-2">
            <User size={16} className="text-emerald-400" />
            <span className="text-xs text-emerald-200 font-bold truncate">Login sebagai: {user.displayName || user.email}</span>
          </div>
        )}

        <div className="space-y-3">
          {scores.length > 0 ? (
            scores.map((s, i) => (
              <div key={i} className={`flex items-center justify-between bg-slate-800/50 p-3 rounded-2xl border ${i < 3 ? 'border-amber-500/30' : 'border-slate-700'}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-lg ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-orange-700' : 'text-slate-500'}`}>
                    {i + 1}
                  </span>
                  <User size={18} className="text-slate-400" />
                  <span className="font-bold text-sm truncate max-w-[140px]">{s.username}</span>
                </div>
                <span className="font-black text-amber-400 tabular-nums text-sm">{s.score.toLocaleString()}</span>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 py-6 text-sm">Belum ada skor yang tercatat di leaderboard.</p>
          )}
        </div>
      </div>
    </div>
  );
};
