import { Award, CheckCircle2, Package, MapPin, X } from 'lucide-react';
import { DailyMission } from '../game/missions';

export function DailyMissionsModal({
  isOpen,
  onClose,
  missions,
  onClaim,
}: {
  isOpen: boolean;
  onClose: () => void;
  missions: DailyMission[];
  onClaim: (mission: DailyMission) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl text-white my-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black flex items-center gap-2">
            <Award className="text-amber-400" /> Tugas Harian
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {missions.map((m) => (
            <div key={m.id} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${m.type === 'deliver_packages' ? 'bg-amber-950 text-amber-400' : 'bg-sky-950 text-sky-400'}`}>
                  {m.type === 'deliver_packages' ? <Package size={20} /> : <MapPin size={20} />}
                </div>
                <div>
                  <div className="text-xs font-bold">{m.description}</div>
                  <div className="text-[10px] text-slate-400">{Math.min(m.progress, m.target)} / {m.target}</div>
                </div>
              </div>
              {m.claimed ? (
                <CheckCircle2 className="text-emerald-500" size={24} />
              ) : m.completed ? (
                <button
                  onClick={() => onClaim(m)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg active:scale-95 cursor-pointer"
                >
                  Klaim {m.reward} 🪙
                </button>
              ) : (
                <div className="text-[10px] text-slate-500 font-medium">Belum</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
