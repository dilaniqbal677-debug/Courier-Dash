/**
 * Skin & Character Customizer Shop Tab
 * Features:
 * - 3D Turntable Podium with 360° touch/drag & Next/Prev navigation
 * - Subway Surfers character cards roster with "IN USE" & price badges
 * - Outfit / Costume Selector with live 3D preview & Keys/Coins purchase
 * - Search & Filter by Rarity (Default, Special, Event, Legend, Favorites)
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Check, Lock, Coins, Sparkles, Heart, Search, 
  ChevronUp, ChevronDown, Camera, Star, 
  RotateCw, Award, ChevronLeft, ChevronRight, Key, Zap
} from 'lucide-react';
import { CourierSkin, CourierOutfit } from '../../game/constants';
import { createCourierCharacter, CourierRig } from '../../game/models';
import { sounds } from '../../audio/soundManager';
import confetti from 'canvas-confetti';

interface SkinShopTabProps {
  coins: number;
  keys: number;
  skins: CourierSkin[];
  selectedSkinId: string;
  onSelectSkin: (id: string, outfitId?: string) => void;
  onBuySkin: (skin: CourierSkin) => void;
  onSelectOutfit?: (skinId: string, outfitId: string) => void;
  onBuyOutfit?: (skinId: string, outfitId: string) => void;
}

export const SkinShopTab: React.FC<SkinShopTabProps> = ({
  coins,
  keys,
  skins,
  selectedSkinId,
  onSelectSkin,
  onBuySkin,
  onSelectOutfit,
  onBuyOutfit,
}) => {
  const [previewSkinId, setPreviewSkinId] = useState<string>(selectedSkinId);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState<number>(0);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('subway_skin_favorites');
      return saved ? JSON.parse(saved) : { default: true };
    } catch {
      return { default: true };
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'owned' | 'default' | 'special' | 'event' | 'legend' | 'favorites'>('all');
  const [isGridExpanded, setIsGridExpanded] = useState(false);

  const stageMountRef = useRef<HTMLDivElement>(null);

  const activeSkin = useMemo(() => {
    return skins.find((s) => s.id === previewSkinId) || skins[0];
  }, [skins, previewSkinId]);

  const effectiveSkin = useMemo<CourierSkin>(() => {
    if (activeSkin.outfits && activeSkin.outfits[selectedOutfitIndex]) {
      const outfit = activeSkin.outfits[selectedOutfitIndex];
      return {
        ...activeSkin,
        outfitName: outfit.name,
        activeOutfitId: outfit.id,
        jacketColor: outfit.jacketColor,
        helmetColor: outfit.helmetColor,
        backpackColor: outfit.backpackColor,
        hatType: (outfit.hatType || activeSkin.hatType) as any,
        avatarEmoji: outfit.avatarEmoji || activeSkin.avatarEmoji,
      };
    }
    return activeSkin;
  }, [activeSkin, selectedOutfitIndex]);

  useEffect(() => {
    if (activeSkin.outfits && activeSkin.activeOutfitId) {
      const idx = activeSkin.outfits.findIndex((o) => o.id === activeSkin.activeOutfitId);
      setSelectedOutfitIndex(idx >= 0 ? idx : 0);
    } else {
      setSelectedOutfitIndex(0);
    }
  }, [activeSkin.id, activeSkin.activeOutfitId, activeSkin.outfits]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('subway_skin_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredSkins = useMemo(() => {
    return skins.filter((skin) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        skin.name.toLowerCase().includes(query) ||
        skin.outfitName.toLowerCase().includes(query) ||
        (skin.title && skin.title.toLowerCase().includes(query));
      if (!matchesSearch) return false;

      if (selectedFilter === 'owned') return skin.unlocked;
      if (selectedFilter === 'default') return skin.category === 'Default';
      if (selectedFilter === 'special') return skin.category === 'Special';
      if (selectedFilter === 'event') return skin.category === 'Event';
      if (selectedFilter === 'legend') return skin.category === 'Legend';
      if (selectedFilter === 'favorites') return !!favorites[skin.id];
      return true;
    });
  }, [skins, searchQuery, selectedFilter, favorites]);

  const handleNavigateCharacter = (direction: 'prev' | 'next') => {
    const currentIndex = skins.findIndex((s) => s.id === previewSkinId);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= skins.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = skins.length - 1;

    setPreviewSkinId(skins[nextIndex].id);
    sounds.playSkinSwitch();
  };

  // 3D Turntable Podium
  useEffect(() => {
    if (!stageMountRef.current) return;

    const container = stageMountRef.current;
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 100);
    camera.position.set(0, 1.45, 4.3);
    camera.lookAt(0, 1.1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(2.5, 4.5, 3.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-2.5, 2.5, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfef08a, 1.4);
    rimLight.position.set(0, 3.5, -3.5);
    scene.add(rimLight);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const pedestalGeom = new THREE.CylinderGeometry(1.25, 1.35, 0.14, 36);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.7,
    });
    const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
    pedestal.position.y = -0.07;
    stageGroup.add(pedestal);

    const plateGeom = new THREE.CylinderGeometry(1.18, 1.18, 0.02, 36);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.4,
      metalness: 0.5,
    });
    const plate = new THREE.Mesh(plateGeom, plateMat);
    plate.position.y = 0.01;
    stageGroup.add(plate);

    const courierRig = createCourierCharacter(effectiveSkin);
    courierRig.root.position.set(0, 0.02, 0);
    stageGroup.add(courierRig.root);

    let isDragging = false;
    let prevMouseX = 0;
    let momentum = 0;
    const autoRotateSpeed = 0.4;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      momentum = 0;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      prevMouseX = e.clientX;
      stageGroup.rotation.y += deltaX * 0.018;
      momentum = deltaX * 0.018;
    };
    const onMouseUp = () => { isDragging = false; };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        momentum = 0;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      prevMouseX = e.touches[0].clientX;
      stageGroup.rotation.y += deltaX * 0.018;
      momentum = deltaX * 0.018;
    };
    const onTouchEnd = () => { isDragging = false; };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (!isDragging) {
        if (Math.abs(momentum) > 0.0005) {
          stageGroup.rotation.y += momentum;
          momentum *= 0.92;
        } else {
          stageGroup.rotation.y += autoRotateSpeed * delta * 0.6;
        }
      }

      courierRig.root.position.y = Math.sin(time * 2.8) * 0.035;
      courierRig.headGroup.rotation.y = Math.sin(time * 1.5) * 0.1;
      courierRig.bodyGroup.rotation.z = Math.sin(time * 2.8) * 0.025;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [effectiveSkin]);

  const isSkinEquipped = activeSkin.id === selectedSkinId;
  const currentActiveOutfit = activeSkin.outfits?.[selectedOutfitIndex];
  const isOutfitSelected = activeSkin.activeOutfitId
    ? activeSkin.activeOutfitId === currentActiveOutfit?.id
    : selectedOutfitIndex === 0;

  const isCurrentEquippedAndActive = isSkinEquipped && isOutfitSelected;
  const isUnlocked = activeSkin.unlocked;

  const isOutfitUnlocked = currentActiveOutfit ? currentActiveOutfit.unlocked : true;
  const outfitPrice = currentActiveOutfit?.price || 0;
  const outfitCurrency = currentActiveOutfit?.currency || 'coins';
  const canAffordOutfit = outfitCurrency === 'keys' ? keys >= outfitPrice : coins >= outfitPrice;

  const skinPrice = activeSkin.price;
  const skinCurrency = activeSkin.currency || 'coins';
  const canAffordSkin = skinCurrency === 'keys' ? keys >= skinPrice : coins >= skinPrice;

  const handleAction = () => {
    if (!isUnlocked) {
      if (canAffordSkin) {
        onBuySkin(activeSkin);
        sounds.playUnlockFanfare();
        try {
          confetti({
            particleCount: 90,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#38bdf8', '#f59e0b', '#22c55e', '#ec4899'],
          });
        } catch {}
      }
      return;
    }

    if (currentActiveOutfit && !isOutfitUnlocked) {
      if (canAffordOutfit && onBuyOutfit) {
        onBuyOutfit(activeSkin.id, currentActiveOutfit.id);
        sounds.playUnlockFanfare();
        try {
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#38bdf8', '#f59e0b', '#a855f7'],
          });
        } catch {}
      }
      return;
    }

    if (currentActiveOutfit) {
      if (onSelectOutfit) {
        onSelectOutfit(activeSkin.id, currentActiveOutfit.id);
      }
      onSelectSkin(activeSkin.id, currentActiveOutfit.id);
    } else {
      onSelectSkin(activeSkin.id);
    }
    sounds.playEquipSkin();
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col text-white">
      {/* Top 3D Stage Section */}
      <div className="relative w-full h-[250px] sm:h-[280px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 flex items-center justify-center border-b border-slate-800 shrink-0">
        <div ref={stageMountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Previous / Next Character Arrows */}
        <button
          onClick={() => handleNavigateCharacter('prev')}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg transition active:scale-90 cursor-pointer z-10"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={() => handleNavigateCharacter('next')}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white flex items-center justify-center shadow-lg transition active:scale-90 cursor-pointer z-10"
        >
          <ChevronRight size={22} />
        </button>

        {/* Character Bio Header */}
        <div className="absolute top-3 left-4 text-left pointer-events-none z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
              {activeSkin.category || 'Default'}
            </span>
            {activeSkin.multiplier && (
              <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Zap size={10} />
                +{activeSkin.multiplier}X Multiplier
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1 drop-shadow-md">
            {activeSkin.name}
          </h2>
          <div className="text-xs text-slate-300 font-bold">{effectiveSkin.outfitName}</div>
        </div>

        {/* Favorite Star Button */}
        <button
          onClick={(e) => toggleFavorite(activeSkin.id, e)}
          className="absolute top-3 right-4 w-9 h-9 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center shadow-md transition active:scale-90 cursor-pointer z-10"
        >
          <Star
            size={18}
            className={favorites[activeSkin.id] ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}
          />
        </button>

        {/* Turntable 360 Hint */}
        <div className="absolute bottom-2 left-4 text-[10px] text-slate-400 flex items-center gap-1 pointer-events-none">
          <RotateCw size={11} className="animate-spin text-slate-500" />
          <span>Geser untuk memutar 360°</span>
        </div>
      </div>

      {/* Outfits Selector Bar */}
      {activeSkin.outfits && activeSkin.outfits.length > 0 && (
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2.5 flex items-center gap-3 overflow-x-auto shrink-0">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider shrink-0">OUTFIT:</span>
          <div className="flex items-center gap-2">
            {activeSkin.outfits.map((outfit, index) => {
              const isSelected = selectedOutfitIndex === index;
              return (
                <button
                  key={outfit.id}
                  onClick={() => {
                    setSelectedOutfitIndex(index);
                    sounds.playSkinSwitch();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {!outfit.unlocked && <Lock size={12} className="text-amber-400" />}
                  <span>{outfit.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Action Bar (Select / Buy / Selected) */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-wider">STATUS KARAKTER</div>
          <div className="text-sm sm:text-base font-black text-white">
            {isCurrentEquippedAndActive
              ? '✅ Sedang Digunakan'
              : !isUnlocked
              ? '🔒 Belum Terbuka'
              : !isOutfitUnlocked
              ? '🔒 Outfit Terkunci'
              : 'Siap Dipakai'}
          </div>
        </div>

        <button
          onClick={handleAction}
          disabled={isCurrentEquippedAndActive || (!isUnlocked && !canAffordSkin) || (isUnlocked && !isOutfitUnlocked && !canAffordOutfit)}
          className={`px-6 py-2.5 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 transition active:scale-95 cursor-pointer ${
            isCurrentEquippedAndActive
              ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : !isUnlocked
              ? canAffordSkin
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : !isOutfitUnlocked
              ? canAffordOutfit
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:brightness-110'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:brightness-110'
          }`}
        >
          {isCurrentEquippedAndActive ? (
            <>
              <Check size={16} className="stroke-[3]" />
              <span>DIPAKAI</span>
            </>
          ) : !isUnlocked ? (
            <>
              {skinCurrency === 'keys' ? <Key size={15} /> : <Coins size={15} />}
              <span>BUKA ({skinPrice})</span>
            </>
          ) : !isOutfitUnlocked ? (
            <>
              {outfitCurrency === 'keys' ? <Key size={15} /> : <Coins size={15} />}
              <span>BELI OUTFIT ({outfitPrice})</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>PAKAI SEKARANG</span>
            </>
          )}
        </button>
      </div>

      {/* Characters Grid Roster Section */}
      <div className="p-4 flex flex-col gap-3">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari karakter kurir..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'owned', 'default', 'special', 'legend', 'favorites'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 border ${
                  selectedFilter === filter
                    ? 'bg-sky-600 border-sky-400 text-white shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {filter === 'owned' ? 'Milik Saya' : filter}
              </button>
            ))}
          </div>
        </div>

        {/* Roster Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-1">
          {filteredSkins.map((skin) => {
            const isSelected = skin.id === previewSkinId;
            const isEquipped = skin.id === selectedSkinId;

            return (
              <div
                key={skin.id}
                onClick={() => {
                  setPreviewSkinId(skin.id);
                  sounds.playSkinSwitch();
                }}
                className={`rounded-2xl p-3 border-2 transition-all flex flex-col items-center text-center cursor-pointer relative shadow-md ${
                  isSelected
                    ? 'bg-sky-950/70 border-sky-400 ring-2 ring-sky-400/30'
                    : skin.unlocked
                    ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/80 border-slate-800/80 opacity-80'
                }`}
              >
                {/* Roster Avatar / Icon */}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20 mb-2 relative"
                  style={{ backgroundColor: skin.jacketColor }}
                >
                  <span>{skin.avatarEmoji || '📦'}</span>
                  {!skin.unlocked && (
                    <div className="absolute inset-0 bg-slate-950/70 rounded-2xl flex items-center justify-center">
                      <Lock size={16} className="text-amber-400" />
                    </div>
                  )}
                </div>

                <div className="text-xs font-black text-white truncate w-full">{skin.name}</div>
                <div className="text-[10px] text-slate-400 font-bold truncate w-full mt-0.5">{skin.outfitName}</div>

                {/* Status Badges */}
                <div className="mt-2 w-full flex items-center justify-center gap-1">
                  {isEquipped ? (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      DIPAKAI
                    </span>
                  ) : !skin.unlocked ? (
                    <span className="text-[9px] font-black text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Coins size={10} />
                      {skin.price}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                      TERBUKA
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
