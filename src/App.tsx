import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Play, Sparkles, Package, MapPin, ShieldAlert, Award, Volume2, VolumeX, RotateCcw, Star } from 'lucide-react';
import { GameCanvas } from './game/GameCanvas';
import { createExplosion } from './game/explosion';
import { HUD } from './components/HUD';
import { GameNotification, GameNotice, NoticeTheme } from './components/GameNotification';
import { GameOverModal } from './components/GameOverModal';
import { ShopModal } from './components/ShopModal';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { TouchControls } from './components/TouchControls';
import { BossDefeatedOverlay } from './components/BossDefeatedOverlay';
import { HomeScreen } from './components/overlays/HomeScreen';
import { CourierSkin, INITIAL_SKINS, TokoTarget, PowerupType, POWERUPS, PermanentUpgrades, INITIAL_PERMANENT_UPGRADES, OrderMissionInfo } from './game/constants';
import { DailyMission, generateDailyMissions } from './game/missions';
import { LeaderboardModal } from './components/LeaderboardModal';
import { sounds } from './audio/soundManager';
import { auth } from './firebase';

export default function App() {
  // Game states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isCinematicCrashing, setIsCinematicCrashing] = useState<boolean>(false);

  // Persistent player data (localStorage)
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('courier_highscore') || '0', 10);
  });
  const [coins, setCoins] = useState<number>(() => {
    return parseInt(localStorage.getItem('courier_coins') || '50', 10);
  });
  const [keys, setKeys] = useState<number>(() => {
    const saved = localStorage.getItem('courier_keys');
    return saved !== null ? parseInt(saved, 10) : 15;
  });
  const [vouchers, setVouchers] = useState<number>(() => {
    return parseInt(localStorage.getItem('courier_vouchers') || '0', 10);
  });
  const [permanentUpgrades, setPermanentUpgrades] = useState<PermanentUpgrades>(() => {
    const saved = localStorage.getItem('courier_permanent_upgrades');
    if (saved) {
      try {
        return { ...INITIAL_PERMANENT_UPGRADES, ...JSON.parse(saved) };
      } catch {
        return INITIAL_PERMANENT_UPGRADES;
      }
    }
    return INITIAL_PERMANENT_UPGRADES;
  });
  const [powerupLevels, setPowerupLevels] = useState<Record<PowerupType, number>>(() => {
    try {
      const saved = localStorage.getItem('courier_powerup_levels');
      return saved ? JSON.parse(saved) : { magnet: 1, shield: 1, speed: 1, double_score: 1 };
    } catch {
      return { magnet: 1, shield: 1, speed: 1, double_score: 1 };
    }
  });
  const [skins, setSkins] = useState<CourierSkin[]>(() => {
    const saved = localStorage.getItem('courier_skins_v3');
    if (saved) {
      try {
        const parsed: CourierSkin[] = JSON.parse(saved);
        return INITIAL_SKINS.map((initSkin) => {
          const match = parsed.find((p) => p.id === initSkin.id);
          if (!match) return initSkin;
          return {
            ...initSkin,
            unlocked: match.unlocked || initSkin.unlocked,
            activeOutfitId: match.activeOutfitId || initSkin.activeOutfitId,
            outfits: initSkin.outfits?.map((o) => {
              const matchedOutfit = match.outfits?.find((mo) => mo.id === o.id);
              return matchedOutfit ? { ...o, unlocked: matchedOutfit.unlocked || o.unlocked } : o;
            }),
          };
        });
      } catch {
        return INITIAL_SKINS;
      }
    }
    return INITIAL_SKINS;
  });
  const [selectedSkinId, setSelectedSkinId] = useState<string>(() => {
    return localStorage.getItem('courier_selected_skin') || 'default';
  });

  // Current run stats
  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [packagesCarried, setPackagesCarried] = useState<number>(0);
  const [runCoins, setRunCoins] = useState<number>(0);
  const [tipsEarned, setTipsEarned] = useState<number>(0);

  // Final stats for game over screen
  const [finalStats, setFinalStats] = useState({
    score: 0,
    distance: 0,
    packages: 0,
    coins: 0,
    tips: 0,
  });
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Active Mission & Powerups
  const [activeToko, setActiveToko] = useState<TokoTarget | null>(null);
  const [activePowerups, setActivePowerups] = useState<Record<PowerupType, number>>({
    magnet: 0,
    shield: 0,
    speed: 0,
    double_score: 0,
  });

  // Daily Missions
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);
  const [lastMissionReset, setLastMissionReset] = useState<string>('');


  // Mobile touch signal
  const [touchSignal, setTouchSignal] = useState<{
    direction: 'left' | 'right' | 'up' | 'down' | 'shoot';
    timestamp: number;
  } | null>(null);

  // Get active skin object (applying active outfit colors & hats if chosen)
  const currentSkin = useMemo<CourierSkin>(() => {
    const base = skins.find((s) => s.id === selectedSkinId) || skins[0];
    if (base.activeOutfitId && base.outfits) {
      const outfit = base.outfits.find((o) => o.id === base.activeOutfitId);
      if (outfit) {
        return {
          ...base,
          outfitName: outfit.name,
          jacketColor: outfit.jacketColor,
          helmetColor: outfit.helmetColor,
          backpackColor: outfit.backpackColor,
          hatType: (outfit.hatType || base.hatType) as any,
          avatarEmoji: outfit.avatarEmoji || base.avatarEmoji,
        };
      }
    }
    return base;
  }, [skins, selectedSkinId]);

  // Start / Restart game
  const [restartKey, setRestartKey] = useState<number>(1);
  // Unified Non-Overlapping Game Notification Center
  const [activeNotice, setActiveNotice] = useState<GameNotice | null>(null);
  const [weatherTint, setWeatherTint] = useState<string>('');
  const noticeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const dispatchNotice = useCallback(
    (newNotice: Omit<GameNotice, 'id' | 'timestamp'> & { duration?: number }) => {
      const timestamp = Date.now();
      const id = `${newNotice.category}_${timestamp}`;
      const notice: GameNotice = {
        ...newNotice,
        id,
        timestamp,
      };

      setActiveNotice((current) => {
        // If current notice is of strictly higher priority and still active, do not overwrite
        if (current && current.priority > notice.priority) {
          return current;
        }

        if (noticeTimerRef.current) {
          clearTimeout(noticeTimerRef.current);
        }

        const duration = newNotice.duration || 2600;
        noticeTimerRef.current = setTimeout(() => {
          setActiveNotice((latest) => (latest?.id === id ? null : latest));
        }, duration);

        return notice;
      });
    },
    []
  );

  const [bossDefeatedNotice, setBossDefeatedNotice] = useState<{ timestamp: number; voucherTotal: number } | null>(null);
  const [isVoucherAnimating, setIsVoucherAnimating] = useState<boolean>(false);
  const [currentWeather, setCurrentWeather] = useState<{ name: string; icon: string; desc: string }>({
    name: 'Cerah',
    icon: '☀️',
    desc: 'Jarak pandang optimal',
  });

  const [bossBattle, setBossBattle] = useState<{
    active: boolean;
    hp: number;
    maxHp: number;
    name: string;
    warningActive?: boolean;
    attackType?: string;
    warningLanes?: number[];
  } | null>(null);
  const [blasterAmmo, setBlasterAmmo] = useState<number>(0);
  const [orderMission, setOrderMission] = useState<OrderMissionInfo | null>(null);
  const prevWeatherRef = useRef<string>(currentWeather.name);

  // Atmospheric Weather Transition Effect
  useEffect(() => {
    if (!isPlaying) {
      prevWeatherRef.current = currentWeather.name;
      return;
    }
    if (prevWeatherRef.current && prevWeatherRef.current !== currentWeather.name) {
      prevWeatherRef.current = currentWeather.name;
      let ambientTint = 'bg-sky-500/10';
      let theme: NoticeTheme = 'sky';

      if (currentWeather.name.includes('Hujan')) {
        ambientTint = 'bg-blue-600/15 shadow-[inset_0_0_90px_rgba(30,58,138,0.5)]';
        theme = 'sky';
      } else if (currentWeather.name.includes('Kabut')) {
        ambientTint = 'bg-slate-400/20 shadow-[inset_0_0_100px_rgba(100,116,139,0.5)]';
        theme = 'sky';
      } else if (currentWeather.name.includes('Kosmik') || currentWeather.name.includes('Aurora') || currentWeather.name.includes('Badai')) {
        ambientTint = 'bg-purple-600/20 shadow-[inset_0_0_120px_rgba(147,51,234,0.6)]';
        theme = 'purple';
      } else if (currentWeather.name.includes('Cerah')) {
        ambientTint = 'bg-amber-400/10 shadow-[inset_0_0_80px_rgba(245,158,11,0.3)]';
        theme = 'amber';
      }

      setWeatherTint(ambientTint);
      dispatchNotice({
        category: 'weather',
        badge: 'KONDISI CUACA',
        title: `Cuaca: ${currentWeather.name}`,
        subtitle: currentWeather.desc,
        icon: currentWeather.icon,
        theme,
        priority: 40,
        duration: 2500,
      });

      const timer = setTimeout(() => {
        setWeatherTint('');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [currentWeather, isPlaying, dispatchNotice]);

  const startGame = useCallback(() => {
    setIsPlaying(true);
    setIsPaused(false);
    setIsGameOver(false);
    setIsShopOpen(false);
    setIsCinematicCrashing(false);
    setScore(0);
    setDistance(0);
    setPackagesCarried(0);
    setRunCoins(0);
    setTipsEarned(0);
    setBossBattle(null);
    setOrderMission(null);
    setBossDefeatedNotice(null);
    setActiveNotice(null);
    setWeatherTint('');
    if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
    setIsVoucherAnimating(false);
    setCurrentWeather({ name: 'Cerah', icon: '☀️', desc: 'Jarak pandang optimal' });
    setActivePowerups({ magnet: 0, shield: 0, speed: 0, double_score: 0 });
    setRestartKey((prev) => prev + 1);
    sounds.startBGM();
  }, []);

  const handleBossBattleUpdate = useCallback(
    (
      boss: {
        active: boolean;
        hp: number;
        maxHp: number;
        name: string;
        warningActive?: boolean;
        attackType?: string;
        warningLanes?: number[];
      } | null,
      ammo: number
    ) => {
      setBossBattle(boss);
      setBlasterAmmo(ammo);

      if (boss && boss.active && boss.warningActive) {
        const dodgeMsg =
          boss.attackType === 'spread_missile'
            ? 'Rudal menyebar ke 2 jalur! Lompat ke 1 jalur aman!'
            : boss.attackType === 'rapid_burst'
            ? 'Tembakan beruntun cepat! Segera beralih jalur!'
            : 'Laser membakar jalur merah! Pindah jalur sekarang!';

        dispatchNotice({
          category: 'boss',
          badge: 'DODGE NOW!',
          title: 'AWAS! SERANGAN BOS DITARGETKAN!',
          subtitle: dodgeMsg,
          icon: '⚠️',
          theme: 'rose',
          priority: 95,
          duration: 2200,
        });
      }
    },
    [dispatchNotice]
  );

  // Handle Score Updates from Three.js loop
  const handleScoreUpdate = useCallback(
    (newScore: number, newDist: number, newPackages: number, newCoins: number, newTips: number) => {
      setScore(newScore);
      setDistance(newDist);
      setPackagesCarried(newPackages);
      setRunCoins(newCoins);
      setTipsEarned(newTips);
    },
    []
  );

  const updateMissionProgress = useCallback((type: 'deliver_packages' | 'run_distance', amount: number) => {
    setDailyMissions((prev) => {
      const updated = prev.map((m) => {
        if (m.type === type && !m.completed) {
          const newProgress = Math.min(m.progress + amount, m.target);
          return {
            ...m,
            progress: newProgress,
            completed: newProgress >= m.target,
          };
        }
        return m;
      });
      localStorage.setItem('courier_daily_missions', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Handle Toko Drop delivery
  const handleDeliverSuccess = useCallback(
    (toko: TokoTarget, deliveredCount: number, bonusTip: number) => {
      dispatchNotice({
        category: 'delivery',
        badge: 'DELIVERY SUKSES',
        title: `${toko.name}`,
        subtitle: `+${deliveredCount} Box Elektronik • Tip: +Rp ${bonusTip.toLocaleString('id-ID')}`,
        icon: '🚀',
        theme: 'emerald',
        priority: 80,
        duration: 3000,
      });
      updateMissionProgress('deliver_packages', deliveredCount);
    },
    [dispatchNotice, updateMissionProgress]
  );

  const handleBossDefeated = useCallback(() => {
    setVouchers((prev) => {
      const newVouchers = prev + 1;
      localStorage.setItem('courier_vouchers', newVouchers.toString());
      setBossDefeatedNotice({ timestamp: Date.now(), voucherTotal: newVouchers });
      setIsVoucherAnimating(true);
      setTimeout(() => {
        setIsVoucherAnimating(false);
      }, 3800);
      return newVouchers;
    });
    sounds.playVoucherAward();
  }, []);

  // Handle Powerup pickup
  const handlePickupPowerup = useCallback(
    (type: PowerupType) => {
      const cfg = POWERUPS[type];
      setActivePowerups((prev) => ({
        ...prev,
        [type]: cfg.duration,
      }));
      if (type === 'shield') {
        dispatchNotice({
          category: 'powerup',
          badge: 'PERISAI TEMPUR',
          title: 'HND GUARD AKTIF!',
          subtitle: 'Perisai putar kebal benturan aktif!',
          icon: '🛡️',
          theme: 'sky',
          priority: 60,
          duration: 2000,
        });
      } else if (type === 'speed') {
        dispatchNotice({
          category: 'powerup',
          badge: 'TURBO FLIGHT',
          title: 'HND EXPRES TERBANG KILAT!',
          subtitle: 'Jubah & roket pendorong aktif • Kebal rintangan!',
          icon: '⚡',
          theme: 'amber',
          priority: 65,
          duration: 2200,
        });
      }
    },
    [dispatchNotice]
  );

  // Handle Game Over & Statistics Summary Panel
  const handleGameOver = useCallback(
    (stats: { score: number; distance: number; packages: number; coins: number; tips: number }) => {
      setIsPlaying(false);
      setIsGameOver(true);
      setIsCinematicCrashing(false);
      setActiveNotice(null);
      if (noticeTimerRef.current) clearTimeout(noticeTimerRef.current);
      setFinalStats(stats);

      updateMissionProgress('run_distance', stats.distance);

      // Save high score
      if (stats.score > highScore) {
        setHighScore(stats.score);
        setIsNewHighScore(true);
        localStorage.setItem('courier_highscore', stats.score.toString());
      } else {
        setIsNewHighScore(false);
      }

      // Save earned coins
      setCoins((prev) => {
        const nextTotal = prev + stats.coins;
        localStorage.setItem('courier_coins', nextTotal.toString());
        return nextTotal;
      });

      // Reset in-game temporary counters
      setActivePowerups({ magnet: 0, shield: 0, speed: 0, double_score: 0 });
      setPackagesCarried(0);
      setRunCoins(0);
      sounds.stopBGM();
    },
    [highScore, updateMissionProgress]
  );

  // Handle Active Toko target change
  const handleActiveTokoChange = useCallback((toko: TokoTarget) => {
    setActiveToko(toko);
  }, []);

  // Shop skin purchasing
  const handleBuySkin = (skinToBuy: CourierSkin) => {
    const isVouchers = skinToBuy.currency === 'vouchers';
    const isKeys = skinToBuy.currency === 'keys';
    if (isVouchers) {
      if (vouchers < skinToBuy.price) return;
      const newVouchers = vouchers - skinToBuy.price;
      setVouchers(newVouchers);
      localStorage.setItem('courier_vouchers', newVouchers.toString());
    } else if (isKeys) {
      if (keys < skinToBuy.price) return;
      const newKeys = keys - skinToBuy.price;
      setKeys(newKeys);
      localStorage.setItem('courier_keys', newKeys.toString());
    } else {
      if (coins < skinToBuy.price) return;
      const newCoins = coins - skinToBuy.price;
      setCoins(newCoins);
      localStorage.setItem('courier_coins', newCoins.toString());
    }

    const updatedSkins = skins.map((s) => (s.id === skinToBuy.id ? { ...s, unlocked: true } : s));
    setSkins(updatedSkins);
    localStorage.setItem('courier_skins_v3', JSON.stringify(updatedSkins));

    setSelectedSkinId(skinToBuy.id);
    localStorage.setItem('courier_selected_skin', skinToBuy.id);
  };

  const handleSelectSkin = (id: string, outfitId?: string) => {
    setSelectedSkinId(id);
    localStorage.setItem('courier_selected_skin', id);
    if (outfitId) {
      handleSelectOutfit(id, outfitId);
    }
  };

  const handleSelectOutfit = (skinId: string, outfitId: string) => {
    const updatedSkins = skins.map((s) => (s.id === skinId ? { ...s, activeOutfitId: outfitId } : s));
    setSkins(updatedSkins);
    localStorage.setItem('courier_skins_v3', JSON.stringify(updatedSkins));
  };

  const handleBuyOutfit = (skinId: string, outfitId: string) => {
    const targetSkin = skins.find((s) => s.id === skinId);
    if (!targetSkin || !targetSkin.outfits) return;
    const targetOutfit = targetSkin.outfits.find((o) => o.id === outfitId);
    if (!targetOutfit || targetOutfit.unlocked) return;

    const isVouchers = targetOutfit.currency === 'vouchers';
    const isKeys = targetOutfit.currency === 'keys';
    if (isVouchers) {
      if (vouchers < targetOutfit.price) return;
      const newVouchers = vouchers - targetOutfit.price;
      setVouchers(newVouchers);
      localStorage.setItem('courier_vouchers', newVouchers.toString());
    } else if (isKeys) {
      if (keys < targetOutfit.price) return;
      const newKeys = keys - targetOutfit.price;
      setKeys(newKeys);
      localStorage.setItem('courier_keys', newKeys.toString());
    } else {
      if (coins < targetOutfit.price) return;
      const newCoins = coins - targetOutfit.price;
      setCoins(newCoins);
      localStorage.setItem('courier_coins', newCoins.toString());
    }

    const updatedSkins = skins.map((s) => {
      if (s.id !== skinId) return s;
      return {
        ...s,
        activeOutfitId: outfitId,
        outfits: s.outfits?.map((o) => (o.id === outfitId ? { ...o, unlocked: true } : o)),
      };
    });
    setSkins(updatedSkins);
    localStorage.setItem('courier_skins_v3', JSON.stringify(updatedSkins));
  };

  // Permanent Stat Upgrade Handler (Voucher Exchange)
  const handleUpgradeStat = useCallback((statId: keyof PermanentUpgrades, cost: number) => {
    setVouchers((prevVouchers) => {
      if (prevVouchers < cost) return prevVouchers;
      const newVouchers = prevVouchers - cost;
      localStorage.setItem('courier_vouchers', newVouchers.toString());

      setPermanentUpgrades((prevUpgrades) => {
        const currentLvl = prevUpgrades[statId] || 0;
        const newUpgrades = {
          ...prevUpgrades,
          [statId]: currentLvl + 1,
        };
        localStorage.setItem('courier_permanent_upgrades', JSON.stringify(newUpgrades));
        return newUpgrades;
      });

      return newVouchers;
    });
  }, []);

  // Powerup Upgrade Handler (Coins)
  const handleUpgradePowerup = useCallback((type: PowerupType, cost: number) => {
    setCoins((prevCoins) => {
      if (prevCoins < cost) return prevCoins;
      const newCoins = prevCoins - cost;
      localStorage.setItem('courier_coins', newCoins.toString());

      setPowerupLevels((prev) => {
        const next = { ...prev, [type]: (prev[type] || 1) + 1 };
        localStorage.setItem('courier_powerup_levels', JSON.stringify(next));
        return next;
      });
      return newCoins;
    });
  }, []);

  // Voucher Legendary Skin / Outfit Unlock Handler
  const handleUnlockVoucherSkin = useCallback((skinId: string, outfitId?: string, cost?: number) => {
    const skin = skins.find((s) => s.id === skinId);
    if (!skin) return;
    const price = cost !== undefined ? cost : skin.price;

    setVouchers((prevVouchers) => {
      if (prevVouchers < price) return prevVouchers;
      const newVouchers = prevVouchers - price;
      localStorage.setItem('courier_vouchers', newVouchers.toString());

      setSkins((prevSkins) => {
        const updated = prevSkins.map((s) => {
          if (s.id === skinId) {
            return {
              ...s,
              unlocked: true,
              activeOutfitId: outfitId || s.activeOutfitId || s.outfits?.[0]?.id,
              outfits: s.outfits?.map((o) =>
                !outfitId || o.id === outfitId ? { ...o, unlocked: true } : o
              ),
            };
          }
          return s;
        });
        localStorage.setItem('courier_skins_v3', JSON.stringify(updated));
        return updated;
      });

      setSelectedSkinId(skinId);
      localStorage.setItem('courier_selected_skin', skinId);
      return newVouchers;
    });
  }, [skins]);

  const handleClaimMission = (mission: DailyMission) => {
    setCoins((prev) => {
      const nextTotal = prev + mission.reward;
      localStorage.setItem('courier_coins', nextTotal.toString());
      return nextTotal;
    });

    // Award +1 Key for completing mission
    setKeys((prev) => {
      const nextKeys = prev + 1;
      localStorage.setItem('courier_keys', nextKeys.toString());
      return nextKeys;
    });

    setDailyMissions((prev) => {
      const updated = prev.map((m) => (m.id === mission.id ? { ...m, claimed: true } : m));
      localStorage.setItem('courier_daily_missions', JSON.stringify(updated));
      return updated;
    });
  };

  const handleTriggerAction = (direction: 'left' | 'right' | 'up' | 'down' | 'shoot') => {
    setTouchSignal({ direction, timestamp: Date.now() });
  };

  // Keyboard shortcut to start game from home screen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isPlaying && !isGameOver && !isShopOpen) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          startGame();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying, isGameOver, isShopOpen, startGame]);

  // Daily Missions Logic
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedMissions = localStorage.getItem('courier_daily_missions');
    const savedDate = localStorage.getItem('courier_last_mission_reset');

    if (savedDate === today && savedMissions) {
      setDailyMissions(JSON.parse(savedMissions));
      setLastMissionReset(savedDate);
    } else {
      const newMissions = generateDailyMissions();
      setDailyMissions(newMissions);
      setLastMissionReset(today);
      localStorage.setItem('courier_daily_missions', JSON.stringify(newMissions));
      localStorage.setItem('courier_last_mission_reset', today);
    }
  }, []);

  useEffect(() => {
    console.log("Auth initialized:", auth.currentUser);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none font-sans">
      {/* 3D Game Canvas */}
      <GameCanvas
        isPlaying={isPlaying}
        isPaused={isPaused}
        selectedSkin={currentSkin}
        restartKey={restartKey}
        onScoreUpdate={handleScoreUpdate}
        onDeliverSuccess={handleDeliverSuccess}
        onPickupPowerup={handlePickupPowerup}
        onGameOver={handleGameOver}
        onActiveTokoChange={handleActiveTokoChange}
        onMissionOrderUpdate={setOrderMission}
        onPhaseAnnouncement={(title, subtitle, icon) => {
          dispatchNotice({
            category: 'phase',
            badge: icon === '🏭' ? 'AREA PACKING' : 'DISTRIK BARU',
            title,
            subtitle,
            icon,
            theme: icon === '🏭' ? 'amber' : 'sky',
            priority: 70,
            duration: 2800,
          });
        }}
        onWeatherChange={setCurrentWeather}
        onBossBattleUpdate={handleBossBattleUpdate}
        onBossDefeated={handleBossDefeated}
        permanentUpgrades={permanentUpgrades}
        powerupLevels={powerupLevels}
        swipeSignal={touchSignal}
        onCrashStart={(type, title, subtitle) => {
          setIsCinematicCrashing(true);
          const badge =
            type === 'trip_hurdle'
              ? 'TERSANDUNG'
              : type === 'overhead_impact'
              ? 'TERBENTUR'
              : type === 'boss_blast'
              ? 'TERHEMPAS'
              : type === 'midair_fall'
              ? 'JATUH DI UDARA'
              : 'TABRAKAN';
          const icon =
            type === 'trip_hurdle'
              ? '🪵'
              : type === 'overhead_impact'
              ? '🚧'
              : type === 'boss_blast'
              ? '💥'
              : type === 'midair_fall'
              ? '⚠️'
              : '🚗';
          dispatchNotice({
            category: 'crash',
            badge,
            title: title || 'Karakter Terhempas!',
            subtitle: subtitle || 'Sesi lari berakhir • Memulai ulang...',
            icon,
            theme: 'rose',
            priority: 100,
            duration: 2500,
          });
        }}
      />

      {/* Cinematic Movie Letterbox Bars (Top & Bottom) during grounded collision */}
      <div
        className={`fixed inset-x-0 top-0 h-[10vh] bg-black pointer-events-none z-30 transition-transform duration-500 ease-out shadow-2xl ${
          isCinematicCrashing ? 'translate-y-0' : '-translate-y-full'
        }`}
      />
      <div
        className={`fixed inset-x-0 bottom-0 h-[10vh] bg-black pointer-events-none z-30 transition-transform duration-500 ease-out shadow-2xl ${
          isCinematicCrashing ? 'translate-y-0' : 'translate-y-full'
        }`}
      />

      {/* Boss Special Attack Screen Edge Danger Vignette */}
      {isPlaying && bossBattle && bossBattle.active && bossBattle.warningActive && (
        <div className="fixed inset-0 pointer-events-none z-30 select-none overflow-hidden">
          <div className="absolute inset-0 border-[6px] sm:border-[10px] border-red-500/70 shadow-[inset_0_0_50px_rgba(239,68,68,0.35)] pointer-events-none" />
          <div className="absolute inset-0 bg-red-950/20 pointer-events-none" />
        </div>
      )}

      {/* Active In-Game HUD */}
      {isPlaying && (
        <>
          <HUD
            score={score}
            distance={distance}
            packagesCarried={packagesCarried}
            coins={coins + runCoins}
            tipsEarned={tipsEarned}
            vouchers={vouchers}
            isVoucherAnimating={isVoucherAnimating}
            activeToko={activeToko}
            orderMission={orderMission}
            activePowerups={activePowerups}
            weather={currentWeather}
            bossBattle={bossBattle}
            blasterAmmo={blasterAmmo}
            isPaused={isPaused}
            onTogglePause={() => {
              setIsPaused(!isPaused);
              if (!isPaused) sounds.stopBGM();
              else sounds.startBGM();
            }}
            onOpenShop={() => {
              setIsPaused(true);
              setIsShopOpen(true);
              sounds.stopBGM();
            }}
          />

          {/* Mobile Touch buttons */}
          <TouchControls onTriggerAction={handleTriggerAction} blasterAmmo={blasterAmmo} />
        </>
      )}

      {/* Smooth Atmospheric Weather Transition Vignette */}
      {isPlaying && weatherTint && (
        <div className={`fixed inset-0 ${weatherTint} transition-opacity duration-1000 pointer-events-none z-10`} />
      )}

      {/* Boss Defeated Voucher Earned Overlay */}
      {bossDefeatedNotice && (
        <BossDefeatedOverlay
          voucherTotal={bossDefeatedNotice.voucherTotal}
          onDismiss={() => setBossDefeatedNotice(null)}
        />
      )}

      {/* Unified Non-Overlapping In-Game Notification Banner */}
      <GameNotification notice={activeNotice} />

      {/* Start / Home Screen */}
      {!isPlaying && !isGameOver && (
        <HomeScreen
          currentSkin={currentSkin}
          highScore={highScore}
          coins={coins}
          keys={keys}
          vouchers={vouchers}
          onStartGame={startGame}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenMissions={() => setIsMissionsOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        />
      )}

      {/* Pause Screen Overlay */}
      {isPaused && !isShopOpen && isPlaying && (
        <div className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-6 text-center text-white shadow-2xl my-auto max-h-[92vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-2">Permainan Dijeda</h2>
            <p className="text-xs text-slate-400 mb-6">Kurir sedang istirahat sejenak di pinggir jalan.</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsPaused(false);
                  sounds.startBGM();
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 font-bold text-sm text-slate-950 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Play size={18} fill="currentColor" />
                <span>Lanjutkan Lari</span>
              </button>

              <button
                onClick={startGame}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Mulai Ulang dari Awal</span>
              </button>

              <button
                onClick={() => {
                  setIsPaused(false);
                  setIsPlaying(false);
                  sounds.stopBGM();
                }}
                className="w-full py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <RotateCcw size={16} className="rotate-180" />
                <span>Keluar ke Menu Utama</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {isGameOver && (
        <GameOverModal
          stats={finalStats}
          highScore={highScore}
          isNewHigh={isNewHighScore}
          onRestart={startGame}
          onOpenShop={() => setIsShopOpen(true)}
        />
      )}

      {/* Subway Surfers Character & Outfits Store ("ME") */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        coins={coins}
        keys={keys}
        skins={skins}
        selectedSkinId={selectedSkinId}
        vouchers={vouchers}
        permanentUpgrades={permanentUpgrades}
        powerupLevels={powerupLevels}
        onSelectSkin={handleSelectSkin}
        onBuySkin={handleBuySkin}
        onSelectOutfit={handleSelectOutfit}
        onBuyOutfit={handleBuyOutfit}
        onUpgradeStat={handleUpgradeStat}
        onUnlockVoucherSkin={handleUnlockVoucherSkin}
        onUpgradePowerup={handleUpgradePowerup}
      />

      {/* Daily Missions */}
      <DailyMissionsModal
        isOpen={isMissionsOpen}
        onClose={() => setIsMissionsOpen(false)}
        missions={dailyMissions}
        onClaim={handleClaimMission}
      />

      {/* Global Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}
